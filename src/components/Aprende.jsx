import { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { progressService } from '../services/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  BookOpen, 
  CheckCircle, 
  Clock,
  Menu,
  X,
  ArrowRight,
  Star,
  RotateCcw,
  Trophy
} from 'lucide-react';

const Aprende = () => {
  const { content, loading, markProgress } = useContent();
  const { isAuthenticated, user } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [learningMode, setLearningMode] = useState('guide'); // 'guide' o 'categories'
  const [expandedSections, setExpandedSections] = useState({});
  const [currentPage, setCurrentPage] = useState(() => {
    // Recuperar página actual desde localStorage al cargar
    return localStorage.getItem('aprende-current-page') || 'introduccion';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [userProgress, setUserProgress] = useState({});
  const [visitedPages, setVisitedPages] = useState(new Set());
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Cargar progreso del usuario
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const progress = await progressService.getUserProgress();
        setUserProgress(progress.pages || {});
      } catch (error) {
        console.warn('No se pudo cargar el progreso:', error);
        
        // Cargar progreso de localStorage como fallback
        const localProgress = localStorage.getItem('user-learning-progress');
        if (localProgress) {
          setUserProgress(JSON.parse(localProgress));
        }
      }
    };

    loadUserProgress();
  }, []);

  // Cargar páginas visitadas de localStorage
  useEffect(() => {
    const visited = localStorage.getItem('visited-pages');
    if (visited) {
      setVisitedPages(new Set(JSON.parse(visited)));
    }

    // También cargar el modo de aprendizaje preferido
    const savedMode = localStorage.getItem('aprende-learning-mode');
    if (savedMode) {
      setLearningMode(savedMode);
    }

    // Cargar secciones expandidas
    const savedExpanded = localStorage.getItem('aprende-expanded-sections');
    if (savedExpanded) {
      setExpandedSections(JSON.parse(savedExpanded));
    }
  }, []);

  // Guardar páginas visitadas en localStorage
  useEffect(() => {
    localStorage.setItem('visited-pages', JSON.stringify([...visitedPages]));
  }, [visitedPages]);

  // Guardar modo de aprendizaje en localStorage
  useEffect(() => {
    localStorage.setItem('aprende-learning-mode', learningMode);
  }, [learningMode]);

  // Guardar secciones expandidas en localStorage
  useEffect(() => {
    localStorage.setItem('aprende-expanded-sections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  // Marcar página como visitada cuando cambie y guardar página actual
  useEffect(() => {
    if (currentPage) {
      setVisitedPages(prev => new Set([...prev, currentPage]));
      // Guardar página actual en localStorage
      localStorage.setItem('aprende-current-page', currentPage);
    }
  }, [currentPage]);

  const handleMarkComplete = async (pageId, sectionId = null) => {
    try {
      await markProgress(pageId, sectionId);
      
      // Actualizar estado local
      setUserProgress(prev => ({
        ...prev,
        [pageId]: {
          ...prev[pageId],
          completed: true,
          completedAt: new Date().toISOString(),
          sections: {
            ...prev[pageId]?.sections,
            [sectionId || 'main']: {
              completed: true,
              completedAt: new Date().toISOString()
            }
          }
        }
      }));

      // Guardar en localStorage como backup
      const updatedProgress = {
        ...userProgress,
        [pageId]: {
          ...userProgress[pageId],
          completed: true,
          completedAt: new Date().toISOString()
        }
      };
      localStorage.setItem('user-learning-progress', JSON.stringify(updatedProgress));
      
    } catch (error) {
      console.warn('Error guardando progreso:', error);
    }
  };

  const isPageCompleted = (pageId) => {
    return userProgress[pageId]?.completed || false;
  };

  const getCompletionPercentage = () => {
    const totalPages = Object.keys(content.pageContent || {}).length;
    const completedPages = Object.keys(userProgress).filter(pageId => 
      userProgress[pageId]?.completed
    ).length;
    return totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0;
  };

  const getNextPage = () => {
    const guide = content.learningGuide || [];
    const currentIndex = guide.findIndex(item => item.id === currentPage);
    return currentIndex >= 0 && currentIndex < guide.length - 1 
      ? guide[currentIndex + 1] 
      : null;
  };

  const getPreviousPage = () => {
    const guide = content.learningGuide || [];
    const currentIndex = guide.findIndex(item => item.id === currentPage);
    return currentIndex > 0 ? guide[currentIndex - 1] : null;
  };

  const filteredContent = () => {
    if (!searchTerm) return content.pageContent || {};
    
    const filtered = {};
    Object.keys(content.pageContent || {}).forEach(pageId => {
      const page = content.pageContent[pageId];
      const matchesTitle = page.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesContent = page.sections?.some(section => 
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchesTitle || matchesContent) {
        filtered[pageId] = page;
      }
    });
    
    return filtered;
  };

  const renderLearningGuide = () => {
    const guide = content.learningGuide || [];
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800 dark:text-gray-200">
            Guía de Aprendizaje
          </h3>
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getCompletionPercentage()}% completado
            </span>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-warm-orange to-warm-red h-2 rounded-full transition-all duration-500"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>

        {guide.map((item, index) => {
          const isCompleted = isPageCompleted(item.id);
          const isCurrent = currentPage === item.id;
          const isVisited = visitedPages.has(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                isCurrent
                  ? 'bg-warm-orange text-white shadow-lg'
                  : isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : isVisited
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCurrent
                    ? 'bg-white/20 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : isVisited
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : isVisited ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {item.title}
                  </div>
                  {isCompleted && (
                    <div className="text-xs opacity-75 mt-1">
                      ✓ Completado
                    </div>
                  )}
                  {isVisited && !isCompleted && (
                    <div className="text-xs opacity-75 mt-1">
                      👁️ Visitado
                    </div>
                  )}
                </div>
                {isCurrent && <ArrowRight className="h-4 w-4" />}
              </div>
            </button>
          );
        })}
        
        {/* Resumen de progreso */}
        <div className="mt-6 p-4 bg-gradient-to-r from-warm-orange/10 to-warm-red/10 rounded-lg border border-warm-orange/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Tu Progreso
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {Object.keys(userProgress).filter(id => userProgress[id]?.completed).length} de {guide.length} lecciones
              </div>
            </div>
            <button
              onClick={() => setShowProgressModal(true)}
              className="text-warm-orange hover:text-warm-red transition-colors"
            >
              <Star className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Páginas visitadas recientemente */}
        {visitedPages.size > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              Visitadas Recientemente
            </h4>
            <div className="space-y-2">
              {[...visitedPages].slice(-5).reverse().map(pageId => {
                const page = content.pageContent[pageId];
                if (!page) return null;
                
                const isCompleted = isPageCompleted(pageId);
                
                return (
                  <button
                    key={pageId}
                    onClick={() => setCurrentPage(pageId)}
                    className="w-full text-left p-2 rounded bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {page.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategoriesView = () => (
    <div className="space-y-4">
      {(content.navigationSections || []).map(section => (
        <div key={section.id}>
          <button
            onClick={() => setExpandedSections(prev => ({
              ...prev,
              [section.id]: !prev[section.id]
            }))}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {section.title}
            </span>
            {expandedSections[section.id] ? (
              <ChevronRight className="h-4 w-4 text-gray-500 transform rotate-90 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 transition-transform" />
            )}
          </button>
          
          {expandedSections[section.id] && (
            <div className="mt-2 ml-4 space-y-1">
              {section.items.map(item => {
                const isCompleted = isPageCompleted(item.id);
                const isVisited = visitedPages.has(item.id);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-warm-orange text-white'
                        : isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                        : isVisited
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isCompleted && <CheckCircle className="h-4 w-4" />}
                      {isVisited && !isCompleted && <Clock className="h-4 w-4" />}
                      <span className="truncate">{item.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    const pageContent = filteredContent()[currentPage];
    
    if (!pageContent) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Página no encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            La página que buscas no existe o ha sido movida.
          </p>
        </div>
      );
    }

    const isCompleted = isPageCompleted(currentPage);
    const nextPage = getNextPage();
    const prevPage = getPreviousPage();

    return (
      <div className="space-y-6">
        {/* Header de la página */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-light text-black dark:text-white">
              {pageContent.title}
            </h1>
            <div className="flex items-center space-x-3">
              {isCompleted ? (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Completado</span>
                </div>
              ) : (
                <button
                  onClick={() => handleMarkComplete(currentPage)}
                  className="flex items-center space-x-2 bg-warm-orange hover:bg-warm-red text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Marcar como completado</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Navegación entre páginas */}
          <div className="flex items-center justify-between">
            <div>
              {prevPage && (
                <button
                  onClick={() => setCurrentPage(prevPage.id)}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-warm-orange transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm">{prevPage.title}</span>
                </button>
              )}
            </div>
            
            <div>
              {nextPage && (
                <button
                  onClick={() => setCurrentPage(nextPage.id)}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-warm-orange transition-colors"
                >
                  <span className="text-sm">{nextPage.title}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido de las secciones */}
        <div className="space-y-8">
          {pageContent.sections?.map((section, index) => (
            <div key={section.id} className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light text-black dark:text-white">
                  {section.title}
                </h2>
                <button
                  onClick={() => handleMarkComplete(currentPage, section.id)}
                  className="text-gray-400 hover:text-warm-orange transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div 
                  className="text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: section.content.replace(/\n/g, '<br />') 
                  }} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navegación inferior */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
          {prevPage ? (
            <button
              onClick={() => setCurrentPage(prevPage.id)}
              className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div></div>
          )}
          
          {nextPage ? (
            <button
              onClick={() => setCurrentPage(nextPage.id)}
              className="flex items-center space-x-2 bg-warm-orange hover:bg-warm-red text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="text-center">
              <div className="text-green-600 dark:text-green-400 font-medium">
                🎉 ¡Has completado toda la guía!
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pure-white dark:bg-black pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-orange mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando contenido educativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pure-white dark:bg-black transition-colors duration-300 pt-16">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-pure-white dark:bg-black pointer-events-none">
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.06]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               backgroundSize: '300px 300px'
             }}>
        </div>
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition duration-200 ease-in-out lg:static lg:inset-0 z-30`}>
          <div className="flex flex-col w-80 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-lg font-light text-black dark:text-white">
                Aprende Programación
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange"
                />
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setLearningMode('guide')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    learningMode === 'guide'
                      ? 'bg-warm-orange text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Guía
                </button>
                <button
                  onClick={() => setLearningMode('categories')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    learningMode === 'categories'
                      ? 'bg-warm-orange text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Categorías
                </button>
              </div>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {learningMode === 'guide' ? renderLearningGuide() : renderCategoriesView()}
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile menu button */}
          <div className="lg:hidden p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-warm-orange transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span>Menú</span>
            </button>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Modal de progreso */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                Tu Progreso
              </h3>
              <div className="text-3xl font-bold text-warm-orange mb-2">
                {getCompletionPercentage()}%
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Has completado {Object.keys(userProgress).filter(id => userProgress[id]?.completed).length} de {Object.keys(content.pageContent || {}).length} lecciones
              </p>
              
              {/* Estadísticas adicionales */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Visitadas
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {visitedPages.size}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Completadas
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {Object.keys(userProgress).filter(id => userProgress[id]?.completed).length}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('user-learning-progress');
                    localStorage.removeItem('visited-pages');
                    localStorage.removeItem('aprende-current-page');
                    localStorage.removeItem('aprende-learning-mode');
                    localStorage.removeItem('aprende-expanded-sections');
                    setUserProgress({});
                    setVisitedPages(new Set());
                    setCurrentPage('introduccion');
                    setLearningMode('guide');
                    setExpandedSections({});
                    setShowProgressModal(false);
                  }}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Resetear</span>
                </button>
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="flex-1 bg-warm-orange hover:bg-warm-red text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aprende; 