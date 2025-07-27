const express = require('express');
const Joi = require('joi');

const { runQuery, getQuery, allQuery } = require('../config/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Esquemas de validación
const progressSchema = Joi.object({
  page_id: Joi.string().required(),
  section_id: Joi.string().allow(''),
  progress_data: Joi.object().default({})
});

// === RUTAS DE PROGRESO ===

// Obtener progreso completo del usuario
router.get('/user-progress', optionalAuth, async (req, res) => {
  try {
    let progress = {};
    
    if (req.user) {
      // Usuario autenticado: obtener desde base de datos
      const userProgress = await allQuery(`
        SELECT page_id, section_id, completed_at, progress_data
        FROM user_progress 
        WHERE user_id = ?
        ORDER BY completed_at DESC
      `, [req.user.id]);

      userProgress.forEach(p => {
        if (!progress[p.page_id]) {
          progress[p.page_id] = {
            completed: true,
            completedAt: p.completed_at,
            sections: {}
          };
        }

        if (p.section_id) {
          progress[p.page_id].sections[p.section_id] = {
            completed: true,
            completedAt: p.completed_at,
            data: p.progress_data ? JSON.parse(p.progress_data) : {}
          };
        }
      });

      // Estadísticas adicionales
      const stats = await getQuery(`
        SELECT 
          COUNT(DISTINCT page_id) as completed_pages,
          COUNT(DISTINCT CASE WHEN section_id IS NOT NULL THEN section_id END) as completed_sections,
          MIN(completed_at) as first_completion,
          MAX(completed_at) as last_activity
        FROM user_progress 
        WHERE user_id = ?
      `, [req.user.id]);

      res.json({
        progress,
        stats: stats || {}
      });

    } else {
      // Usuario no autenticado: obtener desde cookies
      const cookieProgress = req.cookies.user_progress;
      
      if (cookieProgress) {
        try {
          progress = JSON.parse(cookieProgress);
        } catch (err) {
          console.error('Error parsing progress cookie:', err);
          progress = {};
        }
      }

      res.json({
        progress,
        stats: generateStatsFromCookie(progress)
      });
    }

  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({ error: 'Error al cargar el progreso' });
  }
});

// Marcar página/sección como completada
router.post('/complete', optionalAuth, async (req, res) => {
  try {
    const { error, value } = progressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Datos de progreso inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }

    const { page_id, section_id, progress_data } = value;

    if (req.user) {
      // Usuario autenticado: guardar en base de datos
      await runQuery(`
        INSERT OR REPLACE INTO user_progress (user_id, page_id, section_id, progress_data)
        VALUES (?, ?, ?, ?)
      `, [req.user.id, page_id, section_id || null, JSON.stringify(progress_data)]);

    } else {
      // Usuario no autenticado: guardar en cookie
      let cookieProgress = {};
      
      if (req.cookies.user_progress) {
        try {
          cookieProgress = JSON.parse(req.cookies.user_progress);
        } catch (err) {
          console.error('Error parsing existing progress cookie:', err);
        }
      }

      // Actualizar progreso en cookie
      if (!cookieProgress[page_id]) {
        cookieProgress[page_id] = {
          completed: false,
          sections: {}
        };
      }

      if (section_id) {
        cookieProgress[page_id].sections[section_id] = {
          completed: true,
          completedAt: new Date().toISOString(),
          data: progress_data
        };
      } else {
        cookieProgress[page_id].completed = true;
        cookieProgress[page_id].completedAt = new Date().toISOString();
      }

      // Configurar cookie con progreso actualizado
      res.cookie('user_progress', JSON.stringify(cookieProgress), {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 año
        httpOnly: false, // Permitir acceso desde JS para que el frontend lo pueda leer
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    res.json({ 
      message: 'Progreso guardado exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al guardar progreso:', error);
    res.status(500).json({ error: 'Error al guardar el progreso' });
  }
});

// Obtener progreso de una página específica
router.get('/page/:pageId', optionalAuth, async (req, res) => {
  try {
    const { pageId } = req.params;

    let pageProgress = {
      completed: false,
      sections: {}
    };

    if (req.user) {
      // Usuario autenticado
      const progress = await allQuery(`
        SELECT section_id, completed_at, progress_data
        FROM user_progress 
        WHERE user_id = ? AND page_id = ?
      `, [req.user.id, pageId]);

      progress.forEach(p => {
        if (p.section_id) {
          pageProgress.sections[p.section_id] = {
            completed: true,
            completedAt: p.completed_at,
            data: p.progress_data ? JSON.parse(p.progress_data) : {}
          };
        } else {
          pageProgress.completed = true;
          pageProgress.completedAt = p.completed_at;
        }
      });

    } else {
      // Usuario no autenticado
      const cookieProgress = req.cookies.user_progress;
      
      if (cookieProgress) {
        try {
          const progress = JSON.parse(cookieProgress);
          pageProgress = progress[pageId] || pageProgress;
        } catch (err) {
          console.error('Error parsing progress cookie:', err);
        }
      }
    }

    res.json(pageProgress);

  } catch (error) {
    console.error('Error al obtener progreso de página:', error);
    res.status(500).json({ error: 'Error al cargar el progreso de la página' });
  }
});

// Resetear progreso de usuario
router.delete('/reset', requireAuth, async (req, res) => {
  try {
    await runQuery('DELETE FROM user_progress WHERE user_id = ?', [req.user.id]);
    
    res.json({ message: 'Progreso reseteado exitosamente' });

  } catch (error) {
    console.error('Error al resetear progreso:', error);
    res.status(500).json({ error: 'Error al resetear el progreso' });
  }
});

// Migrar progreso de cookie a base de datos (cuando usuario se registra/loguea)
router.post('/migrate-from-cookie', requireAuth, async (req, res) => {
  try {
    const cookieProgress = req.cookies.user_progress;
    
    if (!cookieProgress) {
      return res.json({ message: 'No hay progreso en cookie para migrar' });
    }

    let progress;
    try {
      progress = JSON.parse(cookieProgress);
    } catch (err) {
      return res.status(400).json({ error: 'Cookie de progreso inválida' });
    }

    let migratedCount = 0;

    // Migrar cada página/sección
    for (const [pageId, pageData] of Object.entries(progress)) {
      // Migrar progreso de página completa
      if (pageData.completed) {
        try {
          await runQuery(`
            INSERT OR IGNORE INTO user_progress (user_id, page_id, section_id, progress_data)
            VALUES (?, ?, NULL, '{}')
          `, [req.user.id, pageId]);
          migratedCount++;
        } catch (err) {
          console.error('Error migrando página:', pageId, err);
        }
      }

      // Migrar progreso de secciones
      if (pageData.sections) {
        for (const [sectionId, sectionData] of Object.entries(pageData.sections)) {
          if (sectionData.completed) {
            try {
              await runQuery(`
                INSERT OR IGNORE INTO user_progress (user_id, page_id, section_id, progress_data)
                VALUES (?, ?, ?, ?)
              `, [req.user.id, pageId, sectionId, JSON.stringify(sectionData.data || {})]);
              migratedCount++;
            } catch (err) {
              console.error('Error migrando sección:', pageId, sectionId, err);
            }
          }
        }
      }
    }

    // Limpiar cookie después de migrar
    res.clearCookie('user_progress');

    res.json({ 
      message: 'Progreso migrado exitosamente',
      migratedItems: migratedCount
    });

  } catch (error) {
    console.error('Error al migrar progreso:', error);
    res.status(500).json({ error: 'Error al migrar el progreso' });
  }
});

// === ESTADÍSTICAS Y ANALYTICS ===

// Obtener estadísticas globales de progreso
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await getQuery(`
      SELECT 
        COUNT(DISTINCT user_id) as total_active_users,
        COUNT(DISTINCT page_id) as total_pages_with_progress,
        COUNT(*) as total_completions,
        AVG(CASE WHEN section_id IS NULL THEN 1 ELSE 0 END) as avg_page_completion_rate
      FROM user_progress
    `);

    // Páginas más populares
    const popularPages = await allQuery(`
      SELECT page_id, COUNT(DISTINCT user_id) as unique_users, COUNT(*) as total_completions
      FROM user_progress 
      GROUP BY page_id 
      ORDER BY unique_users DESC 
      LIMIT 10
    `);

    // Actividad reciente
    const recentActivity = await allQuery(`
      SELECT DATE(completed_at) as date, COUNT(*) as completions
      FROM user_progress 
      WHERE completed_at >= datetime('now', '-30 days')
      GROUP BY DATE(completed_at)
      ORDER BY date DESC
    `);

    res.json({
      overview: stats,
      popularPages,
      recentActivity
    });

  } catch (error) {
    console.error('Error al obtener estadísticas globales:', error);
    res.status(500).json({ error: 'Error al cargar estadísticas' });
  }
});

// Obtener ranking de usuarios por progreso
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const leaderboard = await allQuery(`
      SELECT 
        u.username,
        COUNT(DISTINCT up.page_id) as completed_pages,
        COUNT(DISTINCT CASE WHEN up.section_id IS NOT NULL THEN up.section_id END) as completed_sections,
        COUNT(DISTINCT cs.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN cs.status = 'accepted' THEN cs.exercise_id END) as solved_exercises,
        MAX(up.completed_at) as last_activity
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN code_submissions cs ON u.id = cs.user_id
      WHERE u.is_active = 1 AND u.role = 'student'
      GROUP BY u.id, u.username
      HAVING completed_pages > 0 OR solved_exercises > 0
      ORDER BY completed_pages DESC, solved_exercises DESC, completed_sections DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json(leaderboard);

  } catch (error) {
    console.error('Error al obtener leaderboard:', error);
    res.status(500).json({ error: 'Error al cargar el ranking' });
  }
});

// === UTILIDADES ===

function generateStatsFromCookie(progress) {
  let completedPages = 0;
  let completedSections = 0;
  let firstCompletion = null;
  let lastActivity = null;

  for (const [pageId, pageData] of Object.entries(progress)) {
    if (pageData.completed) {
      completedPages++;
      
      if (pageData.completedAt) {
        const date = new Date(pageData.completedAt);
        if (!firstCompletion || date < firstCompletion) {
          firstCompletion = date;
        }
        if (!lastActivity || date > lastActivity) {
          lastActivity = date;
        }
      }
    }

    if (pageData.sections) {
      for (const [sectionId, sectionData] of Object.entries(pageData.sections)) {
        if (sectionData.completed) {
          completedSections++;
          
          if (sectionData.completedAt) {
            const date = new Date(sectionData.completedAt);
            if (!firstCompletion || date < firstCompletion) {
              firstCompletion = date;
            }
            if (!lastActivity || date > lastActivity) {
              lastActivity = date;
            }
          }
        }
      }
    }
  }

  return {
    completed_pages: completedPages,
    completed_sections: completedSections,
    first_completion: firstCompletion ? firstCompletion.toISOString() : null,
    last_activity: lastActivity ? lastActivity.toISOString() : null
  };
}

module.exports = router; 