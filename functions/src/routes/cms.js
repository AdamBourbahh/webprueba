const express = require('express');
const { firestoreHelpers } = require('../config/firestore');
const router = express.Router();

// GET /content - Obtener estructura completa de contenido
router.get('/content', async (req, res) => {
  try {
    // Obtener categorías ordenadas
    const categories = await firestoreHelpers.getCollection(
      'content_categories', 
      { field: 'is_active', operator: '==', value: true }, 
      { field: 'order_index' }
    );

    // Obtener páginas publicadas
    const pages = await firestoreHelpers.getCollection(
      'content_pages',
      { field: 'is_published', operator: '==', value: true },
      { field: 'order_index' }
    );

    // Obtener todas las secciones
    const sections = await firestoreHelpers.getCollection(
      'content_sections',
      null,
      { field: 'order_index' }
    );

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
        .sort((a, b) => a.order_index - b.order_index)
        .map(section => ({
          id: section.id,
          title: section.title,
          content: section.content
        }));

      pageContent[page.id] = {
        title: page.title,
        description: page.description,
        sections: pageSections
      };
    });

    // Construir guía de aprendizaje
    const learningGuide = pages
      .sort((a, b) => a.order_index - b.order_index)
      .map((page, index) => ({
        id: page.id,
        title: page.title,
        order: index + 1,
        description: page.description
      }));

    res.json({
      navigationSections,
      pageContent,
      learningGuide,
      categories,
      pages,
      sections
    });

  } catch (error) {
    console.error('Error al obtener contenido:', error);
    res.status(500).json({ error: 'Error al cargar el contenido' });
  }
});

// GET /pages/:pageId - Obtener página específica
router.get('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    const page = await firestoreHelpers.getDoc('content_pages', pageId);
    if (!page) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    const sections = await firestoreHelpers.getCollection(
      'content_sections',
      { field: 'page_id', operator: '==', value: pageId },
      { field: 'order_index' }
    );

    res.json({
      ...page,
      sections
    });

  } catch (error) {
    console.error('Error al obtener página:', error);
    res.status(500).json({ error: 'Error al cargar la página' });
  }
});

// POST /pages - Crear nueva página
router.post('/pages', async (req, res) => {
  try {
    const { id, title, description, category_id, order_index } = req.body;
    
    // Validaciones básicas
    if (!id || !title) {
      return res.status(400).json({ error: 'ID y título son requeridos' });
    }

    // Verificar si ya existe
    const existingPage = await firestoreHelpers.getDoc('content_pages', id);
    if (existingPage) {
      return res.status(400).json({ error: 'Ya existe una página con ese ID' });
    }

    const pageData = {
      title,
      description: description || '',
      category_id: category_id || '',
      order_index: order_index || 0,
      is_published: true
    };

    await firestoreHelpers.createDoc('content_pages', id, pageData);

    res.status(201).json({ 
      message: 'Página creada exitosamente', 
      id,
      page: { id, ...pageData }
    });
  } catch (error) {
    console.error('Error creando página:', error);
    res.status(500).json({ error: 'Error al crear la página' });
  }
});

// PUT /pages/:pageId - Actualizar página existente
router.put('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const updateData = req.body;
    
    // Verificar que la página existe
    const existingPage = await firestoreHelpers.getDoc('content_pages', pageId);
    if (!existingPage) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    await firestoreHelpers.updateDoc('content_pages', pageId, updateData);
    
    res.json({ 
      message: 'Página actualizada exitosamente',
      pageId 
    });
  } catch (error) {
    console.error('Error actualizando página:', error);
    res.status(500).json({ error: 'Error al actualizar la página' });
  }
});

// DELETE /pages/:pageId - Eliminar página
router.delete('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    // Verificar que la página existe
    const existingPage = await firestoreHelpers.getDoc('content_pages', pageId);
    if (!existingPage) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    // Eliminar todas las secciones de la página
    const sections = await firestoreHelpers.getCollection(
      'content_sections',
      { field: 'page_id', operator: '==', value: pageId }
    );

    // Usar batch para eliminar múltiples documentos
    const batch = firestoreHelpers.batch();
    sections.forEach(section => {
      const sectionRef = firestoreHelpers.db.collection('content_sections').doc(section.id);
      batch.delete(sectionRef);
    });

    // Eliminar la página
    const pageRef = firestoreHelpers.db.collection('content_pages').doc(pageId);
    batch.delete(pageRef);

    await batch.commit();
    
    res.json({ 
      message: 'Página y sus secciones eliminadas exitosamente',
      deletedSections: sections.length
    });
  } catch (error) {
    console.error('Error eliminando página:', error);
    res.status(500).json({ error: 'Error al eliminar la página' });
  }
});

// POST /sections - Crear nueva sección
router.post('/sections', async (req, res) => {
  try {
    const { id, page_id, title, content, order_index } = req.body;
    
    if (!page_id || !title) {
      return res.status(400).json({ error: 'page_id y título son requeridos' });
    }

    // Verificar que la página padre existe
    const parentPage = await firestoreHelpers.getDoc('content_pages', page_id);
    if (!parentPage) {
      return res.status(400).json({ error: 'La página padre no existe' });
    }

    const sectionData = {
      page_id,
      title,
      content: content || '',
      content_type: 'markdown',
      order_index: order_index || 0
    };

    const sectionId = id || `${page_id}-${Date.now()}`;
    await firestoreHelpers.createDoc('content_sections', sectionId, sectionData);

    res.status(201).json({ 
      message: 'Sección creada exitosamente', 
      id: sectionId,
      section: { id: sectionId, ...sectionData }
    });
  } catch (error) {
    console.error('Error creando sección:', error);
    res.status(500).json({ error: 'Error al crear la sección' });
  }
});

// PUT /sections/:sectionId - Actualizar sección
router.put('/sections/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params;
    const updateData = req.body;
    
    const existingSection = await firestoreHelpers.getDoc('content_sections', sectionId);
    if (!existingSection) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }

    await firestoreHelpers.updateDoc('content_sections', sectionId, updateData);
    
    res.json({ 
      message: 'Sección actualizada exitosamente',
      sectionId 
    });
  } catch (error) {
    console.error('Error actualizando sección:', error);
    res.status(500).json({ error: 'Error al actualizar la sección' });
  }
});

// DELETE /sections/:sectionId - Eliminar sección
router.delete('/sections/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const existingSection = await firestoreHelpers.getDoc('content_sections', sectionId);
    if (!existingSection) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }

    await firestoreHelpers.deleteDoc('content_sections', sectionId);
    
    res.json({ message: 'Sección eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando sección:', error);
    res.status(500).json({ error: 'Error al eliminar la sección' });
  }
});

// POST /export - Exportar todo el contenido
router.get('/export', async (req, res) => {
  try {
    const categories = await firestoreHelpers.getCollection('content_categories');
    const pages = await firestoreHelpers.getCollection('content_pages');
    const sections = await firestoreHelpers.getCollection('content_sections');

    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        categories,
        pages,
        sections
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="cpc-content-export.json"');
    res.json(exportData);
  } catch (error) {
    console.error('Error exportando contenido:', error);
    res.status(500).json({ error: 'Error al exportar contenido' });
  }
});

module.exports = router; 