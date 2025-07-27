// Configuración de API para producción y desarrollo
const isDevelopment = import.meta.env.MODE === 'development';
const isEmulatorMode = window.location.hostname === 'localhost' && isDevelopment;

// URLs de la API
const API_CONFIG = {
  // Emuladores locales (cuando se ejecuta firebase emulators:start)
  emulator: 'http://localhost:5001/cpcugr/us-central1/api/api',
  
  // Desarrollo con backend remoto
  development: import.meta.env.VITE_API_URL_DEV || 'http://localhost:3001/api',
  
  // Producción
  production: import.meta.env.VITE_API_URL || 'https://us-central1-tu-proyecto.cloudfunctions.net/api/api'
};

// Determinar URL base
const getBaseURL = () => {
  if (isEmulatorMode) {
    console.log('🧪 Modo emulador: usando Functions local');
    return API_CONFIG.emulator;
  }
  
  if (isDevelopment) {
    console.log('🔧 Modo desarrollo: usando backend remoto o local');
    return API_CONFIG.development;
  }
  
  console.log('🚀 Modo producción: usando Firebase Functions');
  return API_CONFIG.production;
};

const BASE_URL = getBaseURL();

// Helper para hacer requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Para cookies de sesión
  };

  const config = { ...defaultOptions, ...options };

  try {
    console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error de red' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API Response: ${url}`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    throw error;
  }
};

// Health check para verificar conectividad
export const healthCheck = async () => {
  try {
    const response = await apiRequest('/health');
    return { 
      available: true, 
      ...response,
      mode: isEmulatorMode ? 'emulator' : (isDevelopment ? 'development' : 'production')
    };
  } catch (error) {
    console.warn('Backend no disponible:', error.message);
    return { 
      available: false, 
      error: error.message,
      mode: isEmulatorMode ? 'emulator' : (isDevelopment ? 'development' : 'production')
    };
  }
};

// Servicios de CMS
export const cmsService = {
  // Obtener contenido completo
  async getContent() {
    return apiRequest('/cms/content');
  },

  // Obtener página específica
  async getPage(pageId) {
    return apiRequest(`/cms/pages/${pageId}`);
  },

  // Crear nueva página
  async createPage(pageData) {
    return apiRequest('/cms/pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  },

  // Actualizar página
  async updatePage(pageId, pageData) {
    return apiRequest(`/cms/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(pageData),
    });
  },

  // Eliminar página
  async deletePage(pageId) {
    return apiRequest(`/cms/pages/${pageId}`, {
      method: 'DELETE',
    });
  },

  // Crear sección
  async createSection(sectionData) {
    return apiRequest('/cms/sections', {
      method: 'POST',
      body: JSON.stringify(sectionData),
    });
  },

  // Actualizar sección
  async updateSection(sectionId, sectionData) {
    return apiRequest(`/cms/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(sectionData),
    });
  },

  // Eliminar sección
  async deleteSection(sectionId) {
    return apiRequest(`/cms/sections/${sectionId}`, {
      method: 'DELETE',
    });
  },

  // Exportar contenido
  async exportContent() {
    return apiRequest('/cms/export');
  }
};

// Servicios de autenticación
export const authService = {
  // Registro
  async register(userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login
  async login(credentials) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Logout
  async logout() {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Obtener usuario actual
  async getCurrentUser(userId) {
    return apiRequest(`/auth/me?userId=${userId}`);
  },

  // Actualizar perfil
  async updateProfile(userId, profileData) {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      headers: {
        'user-id': userId
      },
      body: JSON.stringify(profileData),
    });
  },

  // Cambiar contraseña
  async changePassword(userId, passwordData) {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      headers: {
        'user-id': userId
      },
      body: JSON.stringify(passwordData),
    });
  }
};

// Servicios de progreso (placeholder)
export const progressService = {
  async getUserProgress(userId) {
    // TODO: Implementar cuando migremos progress.js
    return { progress: {} };
  },

  async updateProgress(userId, pageId, progressData) {
    // TODO: Implementar cuando migremos progress.js
    return { success: true };
  }
};

// Servicios de código (placeholder)
export const codeService = {
  async submitCode(exerciseId, code, language) {
    // TODO: Implementar cuando migremos code.js
    return { 
      submissionId: 'demo-' + Date.now(),
      status: 'queued'
    };
  },

  async getSubmission(submissionId) {
    // TODO: Implementar cuando migremos code.js
    return {
      id: submissionId,
      status: 'completed',
      result: 'accepted',
      score: 100
    };
  }
};

// Debug info
console.log('🔧 API Configuration:', {
  baseURL: BASE_URL,
  mode: isEmulatorMode ? 'emulator' : (isDevelopment ? 'development' : 'production'),
  environment: import.meta.env.MODE
}); 