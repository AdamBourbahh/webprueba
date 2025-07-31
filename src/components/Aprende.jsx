import React, { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { BookOpenIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Importar estilos de KaTeX

const Aprende = () => {
  const { pages, categories, isLoading, error, getPagesByCategory, getPageWithMarkdown, loadMarkdownContent } = useContent();
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [pageTitles, setPageTitles] = useState([]);
  const [markdownLoading, setMarkdownLoading] = useState(false);

  // Función para extraer títulos de una página
  const extractTitlesFromPage = (page) => {
    if (!page || !page.sections) return [];
    
    const titles = [];
    
    page.sections.forEach(section => {
      // Agregar el título de la sección
      titles.push({
        id: section.id,
        title: section.title,
        level: 1,
        type: 'section'
      });
      
      // Extraer subtítulos del contenido
      const lines = section.content.split('\n');
      lines.forEach((line, index) => {
        if (line.startsWith('## ')) {
          const id = `${section.id}-h2-${index}`;
          titles.push({
            id: id,
            title: line.substring(3),
            level: 2,
            type: 'h2'
          });
        } else if (line.startsWith('### ')) {
          const id = `${section.id}-h3-${index}`;
          titles.push({
            id: id,
            title: line.substring(4),
            level: 3,
            type: 'h3'
          });
        }
      });
    });
    
    return titles;
  };

  // Efecto para actualizar títulos cuando cambia la página seleccionada
  useEffect(() => {
    if (selectedPage) {
      const titles = extractTitlesFromPage(selectedPage);
      setPageTitles(titles);
      
      // Sincronizar sidebar izquierda con la primera sección de la página
      if (titles.length > 0) {
        setTimeout(() => {
          updateLeftSidebarSelection(titles[0].id);
        }, 200);
      }
    } else {
      setPageTitles([]);
    }
  }, [selectedPage]);

  // Función para detectar qué sección está visible
  useEffect(() => {
    const handleScroll = () => {
      if (!pageTitles.length) return;
      
      const mainContent = document.querySelector('.content-scroll-area');
      if (!mainContent) return;
      
      const mainRect = mainContent.getBoundingClientRect();
      const scrollPosition = mainContent.scrollTop;
      let currentActive = null;
      let minDistance = Infinity;
      
      // Buscar la sección más cercana al top del viewport
      pageTitles.forEach((title) => {
        const element = document.getElementById(title.id);
        if (!element) return;
        
        // Calcular posición relativa al contenedor de scroll
        const elementTop = element.offsetTop;
        const distanceFromTop = Math.abs(elementTop - scrollPosition);
        
        // Si el elemento está en el viewport o cerca del top
        if (elementTop <= scrollPosition + 150 && distanceFromTop < minDistance) {
          minDistance = distanceFromTop;
          currentActive = title.id;
        }
      });
      
      // Si no encontramos ninguno cerca, usar el primero que esté visible
      if (!currentActive) {
        for (let i = pageTitles.length - 1; i >= 0; i--) {
          const element = document.getElementById(pageTitles[i].id);
          if (element && element.offsetTop <= scrollPosition + 100) {
            currentActive = pageTitles[i].id;
            break;
          }
        }
      }
      
             if (currentActive && currentActive !== activeSection) {
        setActiveSection(currentActive);
        
        // También actualizar la sidebar izquierda basándose en la sección activa
        updateLeftSidebarSelection(currentActive);
      }
    };

    const mainContent = document.querySelector('.content-scroll-area');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      // Ejecutar una vez al cargar
      setTimeout(() => {
        handleScroll();
        // Ejecutar de nuevo después de un momento para asegurar que el contenido esté renderizado
        setTimeout(handleScroll, 500);
      }, 100);
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, [pageTitles, activeSection]);

  // Función para actualizar la sidebar izquierda basándose en la sección activa
  const updateLeftSidebarSelection = (activeSectionId) => {
    if (!selectedPage || !activeSectionId) return;
    
    // Mapeo más preciso basado en el contenido actual
    let mappedItem = null;
    
    // Determinar el item basándose en la página actual y la sección
    if (selectedPage.id === 'estructuras') {
      // Si estamos en la página de estructuras, mapear según la sección
      if (activeSectionId === 'arrays' || activeSectionId.includes('arrays')) {
        mappedItem = 'arrays';
      } else if (activeSectionId === 'trees' || activeSectionId.includes('trees')) {
        mappedItem = 'trees';
      } else {
        // Por defecto en estructuras, seleccionar arrays
        mappedItem = 'arrays';
      }
    } else if (selectedPage.id === 'algoritmos') {
      // Si estamos en la página de algoritmos
      if (activeSectionId === 'sorting' || activeSectionId.includes('sorting')) {
        mappedItem = 'sorting';
      } else if (activeSectionId === 'dp' || activeSectionId.includes('dp')) {
        mappedItem = 'dp';
      } else {
        // Por defecto en algoritmos, seleccionar sorting
        mappedItem = 'sorting';
      }
    } else if (selectedPage.id === 'introduccion') {
      mappedItem = 'introduccion';
    }
    
    // Si no hay mapeo directo, intentar por título
    if (!mappedItem) {
      const title = pageTitles.find(t => t.id === activeSectionId);
      if (title) {
        const titleLower = title.title.toLowerCase();
        if (titleLower.includes('array') || titleLower.includes('vector')) {
          mappedItem = 'arrays';
        } else if (titleLower.includes('árbol') || titleLower.includes('tree') || titleLower.includes('binario')) {
          mappedItem = 'trees';
        } else if (titleLower.includes('ordenam') || titleLower.includes('sort') || titleLower.includes('quick') || titleLower.includes('merge')) {
          mappedItem = 'sorting';
        } else if (titleLower.includes('dinámica') || titleLower.includes('dp') || titleLower.includes('fibonacci') || titleLower.includes('mochila')) {
          mappedItem = 'dp';
        } else if (titleLower.includes('introducción') || titleLower.includes('primeros') || titleLower.includes('qué es')) {
          mappedItem = 'introduccion';
        }
      }
    }
    
    // Actualizar solo si es diferente al actual
    if (mappedItem && mappedItem !== selectedItem) {
      setSelectedItem(mappedItem);
    }
  };

  // Función mejorada para manejar selección de items en sidebar izquierda
  const handleItemSelection = async (itemKey) => {
    setSelectedItem(itemKey);
    
    // Mapeo de items a páginas
    const itemToPageMap = {
      'arrays': 'estructuras',
      'sets': 'estructuras', 
      'maps': 'estructuras',
      'trees': 'estructuras',
      'sorting': 'algoritmos',
      'dp': 'algoritmos',
      'introduccion': 'introduccion'
    };
    
    // Buscar la página correspondiente
    const pageId = itemToPageMap[itemKey];
    
    // Si es arrays, intentar cargar contenido markdown
    if (itemKey === 'arrays') {
      try {
        setMarkdownLoading(true);
        const pageWithMarkdown = await getPageWithMarkdown(pageId);
        if (pageWithMarkdown) {
          setSelectedPage(pageWithMarkdown);
        } else {
          // Fallback al contenido estático
          const page = pages.find(p => p.id === pageId);
          setSelectedPage(page);
        }
      } catch (error) {
        console.error('Error cargando contenido markdown:', error);
        // Fallback al contenido estático
        const page = pages.find(p => p.id === pageId);
        setSelectedPage(page);
      } finally {
        setMarkdownLoading(false);
      }
    } else {
      // Para otras secciones, usar contenido estático
      const page = pages.find(p => p.id === pageId);
      setSelectedPage(page);
    }
    
    // Si hay una sección específica para el item, hacer scroll a ella
    setTimeout(() => {
      const sectionElement = document.getElementById(itemKey);
      if (sectionElement) {
        scrollToSection(itemKey);
      }
    }, 100);
  };

  const scrollToSection = (sectionId) => {
    const mainContent = document.querySelector('.content-scroll-area');
    if (!mainContent) return;
    
    // Estrategia 1: Buscar por ID exacto
    let element = document.getElementById(sectionId);
    
    // Estrategia 2: Si no se encuentra, buscar por texto contenido
    if (!element) {
      const title = pageTitles.find(t => t.id === sectionId);
      if (title) {
        const headings = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
        element = Array.from(headings).find(h => 
          h.textContent.trim().toLowerCase().includes(title.title.toLowerCase()) ||
          title.title.toLowerCase().includes(h.textContent.trim().toLowerCase())
        );
      }
    }
    
    // Estrategia 3: Fallback a primera sección
    if (!element && pageTitles.length > 0) {
      element = document.getElementById(pageTitles[0].id);
    }
    
    if (element) {
      // Actualizar inmediatamente la sección activa
      setActiveSection(sectionId);
      
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Componente personalizado para los encabezados con IDs
  const createHeadingRenderer = (level, sectionId) => {
    return ({ children, ...props }) => {
      const HeadingTag = `h${level}`;
      const headingText = typeof children === 'string' ? children : children?.join('') || '';
      const headingId = `${sectionId}-h${level}-${headingText.toLowerCase().replace(/\s+/g, '-')}`;
      
      return React.createElement(HeadingTag, {
        id: headingId,
        className: level === 2 
          ? 'text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6'
          : 'text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 mt-5',
        ...props
      }, children);
    };
  };

  if (isLoading || markdownLoading) return <div className="flex justify-center items-center h-screen-minus-header"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black dark:border-white"></div></div>;
  if (error) return <div className="flex justify-center items-center h-screen-minus-header text-center"><BookOpenIcon className="h-16 w-16 mx-auto mb-4" /><h2 className="text-xl">Error cargando contenido</h2></div>;

  return (
    <div className="h-screen-minus-header flex">
      {/* Sidebar izquierda */}
      <aside className="w-56 h-full fixed top-16 left-0 border-r border-gray-200 dark:border-gray-700 z-10">
        <div className="p-3 h-full overflow-y-auto">
          <h2 className="text-sm font-semibold text-black dark:text-white mb-4 text-center">CONTENIDOS</h2>
          
          <div className="space-y-3">
            {/* Estructuras de datos */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white mb-2 text-center">
                Estructuras de datos
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleItemSelection('arrays')}
                  className={
                    selectedItem === 'arrays' 
                      ? 'block w-full text-center text-sm transition-colors bg-gray-800/20 dark:bg-gray-600/30 text-gray-700 dark:text-gray-300 py-1 rounded' 
                      : 'block w-full text-center text-sm transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent border-none outline-none'
                  }
                >
                  Arrays {selectedItem === 'arrays' && markdownLoading ? '⏳' : ''}
                </button>
                <button
                  onClick={() => handleItemSelection('sets')}
                  className={
                    selectedItem === 'sets' 
                      ? 'block w-full text-center text-sm transition-colors bg-gray-800/20 dark:bg-gray-600/30 text-gray-700 dark:text-gray-300 py-1 rounded' 
                      : 'block w-full text-center text-sm transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent border-none outline-none'
                  }
                >
                  Sets
                </button>
                <button
                  onClick={() => handleItemSelection('maps')}
                  className={
                    selectedItem === 'maps' 
                      ? 'block w-full text-center text-sm transition-colors bg-gray-800/20 dark:bg-gray-600/30 text-gray-700 dark:text-gray-300 py-1 rounded' 
                      : 'block w-full text-center text-sm transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent border-none outline-none'
                  }
                >
                  Maps
                </button>
              </div>
            </div>
            
            {/* Algoritmos */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white mb-2 text-center">
                Algoritmos
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleItemSelection('sorting')}
                  className={
                    selectedItem === 'sorting' 
                      ? 'block w-full text-center text-sm transition-colors bg-gray-800/20 dark:bg-gray-600/30 text-gray-700 dark:text-gray-300 py-1 rounded' 
                      : 'block w-full text-center text-sm transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent border-none outline-none'
                  }
                >
                  Ordenamiento
                </button>
                <button
                  onClick={() => handleItemSelection('dp')}
                  className={
                    selectedItem === 'dp' 
                      ? 'block w-full text-center text-sm transition-colors bg-gray-800/20 dark:bg-gray-600/30 text-gray-700 dark:text-gray-300 py-1 rounded' 
                      : 'block w-full text-center text-sm transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent border-none outline-none'
                  }
                >
                  Programación Dinámica
                </button>
              </div>
            </div>
            
            {/* Introducción */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white mb-2 text-center">
                Introducción
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleItemSelection('introduccion')}
                  className={
                    selectedItem === 'introduccion' 
                      ? 'block w-full text-center text-sm transition-colors bg-gray-800/20 dark:bg-gray-600/30 text-gray-700 dark:text-gray-300 py-1 rounded' 
                      : 'block w-full text-center text-sm transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent border-none outline-none'
                  }
                >
                  Primeros pasos
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto ml-56 mr-56">
        <div className="content-scroll-area h-full overflow-y-auto">
          <div className="max-w-none mx-auto p-4 lg:p-6">
            {selectedPage ? (
              <div>
                <header className="mb-4 p-4">
                  <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">{selectedPage.title}</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-base">{selectedPage.description}</p>
                </header>
                <div className="space-y-4">
                  {selectedPage.sections?.map(section => (
                    <div key={section.id} className="p-4">
                      <h2 id={section.id} className="text-2xl font-semibold pb-2 mb-4 text-black dark:text-white border-b border-gray-200 dark:border-gray-700">
                        {section.title}
                        {section.source === 'markdown' && (
                          <span className="text-xs ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                            📝 Markdown
                          </span>
                        )}
                      </h2>
                      <div className="markdown-content prose prose-gray dark:prose-invert max-w-none
                        prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                        prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-100
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
                        prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                        prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                        prose-li:text-gray-700 dark:prose-li:text-gray-300
                        prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-600
                        prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600
                        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            h2: createHeadingRenderer(2, section.id),
                            h3: createHeadingRenderer(3, section.id),
                            code: ({ node, inline, className, children, ...props }) => {
                              return inline ? (
                                <code className="text-pink-600 dark:text-pink-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-gray-900 dark:bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              );
                            },
                            blockquote: ({ children, ...props }) => (
                              <blockquote className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 pl-4 py-2 my-4 italic" {...props}>
                                {children}
                              </blockquote>
                            ),
                            table: ({ children, ...props }) => (
                              <div className="overflow-x-auto my-4">
                                <table className="min-w-full border border-gray-300 dark:border-gray-600" {...props}>
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children, ...props }) => (
                              <th className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold" {...props}>
                                {children}
                              </th>
                            ),
                            td: ({ children, ...props }) => (
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props}>
                                {children}
                              </td>
                            ),
                          }}
                        >
                          {section.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                <BookOpenIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h1 className="text-3xl font-bold mb-3 text-black dark:text-white">¡Bienvenido a APRENDE!</h1>
                <p className="max-w-2xl mx-auto text-base text-gray-600 dark:text-gray-400">
                  Contenido de aprendizaje de programación competitiva.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sidebar derecha */}
      <aside className="w-56 h-full fixed top-16 right-0 border-l border-gray-200 dark:border-gray-700 z-10">
        {selectedPage && pageTitles.length > 0 && (
          <div className="p-3 h-full overflow-y-auto">
            <h2 className="text-sm font-semibold text-black dark:text-white mb-4 text-center">EN ESTA PÁGINA</h2>
            
            <div className="space-y-3">
              <div>
                <div className="space-y-1">
                  {pageTitles.map((title) => (
                    <button
                      key={title.id}
                      onClick={() => scrollToSection(title.id)}
                      className={
                        activeSection === title.id 
                          ? 'block w-full text-center text-sm transition-colors bg-gray-800/25 dark:bg-gray-600/40 text-gray-700 dark:text-gray-300 py-1 rounded' 
                          : 'block w-full text-center text-sm transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent border-none outline-none'
                      }
                    >
                      {title.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Aprende; 