import { useState } from 'react';
import { Menu, X, ChevronDown, ChevronRight, Search, BookOpen, List, ArrowRight, ArrowLeft } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const Aprende = () => {
  const { content } = useContent();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [learningMode, setLearningMode] = useState('categories'); // 'categories' or 'guide'
  const [expandedSections, setExpandedSections] = useState({
    'get-started': true,
    'estructuras': false,
    'algoritmos': false
  });
  const [currentPage, setCurrentPage] = useState('introduccion');
  const [searchTerm, setSearchTerm] = useState('');

  const navigationSections = content.navigationSections;
  const learningGuide = content.learningGuide || [];
  const pageContent = content.pageContent;

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const currentContent = pageContent[currentPage] || pageContent['introduccion'];
  const tableOfContents = currentContent.sections.map(section => ({
    id: section.id,
    title: section.title
  }));

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getCurrentGuidePosition = () => {
    return learningGuide.findIndex(item => item.id === currentPage);
  };

  const goToNextInGuide = () => {
    const currentIndex = getCurrentGuidePosition();
    if (currentIndex < learningGuide.length - 1) {
      setCurrentPage(learningGuide[currentIndex + 1].id);
    }
  };

  const goToPreviousInGuide = () => {
    const currentIndex = getCurrentGuidePosition();
    if (currentIndex > 0) {
      setCurrentPage(learningGuide[currentIndex - 1].id);
    }
  };

  // Función para normalizar texto (quitar tildes, espacios extra, etc.)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes y diacríticos
      .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
      .trim();
  };

  const getFilteredGuide = () => {
    if (!searchTerm) return learningGuide;
    const normalizedSearch = normalizeText(searchTerm);
    return learningGuide.filter(item => 
      normalizeText(item.title).includes(normalizedSearch)
    );
  };

  const getFilteredSections = () => {
    if (!searchTerm) return navigationSections;
    const normalizedSearch = normalizeText(searchTerm);
    return navigationSections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        normalizeText(item.title).includes(normalizedSearch)
      )
    })).filter(section => section.items.length > 0);
  };

  return (
    <div className="min-h-screen bg-pure-white dark:bg-black transition-colors duration-300 pt-16">
      {/* Glass/Crystal Background Effect */}
      <div className="fixed inset-0 bg-pure-white dark:bg-black pointer-events-none">
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.06]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               backgroundSize: '300px 300px'
             }}>
        </div>
        
        {/* Secondary texture layer for depth */}
        <div className="absolute inset-0 opacity-[0.008] dark:opacity-[0.03]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)'/%3E%3C/svg%3E")`,
               backgroundSize: '500px 500px'
             }}>
        </div>
      </div>

      {/* Subtle Cloud Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Light mode clouds */}
        <div className="dark:hidden">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-radial from-warm-orange/6 via-warm-pink/3 to-transparent blur-3xl animate-cloud-glow"></div>
          <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-gradient-radial from-warm-red/4 via-warm-orange/2 to-transparent blur-2xl animate-cloud-glow" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Dark mode clouds */}
        <div className="hidden dark:block">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-radial from-white/4 via-white/2 to-transparent blur-3xl animate-cloud-glow"></div>
          <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-gradient-radial from-white/3 via-white/1 to-transparent blur-2xl animate-cloud-glow" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Toggle Button - Solo cuando está colapsada */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 top-20 z-50 p-3 bg-pure-white/90 dark:bg-black/90 backdrop-blur-sm rounded-lg border border-gray-300/50 dark:border-gray-600/50 hover:bg-pure-white dark:hover:bg-black/95 transition-all duration-200 shadow-lg"
          >
            <div className="flex flex-col space-y-1">
              <span className="block w-5 h-0.5 bg-gray-800 dark:bg-pure-white rounded-full"></span>
              <span className="block w-5 h-0.5 bg-gray-800 dark:bg-pure-white rounded-full"></span>
              <span className="block w-5 h-0.5 bg-gray-800 dark:bg-pure-white rounded-full"></span>
            </div>
          </button>
        )}

        {/* Left Sidebar */}
        <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-pure-white/95 dark:bg-black/95 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full'
        }`}>
          <div className="p-4 h-full overflow-y-auto">
            {/* Close Button - Solo cuando está desplegada */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-pure-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="mb-6">
              <div className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-lg p-1">
                <button
                  onClick={() => setLearningMode('categories')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-light transition-all duration-200 ${
                    learningMode === 'categories'
                      ? 'bg-white dark:bg-black text-black dark:text-pure-white shadow-sm border dark:border-gray-600'
                      : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-pure-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>Categorías</span>
                </button>
                <button
                  onClick={() => setLearningMode('guide')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-light transition-all duration-200 ${
                    learningMode === 'guide'
                      ? 'bg-white dark:bg-black text-black dark:text-pure-white shadow-sm border dark:border-gray-600'
                      : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-pure-white'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Guía</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar contenido..."
                className="w-full pl-10 pr-4 py-2 bg-white/90 dark:bg-black/90 border border-gray-300/50 dark:border-gray-600/50 rounded-lg text-sm text-gray-900 dark:text-pure-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-warm-orange focus:border-transparent backdrop-blur-sm"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-4">
              {learningMode === 'categories' ? (
                // Categories Mode
                getFilteredSections().map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center justify-between w-full text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-700 dark:hover:text-pure-white transition-colors"
                    >
                      {section.title}
                      {expandedSections[section.id] ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    
                    {expandedSections[section.id] && (
                      <ul className="space-y-2 mb-4">
                        {section.items.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => setCurrentPage(item.id)}
                              className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                                currentPage === item.id
                                  ? 'bg-warm-orange/20 text-warm-orange dark:bg-white/10 dark:text-pure-white'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-pure-white'
                              }`}
                            >
                              {item.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                // Guide Mode
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-4">
                    Guía de Aprendizaje Secuencial
                  </div>
                  
                  {/* Progress indicator */}
                  {getCurrentGuidePosition() >= 0 && (
                    <div className="mb-4 p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Progreso</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-warm-orange rounded-full h-2 transition-all duration-300"
                            style={{
                              width: `${((getCurrentGuidePosition() + 1) / learningGuide.length) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {getCurrentGuidePosition() + 1}/{learningGuide.length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons */}
                  {learningGuide.length > 0 && getCurrentGuidePosition() >= 0 && (
                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={goToPreviousInGuide}
                        disabled={getCurrentGuidePosition() === 0}
                        className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-xs font-light transition-all duration-200 ${
                          getCurrentGuidePosition() === 0
                            ? 'bg-gray-200/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-warm-orange/20 hover:bg-warm-orange/30 text-warm-orange'
                        }`}
                      >
                        <ArrowLeft className="h-3 w-3" />
                        <span>Anterior</span>
                      </button>
                      <button
                        onClick={goToNextInGuide}
                        disabled={getCurrentGuidePosition() === learningGuide.length - 1}
                        className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-xs font-light transition-all duration-200 ${
                          getCurrentGuidePosition() === learningGuide.length - 1
                            ? 'bg-gray-200/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-warm-orange/20 hover:bg-warm-orange/30 text-warm-orange'
                        }`}
                      >
                        <span>Siguiente</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Learning guide list */}
                  <ul className="space-y-1">
                    {getFilteredGuide().map((item, index) => {
                      const isCompleted = getCurrentGuidePosition() > index;
                      const isCurrent = currentPage === item.id;
                      const isAvailable = index <= getCurrentGuidePosition() + 1 || getCurrentGuidePosition() === -1;
                      
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => isAvailable ? setCurrentPage(item.id) : null}
                            disabled={!isAvailable}
                            className={`flex items-center w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                              isCurrent
                                ? 'bg-warm-orange/20 text-warm-orange dark:bg-white/10 dark:text-pure-white'
                                : isCompleted
                                ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : isAvailable
                                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/50'
                                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <span className="mr-3 text-xs font-mono w-6 text-center">
                              {item.order}.
                            </span>
                            <span className="flex-1">{item.title}</span>
                            {isCompleted && (
                              <span className="text-green-500 text-xs">✓</span>
                            )}
                            {isCurrent && (
                              <span className="text-warm-orange text-xs">●</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'} relative z-10`}>
          <div className="flex">
            {/* Content Area */}
            <div className="flex-1 max-w-4xl mx-auto px-6 py-8">{/* Removed duplicate toggle button */}

              {/* Page Content */}
              <article className="prose prose-gray dark:prose-invert max-w-none">
                <h1 className="text-3xl sm:text-4xl font-light text-black dark:text-pure-white leading-tight mb-8">
                  {currentContent.title}
                </h1>

                {currentContent.sections.map((section) => (
                  <section key={section.id} id={section.id} className="mb-12">
                    <h2 className="text-xl sm:text-2xl font-light text-black dark:text-pure-white mb-4">
                      {section.title}
                    </h2>
                    <div className="text-gray-700 dark:text-gray-300 font-light leading-relaxed space-y-4">
                      {section.content.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </article>
            </div>

            {/* Right Sidebar - Table of Contents */}
            <div className="hidden xl:block w-64 p-6 border-l border-gray-200 dark:border-gray-700">
              <div className="sticky top-24">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  EN ESTA PÁGINA
                </h3>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="block w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-warm-orange dark:hover:text-warm-pink transition-colors py-1"
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Aprende; 