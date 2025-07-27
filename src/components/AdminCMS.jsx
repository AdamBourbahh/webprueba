import { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, Trash2, Download, Upload, RotateCcw, Edit3, ChevronDown, ChevronRight, LogOut, AlertCircle } from 'lucide-react';

const AdminCMS = () => {
  const { 
    content, 
    loading,
    error,
    isBackendAvailable,
    updatePageContent, 
    addNewPage, 
    deletePage, 
    addNavigationItem, 
    removeNavigationItem,
    resetContent, 
    exportContent, 
    importContent 
  } = useContent();

  const { user, isAuthenticated, requireAdmin, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('pages');
  const [selectedPage, setSelectedPage] = useState('introduccion');
  const [editingPage, setEditingPage] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [expandedNavSections, setExpandedNavSections] = useState({});

  // Verificar autenticación y permisos de admin
  useEffect(() => {
    if (!isAuthenticated || !requireAdmin()) {
      // Redirigir al login si no está autenticado o no es admin
      window.location.hash = '#login';
    }
  }, [isAuthenticated, requireAdmin]);

  const handleLogout = async () => {
    await logout();
    window.location.hash = '#home';
  };

  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-pure-white dark:bg-black pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-orange mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  // Verificar autenticación
  if (!isAuthenticated || !requireAdmin()) {
    return (
      <div className="min-h-screen bg-pure-white dark:bg-black pt-16 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-light text-black dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Necesitas permisos de administrador para acceder a esta sección.
          </p>
          <button
            onClick={() => window.location.hash = '#login'}
            className="bg-warm-orange hover:bg-warm-red text-white px-6 py-2 rounded-lg transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problemas
  if (error && !isBackendAvailable) {
    return (
      <div className="min-h-screen bg-pure-white dark:bg-black pt-16 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-light text-black dark:text-white mb-2">
            Modo Offline
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El backend no está disponible. Funcionando con datos locales.
          </p>
        </div>
      </div>
    );
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

  const handleSaveSectionOriginal = async () => {
    if (!editingSection || !selectedPage) return;
    
    const pageContent = content.pageContent[selectedPage];
    if (!pageContent) return;

    const updatedSections = pageContent.sections.map(section => 
      section.id === editingSection.id ? editingSection : section
    );

    const updatedPageContent = {
      ...pageContent,
      sections: updatedSections
    };

    try {
      await updatePageContent(selectedPage, updatedPageContent);
      setEditingSection(null);
      alert('Sección guardada exitosamente');
    } catch (error) {
      alert('Error al guardar sección: ' + error.message);
    }
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

  const handleCreateNewPage = async () => {
    if (!newPageForm.id || !newPageForm.title) return;
    
    const newPage = {
      title: newPageForm.title,
      sections: [{
        id: 'intro',
        title: newPageForm.sectionTitle || 'Introducción',
        content: newPageForm.sectionContent || 'Contenido de la página...'
      }]
    };
    
    try {
      await addNewPage(newPageForm.id, newPage);
      setNewPageForm({ id: '', title: '', sectionTitle: '', sectionContent: '' });
      setShowNewPageForm(false);
      alert('Página creada exitosamente');
    } catch (error) {
      alert('Error al crear página: ' + error.message);
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await importContent(e.target.result);
          if (result.success) {
            alert('Contenido importado exitosamente');
          } else {
            alert('Error al importar: ' + result.error);
          }
        } catch (error) {
          alert('Error al procesar archivo: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSavePage = async () => {
    if (!editingPage) return;
    
    try {
      await updatePageContent(editingPage.id, editingPage);
      setEditingPage(null);
      alert('Página guardada exitosamente');
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleAddPage = async (newPageData) => {
    try {
      await addNewPage(newPageData.id, newPageData);
      setShowNewPageForm(false);
      alert('Página creada exitosamente');
    } catch (error) {
      alert('Error al crear página: ' + error.message);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la página "${pageId}"?`)) {
      try {
        await deletePage(pageId);
        if (selectedPage === pageId) {
          setSelectedPage('introduccion');
        }
        alert('Página eliminada exitosamente');
      } catch (error) {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };



  const handleImportContent = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importContent(text);
      
      if (result.success) {
        alert('Contenido importado exitosamente');
      } else {
        alert('Error al importar: ' + result.error);
      }
    } catch (error) {
      alert('Error al procesar archivo: ' + error.message);
    }
  };

  const handleResetContent = async () => {
    if (confirm('¿Estás seguro de que quieres resetear todo el contenido? Esta acción no se puede deshacer.')) {
      try {
        await resetContent();
        alert('Contenido reseteado exitosamente');
      } catch (error) {
        alert('Error al resetear: ' + error.message);
      }
    }
  };

  const toggleNavSection = (sectionId) => {
    setExpandedNavSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderPagesTab = () => (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-light text-black dark:text-white">
          Gestión de Páginas
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewPageForm(true)}
            className="flex items-center space-x-2 bg-warm-orange hover:bg-warm-red text-white px-4 py-2 rounded-lg font-light transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Página</span>
          </button>
        </div>
      </div>

      {/* Selector de página */}
      <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Página a editar:
        </label>
        <select
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange"
        >
          {Object.keys(content.pageContent || {}).map(pageId => (
            <option key={pageId} value={pageId}>
              {content.pageContent[pageId]?.title || pageId}
            </option>
          ))}
        </select>
      </div>

      {/* Editor de página */}
      {selectedPage && content.pageContent[selectedPage] && (
        <div className="space-y-4">
          {/* Información de la página */}
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-light text-black dark:text-white">
                {content.pageContent[selectedPage].title}
              </h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingPage({
                    id: selectedPage,
                    ...content.pageContent[selectedPage]
                  })}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeletePage(selectedPage)}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>

            {/* Secciones */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-700 dark:text-gray-300">
                Secciones ({content.pageContent[selectedPage].sections?.length || 0}):
              </h5>
              {content.pageContent[selectedPage].sections?.map((section, index) => (
                <div key={section.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-medium text-gray-900 dark:text-white">
                        {section.title}
                      </h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {section.content.substring(0, 100)}...
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingSection({ ...section })}
                      className="bg-warm-orange hover:bg-warm-red text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-black dark:text-white mb-2">
                Panel de Administración
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona el contenido de la plataforma educativa - Bienvenido, {user?.username}
              </p>
              {!isBackendAvailable && (
                <div className="mt-2 text-yellow-600 dark:text-yellow-400 text-sm">
                  ⚠️ Modo offline - Funcionalidad limitada
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'pages', name: 'Páginas', icon: Edit3 },
                { id: 'navigation', name: 'Navegación', icon: ChevronRight },
                { id: 'import-export', name: 'Datos', icon: Download }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-warm-orange text-warm-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          {activeTab === 'pages' && renderPagesTab()}
          {activeTab === 'navigation' && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Funcionalidad de navegación en desarrollo...
            </div>
          )}
          {activeTab === 'import-export' && (
            <div className="space-y-6">
              <h3 className="text-lg font-light text-black dark:text-white">
                Importar/Exportar Datos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Exportar</h4>
                  <button
                    onClick={exportContent}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors w-full justify-center"
                  >
                    <Download className="h-4 w-4" />
                    <span>Exportar Contenido</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Importar</h4>
                  <label className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer w-full justify-center">
                    <Upload className="h-4 w-4" />
                    <span>Importar Contenido</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportContent}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleResetContent}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Resetear Todo el Contenido</span>
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  ⚠️ Esta acción eliminará todo el contenido actual y no se puede deshacer.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para editar página */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Editar Página: {editingPage.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título:
                </label>
                <input
                  type="text"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    title: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingPage(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePage}
                className="flex items-center space-x-2 bg-warm-orange hover:bg-warm-red text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar sección */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Editar Sección: {editingSection.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título:
                </label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    title: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido (Markdown):
                </label>
                <textarea
                  value={editingSection.content}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    content: e.target.value
                  })}
                  rows={15}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange font-mono text-sm"
                  placeholder="Escribe tu contenido en Markdown..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                                 onClick={handleSaveSectionOriginal}
                className="flex items-center space-x-2 bg-warm-orange hover:bg-warm-red text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nueva página */}
      {showNewPageForm && (
        <NewPageModal
          onSave={handleAddPage}
          onCancel={() => setShowNewPageForm(false)}
        />
      )}
    </div>
  );
};

// Componente para modal de nueva página
const NewPageModal = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    category_id: 'get-started',
    sections: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id || !formData.title) {
      alert('ID y título son requeridos');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium text-black dark:text-white mb-4">
          Nueva Página
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID de la página:
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({
                ...formData,
                id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
              })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange"
              placeholder="ejemplo-pagina"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título:
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({
                ...formData,
                title: e.target.value
              })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange"
              placeholder="Título de la página"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción:
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({
                ...formData,
                description: e.target.value
              })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange"
              placeholder="Descripción de la página"
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-warm-orange hover:bg-warm-red text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Página</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCMS; 