const express = require('express');
const multer = require('multer');
const { marked } = require('marked');
const hljs = require('highlight.js');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const { runQuery, getQuery, allQuery } = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configurar marked para resaltado de sintaxis y extensiones
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('Error al resaltar código:', err);
      }
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
  tables: true,
  smartLists: true,
  smartypants: true
});

// Configurar multer para subida de archivos con soporte múltiple
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/markdown');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const uniqueId = uuidv4().slice(0, 8);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${timestamp}-${uniqueId}-${sanitizedName}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB límite
    files: 10 // máximo 10 archivos por request
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'text/markdown',
      'text/plain',
      'application/octet-stream' // Para archivos .md sin mime type correcto
    ];
    
    const allowedExtensions = ['.md', '.markdown', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Solo se permiten archivos Markdown (.md, .markdown). Recibido: ${file.originalname}`));
    }
  }
});

// Esquemas de validación mejorados
const pageSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  category_id: Joi.string().allow(''),
  order_index: Joi.number().integer().min(0).default(0),
  is_published: Joi.boolean().default(true)
});

const sectionSchema = Joi.object({
  id: Joi.string().required(),
  page_id: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  content_type: Joi.string().valid('markdown', 'html').default('markdown'),
  order_index: Joi.number().integer().min(0).default(0)
});

const categorySchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  order_index: Joi.number().integer().min(0).default(0)
});

// === UTILIDADES PARA PROCESAMIENTO DE MARKDOWN ===

// Función para extraer metadatos del frontmatter YAML
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (match) {
    try {
      const frontmatter = match[1];
      const body = match[2];
      
      // Parser simple de YAML para metadatos básicos
      const metadata = {};
      frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
          metadata[key.trim()] = value;
        }
      });
      
      return { metadata, content: body };
    } catch (err) {
      console.warn('Error parsing frontmatter:', err);
      return { metadata: {}, content };
    }
  }
  
  return { metadata: {}, content };
}

// Función para dividir contenido en secciones automáticamente
function autoSplitIntoSections(content, fileName) {
  const sections = [];
  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    // Detectar headers (# ## ###)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headerMatch) {
      // Guardar sección anterior si existe
      if (currentSection) {
        sections.push({
          id: `section-${Date.now()}-${sections.length}`,
          title: currentSection,
          content: currentContent.join('\n').trim()
        });
      }
      
      // Iniciar nueva sección
      currentSection = headerMatch[2];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  // Agregar última sección
  if (currentSection) {
    sections.push({
      id: `section-${Date.now()}-${sections.length}`,
      title: currentSection,
      content: currentContent.join('\n').trim()
    });
  }
  
  // Si no hay secciones, crear una con todo el contenido
  if (sections.length === 0) {
    sections.push({
      id: 'main-content',
      title: fileName.replace(/\.[^/.]+$/, '') || 'Contenido principal',
      content: content.trim()
    });
  }
  
  return sections;
}

// Función para procesar múltiples archivos markdown
async function processMarkdownFiles(files, options = {}) {
  const results = [];
  
  for (const file of files) {
    try {
      const content = await fs.readFile(file.path, 'utf8');
      const { metadata, content: cleanContent } = extractFrontmatter(content);
      
      // Convertir a HTML
      const htmlContent = marked(cleanContent);
      
      // Auto-dividir en secciones si está habilitado
      const sections = options.autoSplit 
        ? autoSplitIntoSections(cleanContent, file.originalname)
        : [{
            id: 'main-content',
            title: metadata.title || file.originalname.replace(/\.[^/.]+$/, ''),
            content: cleanContent
          }];
      
      results.push({
        file: file,
        metadata: metadata,
        content: cleanContent,
        htmlContent: htmlContent,
        sections: sections,
        success: true
      });
      
    } catch (error) {
      results.push({
        file: file,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
}

// === RUTAS DE CONTENIDO (las existentes) ===
// [Las rutas existentes se mantienen igual hasta la línea de subida de archivos]

// Obtener toda la estructura de contenido
router.get('/content', async (req, res) => {
  try {
    // Obtener categorías
    const categories = await allQuery(`
      SELECT * FROM navigation_categories 
      WHERE is_active = 1 
      ORDER BY order_index, title
    `);

    // Obtener páginas agrupadas por categoría
    const pages = await allQuery(`
      SELECT * FROM content_pages 
      WHERE is_published = 1 
      ORDER BY order_index, title
    `);

    // Obtener secciones
    const sections = await allQuery(`
      SELECT * FROM content_sections 
      ORDER BY page_id, order_index
    `);

    // Construir estructura de navegación
    const navigationSections = categories.map(category => ({
      id: category.id,
      title: category.title,
      items: pages
        .filter(page => page.category_id === category.id)
        .map(page => ({
          id: page.id,
          title: page.title
        }))
    }));

    // Construir contenido de páginas
    const pageContent = {};
    pages.forEach(page => {
      const pageSections = sections
        .filter(section => section.page_id === page.id)
        .map(section => ({
          id: section.id,
          title: section.title,
          content: section.content
        }));

      pageContent[page.id] = {
        title: page.title,
        sections: pageSections
      };
    });

    // Construir guía de aprendizaje (orden secuencial)
    const learningGuide = pages
      .sort((a, b) => a.order_index - b.order_index)
      .map((page, index) => ({
        id: page.id,
        title: page.title,
        order: index + 1
      }));

    res.json({
      navigationSections,
      pageContent,
      learningGuide
    });

  } catch (error) {
    console.error('Error al obtener contenido:', error);
    res.status(500).json({ error: 'Error al cargar el contenido' });
  }
});

// Obtener una página específica
router.get('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;

    const page = await getQuery(
      'SELECT * FROM content_pages WHERE id = ?',
      [pageId]
    );

    if (!page) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    const sections = await allQuery(
      'SELECT * FROM content_sections WHERE page_id = ? ORDER BY order_index',
      [pageId]
    );

    res.json({
      ...page,
      sections: sections.map(section => ({
        id: section.id,
        title: section.title,
        content: section.content,
        content_type: section.content_type
      }))
    });

  } catch (error) {
    console.error('Error al obtener página:', error);
    res.status(500).json({ error: 'Error al cargar la página' });
  }
});

// === RUTAS ADMINISTRATIVAS (requieren autenticación) ===

// Crear nueva página
router.post('/pages', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { error, value } = pageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id, title, description, category_id, order_index } = value;

    // Verificar que la página no existe
    const existing = await getQuery('SELECT id FROM content_pages WHERE id = ?', [id]);
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una página con ese ID' });
    }

    await runQuery(`
      INSERT INTO content_pages (id, title, description, category_id, order_index)
      VALUES (?, ?, ?, ?, ?)
    `, [id, title, description || null, category_id || null, order_index]);

    res.status(201).json({ message: 'Página creada exitosamente', id });

  } catch (error) {
    console.error('Error al crear página:', error);
    res.status(500).json({ error: 'Error al crear la página' });
  }
});

// Actualizar página
router.put('/pages/:pageId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { title, description, category_id, order_index } = req.body;

    const page = await getQuery('SELECT id FROM content_pages WHERE id = ?', [pageId]);
    if (!page) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    await runQuery(`
      UPDATE content_pages 
      SET title = ?, description = ?, category_id = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, description, category_id, order_index, pageId]);

    res.json({ message: 'Página actualizada exitosamente' });

  } catch (error) {
    console.error('Error al actualizar página:', error);
    res.status(500).json({ error: 'Error al actualizar la página' });
  }
});

