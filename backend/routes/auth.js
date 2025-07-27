const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

const { runQuery, getQuery, allQuery } = require('../config/database');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP cada 15 minutos
  message: {
    error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Esquemas de validación
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().default(false)
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

// === RUTAS PÚBLICAS ===

// Verificar estado de autenticación
router.get('/status', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Registro de nuevos usuarios
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Datos de registro inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }

    const { username, email, password } = value;

    // Verificar si el usuario ya existe
    const existingUser = await getQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Usuario ya existe', 
        message: 'El nombre de usuario o email ya están registrados' 
      });
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear nuevo usuario
    const result = await runQuery(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, 'student')
    `, [username, email, passwordHash]);

    // Iniciar sesión automáticamente
    req.session.userId = result.id;
    req.session.username = username;

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: result.id,
        username,
        email,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Datos de login inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }

    const { username, password, rememberMe } = value;

    // Buscar usuario por username o email
    const user = await getQuery(`
      SELECT id, username, email, password_hash, role, is_active 
      FROM users 
      WHERE (username = ? OR email = ?) AND is_active = 1
    `, [username, username]);

    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas', 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas', 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    // Configurar sesión
    req.session.userId = user.id;
    req.session.username = user.username;

    // Si "Remember Me" está activado, extender la duración de la cookie
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    }

    // Actualizar último login
    await runQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }

    res.clearCookie('connect.sid'); // Nombre por defecto de la cookie de sesión
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
});

// === RUTAS PROTEGIDAS ===

// Obtener perfil del usuario actual
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await getQuery(`
      SELECT id, username, email, role, created_at, last_login,
             (SELECT COUNT(*) FROM user_progress WHERE user_id = ?) as completed_lessons,
             (SELECT COUNT(*) FROM code_submissions WHERE user_id = ? AND status = 'accepted') as solved_exercises
      FROM users 
      WHERE id = ?
    `, [req.user.id, req.user.id, req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al cargar el perfil' });
  }
});

// Actualizar perfil
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Verificar formato de email
    const emailSchema = Joi.string().email();
    const { error } = emailSchema.validate(email);
    if (error) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Verificar que el email no esté en uso por otro usuario
    const existingUser = await getQuery(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email ya en uso', 
        message: 'Ese email ya está registrado por otro usuario' 
      });
    }

    // Actualizar email
    await runQuery(
      'UPDATE users SET email = ? WHERE id = ?',
      [email, req.user.id]
    );

    res.json({ message: 'Perfil actualizado exitosamente' });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

// Cambiar contraseña
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.details.map(detail => detail.message) 
      });
    }

    const { currentPassword, newPassword } = value;

    // Obtener contraseña actual
    const user = await getQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ 
        error: 'Contraseña incorrecta', 
        message: 'La contraseña actual es incorrecta' 
      });
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await runQuery(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Contraseña cambiada exitosamente' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
});

// === RUTAS ADMINISTRATIVAS ===

// Listar todos los usuarios (solo admin)
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await allQuery(`
      SELECT u.id, u.username, u.email, u.role, u.created_at, u.last_login, u.is_active,
             COUNT(DISTINCT up.id) as completed_lessons,
             COUNT(DISTINCT cs.id) as total_submissions,
             COUNT(DISTINCT CASE WHEN cs.status = 'accepted' THEN cs.id END) as solved_exercises
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN code_submissions cs ON u.id = cs.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Contar total de usuarios
    const totalResult = await getQuery('SELECT COUNT(*) as total FROM users');
    const total = totalResult.total;

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al cargar los usuarios' });
  }
});

// Cambiar rol de usuario (solo admin)
router.put('/users/:userId/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Rol inválido', 
        message: 'El rol debe ser "student" o "admin"' 
      });
    }

    // No permitir que el admin se quite sus propios permisos
    if (parseInt(userId) === req.user.id && role !== 'admin') {
      return res.status(400).json({ 
        error: 'Acción no permitida', 
        message: 'No puedes cambiar tu propio rol de administrador' 
      });
    }

    const result = await runQuery(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Rol actualizado exitosamente' });

  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ error: 'Error al cambiar el rol' });
  }
});

// Activar/desactivar usuario (solo admin)
router.put('/users/:userId/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ 
        error: 'Estado inválido', 
        message: 'is_active debe ser true o false' 
      });
    }

    // No permitir que el admin se desactive a sí mismo
    if (parseInt(userId) === req.user.id && !is_active) {
      return res.status(400).json({ 
        error: 'Acción no permitida', 
        message: 'No puedes desactivar tu propia cuenta' 
      });
    }

    const result = await runQuery(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [is_active, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      message: `Usuario ${is_active ? 'activado' : 'desactivado'} exitosamente` 
    });

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: 'Error al cambiar el estado del usuario' });
  }
});

module.exports = router; 