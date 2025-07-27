import { createContext, useContext, useState, useEffect } from 'react';
import { authService, progressService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar estado de autenticación al cargar
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authService.getStatus();
      
      if (response.authenticated && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Migrar progreso de cookies si es necesario
        try {
          await progressService.migrateFromCookie();
        } catch (err) {
          // No es crítico si falla la migración
          console.warn('No se pudo migrar progreso:', err);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.warn('No se pudo verificar autenticación:', error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Función de login
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Migrar progreso de cookies después del login
        try {
          await progressService.migrateFromCookie();
        } catch (err) {
          console.warn('No se pudo migrar progreso tras login:', err);
        }
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Respuesta de login inválida');
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Migrar progreso de cookies después del registro
        try {
          await progressService.migrateFromCookie();
        } catch (err) {
          console.warn('No se pudo migrar progreso tras registro:', err);
        }
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Respuesta de registro inválida');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      // Aunque falle la llamada al servidor, limpiar estado local
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      await authService.updateProfile(profileData);
      
      // Actualizar usuario en el estado local
      setUser(prev => ({
        ...prev,
        ...profileData
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para obtener perfil completo
  const getProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(prev => ({ ...prev, ...profile }));
      return { success: true, profile };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return { success: false, error: error.message };
    }
  };

  // Verificar si el usuario es admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Verificar si el usuario está autenticado y es admin
  const requireAdmin = () => {
    return isAuthenticated && isAdmin();
  };

  const value = {
    // Estado
    user,
    loading,
    isAuthenticated,
    
    // Funciones de autenticación
    login,
    register,
    logout,
    checkAuthStatus,
    
    // Funciones de perfil
    updateProfile,
    changePassword,
    getProfile,
    
    // Utilidades
    isAdmin,
    requireAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 