// Eliminar página
router.delete('/pages/:pageId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { pageId } = req.params;

    const result = await runQuery('DELETE FROM content_pages WHERE id = ?', [pageId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    res.json({ message: 'Página eliminada exitosamente' });

  } catch (error) {
    console.error('Error al eliminar página:', error);
    res.status(500).json({ error: 'Error al eliminar la página' });
  }
});

// Crear nueva sección
router.post('/sections', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { error, value } = sectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id, page_id, title, content, order_index } = value;

    // Verificar que la página existe
    const page = await getQuery('SELECT id FROM content_pages WHERE id = ?', [page_id]);
    if (!page) {
      return res.status(400).json({ error: 'La página especificada no existe' });
    }

    await runQuery(`
      INSERT INTO content_sections (id, page_id, title, content, order_index)
      VALUES (?, ?, ?, ?, ?)
    `, [id, page_id, title, content, order_index]);

    res.status(201).json({ message: 'Sección creada exitosamente', id });

  } catch (error) {
    console.error('Error al crear sección:', error);
    res.status(500).json({ error: 'Error al crear la sección' });
  }
});

// Actualizar sección
router.put('/sections/:sectionId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { title, content, order_index } = req.body;

    const section = await getQuery('SELECT id FROM content_sections WHERE id = ?', [sectionId]);
    if (!section) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }

    await runQuery(`
      UPDATE content_sections 
      SET title = ?, content = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, content, order_index, sectionId]);

    res.json({ message: 'Sección actualizada exitosamente' });

  } catch (error) {
    console.error('Error al actualizar sección:', error);
    res.status(500).json({ error: 'Error al actualizar la sección' });
  }
});

// Eliminar sección
router.delete('/sections/:sectionId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sectionId } = req.params;

    const result = await runQuery('DELETE FROM content_sections WHERE id = ?', [sectionId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }

    res.json({ message: 'Sección eliminada exitosamente' });

  } catch (error) {
    console.error('Error al eliminar sección:', error);
    res.status(500).json({ error: 'Error al eliminar la sección' });
  }
});

// === GESTIÓN DE CATEGORÍAS ===

// Obtener todas las categorías
router.get('/categories', async (req, res) => {
  try {
    const categories = await allQuery(`
      SELECT * FROM navigation_categories 
      WHERE is_active = 1 
      ORDER BY order_index, title
    `);
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al cargar las categorías' });
  }
});

// Crear categoría
router.post('/categories', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id, title, description, order_index } = value;

    const existing = await getQuery('SELECT id FROM navigation_categories WHERE id = ?', [id]);
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese ID' });
    }

    await runQuery(`
      INSERT INTO navigation_categories (id, title, description, order_index)
      VALUES (?, ?, ?, ?)
    `, [id, title, description || null, order_index]);

    res.status(201).json({ message: 'Categoría creada exitosamente', id });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
});

// === SUBIDA DE ARCHIVOS MARKDOWN ===

// Subir múltiples archivos Markdown con procesamiento avanzado
router.post('/upload-markdown', requireAuth, requireAdmin, upload.array('markdown', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se han subido archivos' });
    }

    const { 
      page_id, 
      category_id, 
      auto_split = false, 
      create_pages = false,
      section_prefix = ''
    } = req.body;

    console.log('Procesando archivos markdown:', req.files.map(f => f.originalname));

    // Opciones de procesamiento
    const options = {
      autoSplit: auto_split === 'true',
      createPages: create_pages === 'true',
      pageId: page_id,
      categoryId: category_id,
      sectionPrefix: section_prefix
    };

    // Procesar todos los archivos
    const results = await processMarkdownFiles(req.files, options);
    
    const successfulFiles = results.filter(r => r.success);
    const failedFiles = results.filter(r => !r.success);
    
    let createdPages = 0;
    let createdSections = 0;
    
    // Procesar archivos exitosos
    for (const result of successfulFiles) {
      try {
        if (options.createPages) {
          // Crear nueva página por cada archivo
          const pageId = result.metadata.slug || 
                        result.file.originalname.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-');
          
          const pageTitle = result.metadata.title || 
                           result.file.originalname.replace(/\.[^/.]+$/, '');
          
          // Verificar si la página ya existe
          const existingPage = await getQuery('SELECT id FROM content_pages WHERE id = ?', [pageId]);
          
          if (!existingPage) {
            await runQuery(`
              INSERT INTO content_pages (id, title, description, category_id, order_index)
              VALUES (?, ?, ?, ?, ?)
            `, [
              pageId, 
              pageTitle, 
              result.metadata.description || '', 
              options.categoryId || null, 
              parseInt(result.metadata.order) || 0
            ]);
            createdPages++;
          }
          
          // Crear secciones para esta página
          for (const [index, section] of result.sections.entries()) {
            const sectionId = `${pageId}-section-${index + 1}`;
            
            await runQuery(`
              INSERT OR REPLACE INTO content_sections (id, page_id, title, content, content_type, order_index)
              VALUES (?, ?, ?, ?, 'markdown', ?)
            `, [sectionId, pageId, section.title, section.content, index]);
            
            createdSections++;
          }
          
        } else if (options.pageId) {
          // Agregar secciones a página existente
          for (const [index, section] of result.sections.entries()) {
            const sectionId = `section-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
            const sectionTitle = options.sectionPrefix ? 
              `${options.sectionPrefix} ${section.title}` : 
              section.title;
            
            await runQuery(`
              INSERT INTO content_sections (id, page_id, title, content, content_type, order_index)
              VALUES (?, ?, ?, ?, 'markdown', ?)
            `, [sectionId, options.pageId, sectionTitle, section.content, index]);
            
            createdSections++;
          }
        }
        
        // Registrar archivo subido en la base de datos
        await runQuery(`
          INSERT INTO uploaded_files (id, original_name, filename, file_path, mime_type, size, uploaded_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          result.file.originalname,
          result.file.filename,
          result.file.path,
          result.file.mimetype,
          result.file.size,
          req.user.id
        ]);
        
      } catch (dbError) {
        console.error('Error guardando en base de datos:', dbError);
        failedFiles.push({
          file: result.file,
          error: `Error en base de datos: ${dbError.message}`,
          success: false
        });
      }
    }

    // Limpiar archivos temporales
    for (const file of req.files) {
      try {
        await fs.unlink(file.path);
      } catch (cleanupError) {
        console.warn('Error limpiando archivo temporal:', cleanupError);
      }
    }

    res.json({
      message: 'Procesamiento de archivos Markdown completado',
      summary: {
        totalFiles: req.files.length,
        successfulFiles: successfulFiles.length,
        failedFiles: failedFiles.length,
        createdPages,
        createdSections
      },
      results: {
        successful: successfulFiles.map(r => ({
          filename: r.file.originalname,
          metadata: r.metadata,
          sectionsCount: r.sections.length
        })),
        failed: failedFiles.map(r => ({
          filename: r.file.originalname,
          error: r.error
        }))
      }
    });

  } catch (error) {
    console.error('Error al procesar archivos Markdown:', error);
    
    // Limpiar archivos temporales en caso de error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.warn('Error limpiando archivo temporal:', cleanupError);
        }
      }
    }
    
    res.status(500).json({ error: 'Error al procesar los archivos Markdown' });
  }
});

// Procesar contenido markdown desde texto (mejorado)
router.post('/convert-markdown', async (req, res) => {
  try {
    const { markdown, options = {} } = req.body;

    if (!markdown) {
      return res.status(400).json({ error: 'Contenido Markdown requerido' });
    }

    // Extraer metadatos si los hay
    const { metadata, content } = extractFrontmatter(markdown);
    
    // Convertir a HTML
    const html = marked(content);
    
    // Auto-dividir en secciones si se solicita
    const sections = options.autoSplit ? 
      autoSplitIntoSections(content, 'content') : 
      null;

    res.json({ 
      html, 
      metadata, 
      sections,
      originalContent: content
    });

  } catch (error) {
    console.error('Error al convertir Markdown:', error);
    res.status(500).json({ error: 'Error al convertir el Markdown' });
  }
});

// Obtener archivos subidos recientes (admin)
router.get('/uploaded-files', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const files = await allQuery(`
      SELECT uf.*, u.username as uploaded_by_name
      FROM uploaded_files uf
      LEFT JOIN users u ON uf.uploaded_by = u.id
      ORDER BY uf.uploaded_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    const totalFiles = await getQuery('SELECT COUNT(*) as count FROM uploaded_files');

    res.json({
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFiles.count,
        totalPages: Math.ceil(totalFiles.count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener archivos subidos:', error);
    res.status(500).json({ error: 'Error al cargar la lista de archivos' });
  }
});

// Eliminar archivo subido (admin)
router.delete('/uploaded-files/:fileId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await getQuery('SELECT * FROM uploaded_files WHERE id = ?', [fileId]);
    
    if (!file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Eliminar archivo físico si existe
    try {
      await fs.unlink(file.file_path);
    } catch (fsError) {
      console.warn('Archivo físico no encontrado:', fsError);
    }

    // Eliminar registro de base de datos
    await runQuery('DELETE FROM uploaded_files WHERE id = ?', [fileId]);

    res.json({ message: 'Archivo eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo' });
  }
});

