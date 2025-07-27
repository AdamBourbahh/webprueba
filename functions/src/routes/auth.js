const express = require('express');
const bcrypt = require('bcryptjs');
const { firestoreHelpers } = require('../config/firestore');
const router = express.Router();

// POST /register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email y password son requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar si el usuario ya existe (por username)
    const existingUsersByUsername = await firestoreHelpers.getCollection(
      'users',
      { field: 'username', operator: '==', value: username }
    );

    if (existingUsersByUsername.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    // Verificar si el email ya existe
    const existingUsersByEmail = await firestoreHelpers.getCollection(
      'users',
      { field: 'email', operator: '==', value: email }
    );

    if (existingUsersByEmail.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const userData = {
      username,
      email,
      password: hashedPassword,
      role: 'student',
      isActive: true,
      profile: {
        fullName: '',
        bio: '',
        university: 'Universidad de Granada',
        year: '',
        interests: []
      },
      stats: {
        problemsSolved: 0,
        contestsParticipated: 0,
        currentStreak: 0,
        maxStreak: 0,
        totalPoints: 0
      }
    };

    const userId = await firestoreHelpers.createDoc('users', null, userData);

    // NO almacenar sesión aquí - el frontend manejará esto
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: userId,
        username,
        email,
        role: 'student',
        isActive: true
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username y password son requeridos' 
      });
    }

    // Buscar usuario por username
    const users = await firestoreHelpers.getCollection(
      'users',
      { field: 'username', operator: '==', value: username }
    );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Usuario desactivado' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último acceso
    await firestoreHelpers.updateDoc('users', user.id, {
      lastLogin: new Date().toISOString()
    });

    // Respuesta sin la contraseña
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /logout - Cerrar sesión
router.post('/logout', (req, res) => {
  // En un sistema basado en JWT o cookies, aquí invalidarías el token
  // Para simplificar, solo enviamos respuesta exitosa
  res.json({ message: 'Logout exitoso' });
});

// GET /me - Obtener información del usuario actual
router.get('/me', async (req, res) => {
  try {
    // En una implementación real, obtendrías el userId del token/sesión
    // Por ahora, esperamos que se envíe en headers o query params
    const userId = req.headers['user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = await firestoreHelpers.getDoc('users', userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /profile - Actualizar perfil del usuario
router.put('/profile', async (req, res) => {
  try {
    const userId = req.headers['user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = await firestoreHelpers.getDoc('users', userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { fullName, bio, year, interests } = req.body;
    
    const updateData = {
      profile: {
        ...user.profile,
        fullName: fullName || user.profile?.fullName || '',
        bio: bio || user.profile?.bio || '',
        year: year || user.profile?.year || '',
        interests: interests || user.profile?.interests || []
      }
    };

    await firestoreHelpers.updateDoc('users', userId, updateData);

    res.json({ message: 'Perfil actualizado exitosamente' });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// PUT /change-password - Cambiar contraseña
router.put('/change-password', async (req, res) => {
  try {
    const userId = req.headers['user-id'] || req.query.userId;
    const { currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Contraseña actual y nueva son requeridas' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }

    const user = await firestoreHelpers.getDoc('users', userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const validCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validCurrentPassword) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await firestoreHelpers.updateDoc('users', userId, {
      password: hashedNewPassword
    });

    res.json({ message: 'Contraseña cambiada exitosamente' });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

// GET /users - Obtener lista de usuarios (solo admin)
router.get('/users', async (req, res) => {
  try {
    const userId = req.headers['user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar que el usuario es admin
    const currentUser = await firestoreHelpers.getDoc('users', userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    const users = await firestoreHelpers.getCollection(
      'users',
      null,
      { field: 'createdAt', direction: 'desc' }
    );

    // Remover contraseñas de la respuesta
    const usersWithoutPasswords = users.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({ users: usersWithoutPasswords });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router; 