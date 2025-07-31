import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { staticContent } from '../data/staticContent.js';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent debe usarse dentro de ContentProvider');
  }
  return context;
};

// Mapeo de secciones a archivos markdown
const sectionToMarkdownMap = {
  'arrays': { category: 'estructuras', file: 'arrays' },
  'sets': { category: 'estructuras', file: 'sets' },
  'maps': { category: 'estructuras', file: 'maps' },
  'trees': { category: 'estructuras', file: 'trees' },
  'sorting': { category: 'algoritmos', file: 'sorting' },
  'dp': { category: 'algoritmos', file: 'dp' },
  'introduccion': { category: 'introduccion', file: 'que-es' }
};

export const ContentProvider = ({ children }) => {
  const [markdownCache, setMarkdownCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Función para cargar contenido markdown
  const loadMarkdownContent = useCallback(async (sectionKey) => {
    if (markdownCache[sectionKey]) {
      return markdownCache[sectionKey];
    }
    
    const markdownInfo = sectionToMarkdownMap[sectionKey];
    if (!markdownInfo) {
      return null;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/content/${markdownInfo.category}/${markdownInfo.file}`);
      
      if (!response.ok) {
        console.warn(`No se encontró contenido markdown para ${sectionKey}, usando contenido estático`);
        return null;
      }
      
      const data = await response.json();
      
      // Cachear el resultado
      setMarkdownCache(prev => ({
        ...prev,
        [sectionKey]: data.content
      }));
      
      return data.content;
    } catch (error) {
      console.error(`Error cargando contenido markdown para ${sectionKey}:`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [markdownCache]);

  // Funciones de utilidad memoizadas
  const contextValue = useMemo(() => {
    const { pages = [], categories = [] } = staticContent;

    // Función mejorada para obtener página con contenido markdown
    const getPageWithMarkdown = async (pageId) => {
      const page = pages.find(page => page.id === pageId);
      if (!page) return null;
      
      // Si es la página de estructuras, intentar cargar contenido markdown para arrays
      if (pageId === 'estructuras') {
        try {
          const arraysMarkdown = await loadMarkdownContent('arrays');
          
          if (arraysMarkdown) {
            // Crear una copia de la página con el contenido markdown
            const updatedPage = {
              ...page,
              sections: page.sections.map(section => {
                if (section.id === 'arrays') {
                  return {
                    ...section,
                    content: arraysMarkdown,
                    source: 'markdown'
                  };
                }
                return section;
              })
            };
            return updatedPage;
          }
        } catch (error) {
          console.warn('Error cargando markdown, usando contenido estático:', error);
        }
      }
      
      return page;
    };

    // Obtener página específica (versión síncrona para compatibilidad)
    const getPage = (pageId) => pages.find(page => page.id === pageId);

    // Filtrar contenido por categoría
    const getPagesByCategory = (categoryId) => 
      pages
        .filter(page => page.category === categoryId && page.is_active)
        .sort((a, b) => a.order_index - b.order_index);

    // Obtener categorías activas
    const getActiveCategories = () => 
      categories
        .filter(cat => cat.is_active)
        .sort((a, b) => a.order_index - b.order_index);

    // Buscar en contenido
    const searchContent = (query) => {
      if (!query || query.trim().length < 2) return [];
      
      const searchTerm = query.toLowerCase().trim();
      const results = [];
      
      pages.forEach(page => {
        if (!page.is_active) return;
        
        // Buscar en título y descripción de página
        if (page.title.toLowerCase().includes(searchTerm) ||
            page.description.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'page',
            id: page.id,
            title: page.title,
            description: page.description,
            category: page.category,
            relevance: 0.8
          });
        }
        
        // Buscar en secciones
        page.sections?.forEach(section => {
          if (section.title.toLowerCase().includes(searchTerm) ||
              section.content.toLowerCase().includes(searchTerm)) {
            results.push({
              type: 'section',
              id: `${page.id}-${section.id}`,
              title: section.title,
              description: page.title,
              category: page.category,
              pageId: page.id,
              sectionId: section.id,
              relevance: 0.6
            });
          }
        });
      });
      
      return results.sort((a, b) => b.relevance - a.relevance);
    };

    return {
      pages,
      categories,
      isLoading,
      error: null,
      getPage,
      getPageWithMarkdown,
      getPagesByCategory,
      getActiveCategories,
      searchContent,
      loadMarkdownContent
    };
  }, [isLoading, loadMarkdownContent]);

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
}; 