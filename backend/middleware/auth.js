const { getQuery } = require('../config/database');

// Middleware para verificar autenticación
const requireAuth = async (req, res, next) => {
  try {
    // Verificar si hay sesión activa
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        error: 'No autorizado', 
        message: 'Debes iniciar sesión para acceder a este recurso' 
      });
    }

    // Obtener información del usuario desde la base de datos
    const user = await getQuery(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (!user) {
      // Limpiar sesión si el usuario no existe
      req.session.destroy();
      return res.status(401).json({ 
        error: 'Usuario no encontrado', 
        message: 'La sesión ha expirado' 
      });
    }

    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Cuenta desactivada', 
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' 
      });
    }

    // Agregar información del usuario al request
    req.user = user;
    next();

  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Middleware para verificar permisos de administrador
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autorizado', 
      message: 'Debes iniciar sesión' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado', 
      message: 'Se requieren permisos de administrador para acceder a este recurso' 
    });
  }

  next();
};

// Middleware opcional para agregar información de usuario si está autenticado
const optionalAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await getQuery(
        'SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = 1',
        [req.session.userId]
      );

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    next(); // Continuar sin usuario autenticado
  }
};

// Middleware para verificar propiedad de recurso o admin
const requireOwnershipOrAdmin = (userIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autorizado', 
        message: 'Debes iniciar sesión' 
      });
    }

    // Los administradores pueden acceder a todo
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar si el usuario es propietario del recurso
    const resourceUserId = req.body[userIdField] || req.params[userIdField] || req.query[userIdField];
    
    if (resourceUserId && parseInt(resourceUserId) === req.user.id) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Acceso denegado', 
      message: 'Solo puedes acceder a tus propios recursos' 
    });
  };
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth,
  requireOwnershipOrAdmin
}; 