import { createContext, useContext, useState, useEffect } from 'react';
import { cmsService, progressService } from '../services/api';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent debe ser usado dentro de un ContentProvider');
  }
  return context;
};

// Datos por defecto como fallback si el backend no está disponible
const defaultContent = {
  navigationSections: [
    {
      id: 'get-started',
      title: 'GET STARTED',
      items: [
        { id: 'introduccion', title: 'Introducción' },
        { id: 'plataformas', title: 'Plataformas' }
      ]
    },
    {
      id: 'estructuras',
      title: 'ESTRUCTURAS DE DATOS',
      items: [
        { id: 'arrays-strings', title: 'Arrays y strings' },
        { id: 'listas-enlazadas', title: 'Listas enlazadas' },
        { id: 'pilas-colas', title: 'Pilas y colas' },
        { id: 'arboles', title: 'Árboles' },
        { id: 'grafos', title: 'Grafos' }
      ]
    },
    {
      id: 'algoritmos',
      title: 'ALGORITMOS',
      items: [
        { id: 'algo-introduccion', title: 'Introducción' },
        { id: 'recursividad', title: 'Recursividad' },
        { id: 'divide-venceras', title: 'Divide y vencerás' },
        { id: 'programacion-dinamica', title: 'Programación dinámica' },
        { id: 'backtracking', title: 'Backtracking' }
      ]
    }
  ],
  learningGuide: [
    { id: 'introduccion', title: 'Introducción', order: 1 },
    { id: 'arrays-strings', title: 'Arrays y Strings', order: 2 },
    { id: 'recursividad', title: 'Recursividad', order: 3 },
    { id: 'algoritmos-busqueda', title: 'Algoritmos de búsqueda', order: 4 },
    { id: 'programacion-dinamica', title: 'Programación Dinámica', order: 5 }
  ],
  pageContent: {
    'introduccion': {
      title: 'INTRODUCCIÓN',
      sections: [
        {
          id: 'intro',
          title: 'Introducción',
          content: '¡Bienvenido al Club de Programación UGR! Cargando contenido...'
        }
      ]
    }
  }
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  // Cargar contenido desde el backend
  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const backendContent = await cmsService.getContent();
      setContent(backendContent);
      setIsBackendAvailable(true);

      console.log('✅ Contenido cargado desde el backend');
    } catch (err) {
      console.warn('⚠️ Backend no disponible, usando contenido local:', err.message);
      
      // Intentar cargar desde localStorage como fallback
      const savedContent = localStorage.getItem('cpc-cms-content');
      if (savedContent) {
        try {
          const localContent = JSON.parse(savedContent);
          setContent(localContent);
          console.log('📦 Contenido cargado desde localStorage');
        } catch (parseErr) {
          console.error('Error parsing localStorage content:', parseErr);
          setContent(defaultContent);
        }
      } else {
        setContent(defaultContent);
      }
      
      setIsBackendAvailable(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar contenido al montar el componente
  useEffect(() => {
    loadContent();
  }, []);

  // Guardar en localStorage cuando el contenido cambie (fallback)
  useEffect(() => {
    if (!loading && content) {
      localStorage.setItem('cpc-cms-content', JSON.stringify(content));
    }
  }, [content, loading]);

  // === FUNCIONES DE GESTIÓN DE CONTENIDO (ADMIN) ===

  const updatePageContent = async (pageId, newPageContent) => {
    if (isBackendAvailable) {
      try {
        await cmsService.updatePage(pageId, newPageContent);
        await loadContent(); // Recargar desde backend
      } catch (err) {
        console.error('Error updating page:', err);
        // Fallback: actualizar localmente
        updatePageContentLocal(pageId, newPageContent);
      }
    } else {
      updatePageContentLocal(pageId, newPageContent);
    }
  };

  const updatePageContentLocal = (pageId, newPageContent) => {
    setContent(prev => ({
      ...prev,
      pageContent: {
        ...prev.pageContent,
        [pageId]: newPageContent
      }
    }));
  };

  const addNewPage = async (pageId, pageContent) => {
    if (isBackendAvailable) {
      try {
        await cmsService.createPage({
          id: pageId,
          title: pageContent.title,
          description: pageContent.description || '',
          category_id: pageContent.category_id || '',
          order_index: pageContent.order_index || 0
        });

        // Crear secciones si las hay
        if (pageContent.sections && pageContent.sections.length > 0) {
          for (const section of pageContent.sections) {
            await cmsService.createSection({
              id: section.id,
              page_id: pageId,
              title: section.title,
              content: section.content,
              order_index: section.order_index || 0
            });
          }
        }

        await loadContent(); // Recargar desde backend
      } catch (err) {
        console.error('Error creating page:', err);
        // Fallback: crear localmente
        addNewPageLocal(pageId, pageContent);
      }
    } else {
      addNewPageLocal(pageId, pageContent);
    }
  };

  const addNewPageLocal = (pageId, pageContent) => {
    setContent(prev => ({
      ...prev,
      pageContent: {
        ...prev.pageContent,
        [pageId]: pageContent
      }
    }));
  };

  const deletePage = async (pageId) => {
    if (isBackendAvailable) {
      try {
        await cmsService.deletePage(pageId);
        await loadContent(); // Recargar desde backend
      } catch (err) {
        console.error('Error deleting page:', err);
        // Fallback: eliminar localmente
        deletePageLocal(pageId);
      }
    } else {
      deletePageLocal(pageId);
    }
  };

  const deletePageLocal = (pageId) => {
    setContent(prev => {
      const newPageContent = { ...prev.pageContent };
      delete newPageContent[pageId];
      return {
        ...prev,
        pageContent: newPageContent
      };
    });
  };

  const addNavigationItem = async (sectionId, item) => {
    // Esta función necesitaría implementación en el backend
    // Por ahora mantener funcionalidad local
    setContent(prev => ({
      ...prev,
      navigationSections: prev.navigationSections.map(section => 
        section.id === sectionId 
          ? { ...section, items: [...section.items, item] }
          : section
      )
    }));
  };

  const removeNavigationItem = async (sectionId, itemId) => {
    // Esta función necesitaría implementación en el backend
    // Por ahora mantener funcionalidad local
    setContent(prev => ({
      ...prev,
      navigationSections: prev.navigationSections.map(section => 
        section.id === sectionId 
          ? { ...section, items: section.items.filter(item => item.id !== itemId) }
          : section
      )
    }));
  };

  const resetContent = async () => {
    if (isBackendAvailable) {
      try {
        // El backend no tiene esta funcionalidad específica aún
        // Por ahora solo limpiar local
        localStorage.removeItem('cpc-cms-content');
        await loadContent();
      } catch (err) {
        console.error('Error resetting content:', err);
        resetContentLocal();
      }
    } else {
      resetContentLocal();
    }
  };

  const resetContentLocal = () => {
    setContent(defaultContent);
    localStorage.removeItem('cpc-cms-content');
  };

  const exportContent = async () => {
    if (isBackendAvailable) {
      try {
        const exportData = await cmsService.exportContent();
        
        // Crear y descargar archivo
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cpc-content-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error exporting content:', err);
        exportContentLocal();
      }
    } else {
      exportContentLocal();
    }
  };

  const exportContentLocal = () => {
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cpc-content-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importContent = async (jsonContent) => {
    try {
      const parsedContent = JSON.parse(jsonContent);
      
      if (isBackendAvailable) {
        try {
          await cmsService.importContent(parsedContent);
          await loadContent(); // Recargar desde backend
          return { success: true };
        } catch (err) {
          console.error('Error importing to backend:', err);
          // Fallback: importar localmente
          setContent(parsedContent);
          return { success: true };
        }
      } else {
        setContent(parsedContent);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // === FUNCIONES DE PROGRESO ===
  const markProgress = async (pageId, sectionId = null) => {
    try {
      await progressService.markComplete({
        page_id: pageId,
        section_id: sectionId,
        progress_data: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      console.warn('No se pudo guardar progreso en backend:', err.message);
      // El progreso por cookies se maneja automáticamente por el backend
    }
  };

  const value = {
    content,
    loading,
    error,
    isBackendAvailable,
    
    // Funciones de gestión (admin)
    updatePageContent,
    addNewPage,
    deletePage,
    addNavigationItem,
    removeNavigationItem,
    resetContent,
    exportContent,
    importContent,
    
    // Funciones de progreso
    markProgress,
    
    // Función para recargar contenido
    reloadContent: loadContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}; 