// Descargar archivo markdown original
router.get('/download/:fileId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await getQuery('SELECT * FROM uploaded_files WHERE id = ?', [fileId]);
    
    if (!file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Verificar que el archivo existe
    const exists = await fs.pathExists(file.file_path);
    if (!exists) {
      return res.status(404).json({ error: 'Archivo físico no encontrado' });
    }

    res.download(file.file_path, file.original_name);

  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({ error: 'Error al descargar el archivo' });
  }
});

// === EXPORTAR/IMPORTAR CONTENIDO ===

// Exportar todo el contenido
router.get('/export', requireAuth, requireAdmin, async (req, res) => {
  try {
    const categories = await allQuery('SELECT * FROM navigation_categories ORDER BY order_index');
    const pages = await allQuery('SELECT * FROM content_pages ORDER BY order_index');
    const sections = await allQuery('SELECT * FROM content_sections ORDER BY page_id, order_index');

    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      categories,
      pages,
      sections
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=cpc-content-export.json');
    res.json(exportData);

  } catch (error) {
    console.error('Error al exportar contenido:', error);
    res.status(500).json({ error: 'Error al exportar el contenido' });
  }
});

// Importar contenido
router.post('/import', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { categories, pages, sections } = req.body;

    if (!pages || !sections) {
      return res.status(400).json({ error: 'Datos de importación inválidos' });
    }

    // Importar categorías si se proporcionan
    if (categories && Array.isArray(categories)) {
      for (const category of categories) {
        await runQuery(`
          INSERT OR REPLACE INTO navigation_categories (id, title, description, order_index, is_active)
          VALUES (?, ?, ?, ?, ?)
        `, [category.id, category.title, category.description, category.order_index, category.is_active]);
      }
    }

    // Importar páginas
    for (const page of pages) {
      await runQuery(`
        INSERT OR REPLACE INTO content_pages (id, title, description, order_index, category_id, is_published)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [page.id, page.title, page.description, page.order_index, page.category_id, page.is_published]);
    }

    // Importar secciones
    for (const section of sections) {
      await runQuery(`
        INSERT OR REPLACE INTO content_sections (id, page_id, title, content, content_type, order_index)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [section.id, section.page_id, section.title, section.content, section.content_type, section.order_index]);
    }

    res.json({ message: 'Contenido importado exitosamente' });

  } catch (error) {
    console.error('Error al importar contenido:', error);
    res.status(500).json({ error: 'Error al importar el contenido' });
  }
});

module.exports = router; 