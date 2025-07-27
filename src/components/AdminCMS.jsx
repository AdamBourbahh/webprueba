import { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { Save, Plus, Trash2, Download, Upload, RotateCcw, Edit3, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import CMSLogin from './CMSLogin';

const AdminCMS = () => {
  const { 
    content, 
    updatePageContent, 
    addNewPage, 
    deletePage, 
    addNavigationItem, 
    removeNavigationItem,
    resetContent, 
    exportContent, 
    importContent 
  } = useContent();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');
  const [selectedPage, setSelectedPage] = useState('introduccion');
  const [editingPage, setEditingPage] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [expandedNavSections, setExpandedNavSections] = useState({});

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = sessionStorage.getItem('cms-authenticated');
      const authTime = sessionStorage.getItem('cms-auth-time');
      
      if (authenticated && authTime) {
        const timeDiff = Date.now() - parseInt(authTime);
        // Sesión válida por 4 horas
        if (timeDiff < 4 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
        } else {
          // Sesión expirada
          sessionStorage.removeItem('cms-authenticated');
          sessionStorage.removeItem('cms-auth-time');
          setIsAuthenticated(false);
        }
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('cms-authenticated');
    sessionStorage.removeItem('cms-auth-time');
    setIsAuthenticated(false);
  };

  // Si no está autenticado, mostrar pantalla de login
  if (!isAuthenticated) {
    return <CMSLogin onLogin={setIsAuthenticated} />;
  }

  // Forms state
  const [newPageForm, setNewPageForm] = useState({
    id: '',
    title: '',
    sectionTitle: '',
    sectionContent: ''
  });

  const [editForm, setEditForm] = useState({
    title: '',
    content: ''
  });

  const handleEditSection = (section) => {
    setEditingSection(section.id);
    setEditForm({
      title: section.title,
      content: section.content
    });
  };

  const handleSaveSection = (pageId, sectionId) => {
    const page = content.pageContent[pageId];
    const updatedSections = page.sections.map(section => 
      section.id === sectionId 
        ? { ...section, title: editForm.title, content: editForm.content }
        : section
    );
    
    updatePageContent(pageId, {
      ...page,
      sections: updatedSections
    });
    
    setEditingSection(null);
    setEditForm({ title: '', content: '' });
  };

  const handleAddSection = (pageId) => {
    const page = content.pageContent[pageId];
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'Nueva Sección',
      content: 'Contenido de la nueva sección...'
    };
    
    updatePageContent(pageId, {
      ...page,
      sections: [...page.sections, newSection]
    });
  };

  const handleDeleteSection = (pageId, sectionId) => {
    const page = content.pageContent[pageId];
    const updatedSections = page.sections.filter(section => section.id !== sectionId);
    
    updatePageContent(pageId, {
      ...page,
      sections: updatedSections
    });
  };

  const handleCreateNewPage = () => {
    if (!newPageForm.id || !newPageForm.title) return;
    
    const newPage = {
      title: newPageForm.title,
      sections: [{
        id: 'intro',
        title: newPageForm.sectionTitle || 'Introducción',
        content: newPageForm.sectionContent || 'Contenido de la página...'
      }]
    };
    
    addNewPage(newPageForm.id, newPage);
    setNewPageForm({ id: '', title: '', sectionTitle: '', sectionContent: '' });
    setShowNewPageForm(false);
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = importContent(e.target.result);
        if (result.success) {
          alert('Contenido importado exitosamente');
        } else {
          alert('Error al importar: ' + result.error);
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleNavSection = (sectionId) => {
    setExpandedNavSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-light text-black dark:text-pure-white leading-tight mb-4">
            Panel de Administración CMS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-light">
            Gestiona el contenido de la sección "Aprende"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={exportContent}
              className="flex items-center space-x-2 bg-warm-orange/20 hover:bg-warm-orange/30 text-black dark:text-pure-white px-4 py-2 rounded-lg font-light transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
            
            <label className="flex items-center space-x-2 bg-warm-pink/20 hover:bg-warm-pink/30 text-black dark:text-pure-white px-4 py-2 rounded-lg font-light transition-all duration-200 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Importar</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
            
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres resetear todo el contenido?')) {
                  resetContent();
                }
              }}
              className="flex items-center space-x-2 bg-warm-red/20 hover:bg-warm-red/30 text-black dark:text-pure-white px-4 py-2 rounded-lg font-light transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-gray-200/70 dark:bg-gray-700/70 hover:bg-gray-300/70 dark:hover:bg-gray-600/70 text-black dark:text-pure-white px-4 py-2 rounded-lg font-light transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pages')}
                className={`py-2 px-1 border-b-2 font-light text-sm ${
                  activeTab === 'pages'
                    ? 'border-warm-orange text-warm-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Gestionar Páginas
              </button>
              <button
                onClick={() => setActiveTab('navigation')}
                className={`py-2 px-1 border-b-2 font-light text-sm ${
                  activeTab === 'navigation'
                    ? 'border-warm-orange text-warm-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Gestionar Navegación
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'pages' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Page List */}
            <div className="bg-gray-50/70 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-light text-black dark:text-pure-white">Páginas</h2>
                <button
                  onClick={() => setShowNewPageForm(true)}
                  className="p-2 text-warm-orange hover:text-warm-red transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {showNewPageForm && (
                <div className="mb-4 p-4 bg-white/50 dark:bg-gray-800/30 rounded-lg">
                  <input
                    type="text"
                    placeholder="ID de la página"
                    value={newPageForm.id}
                    onChange={(e) => setNewPageForm(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full mb-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Título de la página"
                    value={newPageForm.title}
                    onChange={(e) => setNewPageForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full mb-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateNewPage}
                      className="px-3 py-1 bg-warm-orange/20 text-black dark:text-pure-white rounded text-sm"
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => setShowNewPageForm(false)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-pure-white rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {Object.keys(content.pageContent).map(pageId => (
                  <div key={pageId} className="flex justify-between items-center">
                    <button
                      onClick={() => setSelectedPage(pageId)}
                      className={`flex-1 text-left p-2 rounded-lg text-sm ${
                        selectedPage === pageId
                          ? 'bg-warm-orange/20 text-warm-orange'
                          : 'hover:bg-white/50 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {content.pageContent[pageId].title}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar esta página?')) {
                          deletePage(pageId);
                        }
                      }}
                      className="p-1 text-warm-red hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Page Editor */}
            <div className="lg:col-span-2 bg-gray-50/70 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-6">
              {selectedPage && content.pageContent[selectedPage] && (
                <div>
                  <h2 className="text-lg font-light text-black dark:text-pure-white mb-4">
                    Editando: {content.pageContent[selectedPage].title}
                  </h2>

                  <div className="space-y-6">
                    {content.pageContent[selectedPage].sections.map((section) => (
                      <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        {editingSection === section.id ? (
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                            <textarea
                              value={editForm.content}
                              onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                              rows={8}
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveSection(selectedPage, section.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-warm-orange/20 text-black dark:text-pure-white rounded text-sm"
                              >
                                <Save className="h-3 w-3" />
                                <span>Guardar</span>
                              </button>
                              <button
                                onClick={() => setEditingSection(null)}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-pure-white rounded text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-light text-black dark:text-pure-white">{section.title}</h3>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEditSection(section)}
                                  className="p-1 text-warm-orange hover:text-warm-red transition-colors"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSection(selectedPage, section.id)}
                                  className="p-1 text-warm-red hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                              {section.content.substring(0, 200)}...
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={() => handleAddSection(selectedPage)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-warm-orange hover:text-warm-orange transition-colors"
                    >
                      + Añadir nueva sección
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'navigation' && (
          <div className="bg-gray-50/70 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-lg font-light text-black dark:text-pure-white mb-6">Gestionar Navegación</h2>
            
            <div className="space-y-4">
              {content.navigationSections.map((section) => (
                <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <button
                    onClick={() => toggleNavSection(section.id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="font-light text-black dark:text-pure-white">{section.title}</h3>
                    {expandedNavSections[section.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedNavSections[section.id] && (
                    <div className="mt-4 space-y-2">
                      {section.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/30 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.title}</span>
                          <button
                            onClick={() => removeNavigationItem(section.id, item.id)}
                            className="text-warm-red hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCMS; 