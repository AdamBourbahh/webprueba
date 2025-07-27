// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Cliente HTTP base con configuración para cookies
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      credentials: 'include', // Importante para enviar cookies de sesión
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Si hay un body y no es FormData, convertir a JSON
    if (config.body && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    // Si es FormData, quitar el Content-Type para que el browser lo setee automáticamente
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Si la respuesta no es ok, lanzar error con detalles
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      // Si no hay contenido, devolver true
      if (response.status === 204) {
        return true;
      }

      // Intentar parsear JSON, si falla devolver texto
      try {
        return await response.json();
      } catch {
        return await response.text();
      }
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Métodos HTTP shortcuts
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// === SERVICIOS DE AUTENTICACIÓN ===
export const authService = {
  // Verificar estado de autenticación
  async getStatus() {
    return apiClient.get('/auth/status');
  },

  // Registro de usuario
  async register(userData) {
    return apiClient.post('/auth/register', userData);
  },

  // Login
  async login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },

  // Logout
  async logout() {
    return apiClient.post('/auth/logout');
  },

  // Obtener perfil
  async getProfile() {
    return apiClient.get('/auth/profile');
  },

  // Actualizar perfil
  async updateProfile(profileData) {
    return apiClient.put('/auth/profile', profileData);
  },

  // Cambiar contraseña
  async changePassword(passwordData) {
    return apiClient.put('/auth/change-password', passwordData);
  }
};

// === SERVICIOS DEL CMS ===
export const cmsService = {
  // Obtener toda la estructura de contenido
  async getContent() {
    return apiClient.get('/cms/content');
  },

  // Obtener página específica
  async getPage(pageId) {
    return apiClient.get(`/cms/pages/${pageId}`);
  },

  // Crear nueva página (admin)
  async createPage(pageData) {
    return apiClient.post('/cms/pages', pageData);
  },

  // Actualizar página (admin)
  async updatePage(pageId, pageData) {
    return apiClient.put(`/cms/pages/${pageId}`, pageData);
  },

  // Eliminar página (admin)
  async deletePage(pageId) {
    return apiClient.delete(`/cms/pages/${pageId}`);
  },

  // Crear nueva sección (admin)
  async createSection(sectionData) {
    return apiClient.post('/cms/sections', sectionData);
  },

  // Actualizar sección (admin)
  async updateSection(sectionId, sectionData) {
    return apiClient.put(`/cms/sections/${sectionId}`, sectionData);
  },

  // Eliminar sección (admin)
  async deleteSection(sectionId) {
    return apiClient.delete(`/cms/sections/${sectionId}`);
  },

  // Subir archivo Markdown (admin)
  async uploadMarkdown(file, pageId, sectionTitle) {
    const formData = new FormData();
    formData.append('markdown', file);
    if (pageId) formData.append('page_id', pageId);
    if (sectionTitle) formData.append('section_title', sectionTitle);

    return apiClient.post('/cms/upload-markdown', formData);
  },

  // Convertir Markdown a HTML
  async convertMarkdown(markdown) {
    return apiClient.post('/cms/convert-markdown', { markdown });
  },

  // Exportar contenido (admin)
  async exportContent() {
    return apiClient.get('/cms/export');
  },

  // Importar contenido (admin)
  async importContent(contentData) {
    return apiClient.post('/cms/import', contentData);
  },

  // Obtener categorías
  async getCategories() {
    return apiClient.get('/cms/categories');
  },

  // Crear categoría (admin)
  async createCategory(categoryData) {
    return apiClient.post('/cms/categories', categoryData);
  }
};

// === SERVICIOS DE EJERCICIOS DE CÓDIGO ===
export const codeService = {
  // Obtener ejercicios
  async getExercises(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return apiClient.get(`/code/exercises${params ? '?' + params : ''}`);
  },

  // Obtener ejercicio específico
  async getExercise(exerciseId) {
    return apiClient.get(`/code/exercises/${exerciseId}`);
  },

  // Crear ejercicio (admin)
  async createExercise(exerciseData) {
    return apiClient.post('/code/exercises', exerciseData);
  },

  // Actualizar ejercicio (admin)
  async updateExercise(exerciseId, exerciseData) {
    return apiClient.put(`/code/exercises/${exerciseId}`, exerciseData);
  },

  // Enviar código para evaluación
  async submitCode(submissionData) {
    return apiClient.post('/code/submit', submissionData);
  },

  // Obtener estado de submission
  async getSubmission(submissionId) {
    return apiClient.get(`/code/submissions/${submissionId}`);
  },

  // Obtener historial de submissions
  async getSubmissions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return apiClient.get(`/code/submissions${params ? '?' + params : ''}`);
  }
};

// === SERVICIOS DE PROGRESO ===
export const progressService = {
  // Obtener progreso completo del usuario
  async getUserProgress() {
    return apiClient.get('/progress/user-progress');
  },

  // Marcar página/sección como completada
  async markComplete(progressData) {
    return apiClient.post('/progress/complete', progressData);
  },

  // Obtener progreso de página específica
  async getPageProgress(pageId) {
    return apiClient.get(`/progress/page/${pageId}`);
  },

  // Resetear progreso (auth requerida)
  async resetProgress() {
    return apiClient.delete('/progress/reset');
  },

  // Migrar progreso de cookie a BD
  async migrateFromCookie() {
    return apiClient.post('/progress/migrate-from-cookie');
  },

  // Obtener estadísticas globales
  async getGlobalStats() {
    return apiClient.get('/progress/stats/global');
  },

  // Obtener leaderboard
  async getLeaderboard(limit = 20) {
    return apiClient.get(`/progress/leaderboard?limit=${limit}`);
  }
};

// === UTILIDADES ===
export const apiUtils = {
  // Verificar si el backend está disponible
  async healthCheck() {
    try {
      return await apiClient.get('/health');
    } catch (error) {
      console.error('Backend no disponible:', error);
      return false;
    }
  },

  // Obtener información del servidor
  async getServerInfo() {
    return apiClient.get('/health');
  }
};

// Hook para manejar errores de API de forma consistente
export const useApiError = () => {
  const handleError = (error) => {
    console.error('API Error:', error);
    
    // Aquí puedes agregar lógica para mostrar notificaciones, redirects, etc.
    if (error.message.includes('401') || error.message.includes('No autorizado')) {
      // Usuario no autenticado, redirigir al login
      window.location.hash = '#login';
    }
    
    return error.message || 'Error desconocido';
  };

  return { handleError };
};

// Exportar cliente base para casos especiales
export { apiClient };

export default {
  auth: authService,
  cms: cmsService,
  code: codeService,
  progress: progressService,
  utils: apiUtils
}; 