# 🔥 Migración SQLite → Firebase/Firestore

Guía completa para migrar tu plataforma a Firebase.

## 📋 PASO 1: Setup inicial de Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login en Firebase
firebase login

# Inicializar proyecto
firebase init
# Seleccionar:
# - Firestore
# - Functions  
# - Hosting
```

## 🗄️ PASO 2: Nuevo esquema Firestore

### Estructura de colecciones:

```
/users/{userId}
/content_categories/{categoryId}
/content_pages/{pageId}
/content_sections/{sectionId}
/code_exercises/{exerciseId}
/code_submissions/{submissionId}
/user_progress/{userId}/pages/{pageId}
/uploaded_files/{fileId}
```

## 🔧 PASO 3: Crear funciones helper para Firestore

```javascript
// functions/src/utils/firestore.js
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Helper functions
const firestoreHelpers = {
  // Get document
  async getDoc(collection, docId) {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  // Get collection with query
  async getCollection(collection, whereClause = null, orderBy = null) {
    let query = db.collection(collection);
    
    if (whereClause) {
      query = query.where(whereClause.field, whereClause.operator, whereClause.value);
    }
    
    if (orderBy) {
      query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Create document
  async createDoc(collection, docId, data) {
    const docRef = docId ? 
      db.collection(collection).doc(docId) : 
      db.collection(collection).doc();
    
    await docRef.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return docRef.id;
  },

  // Update document
  async updateDoc(collection, docId, data) {
    await db.collection(collection).doc(docId).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  // Delete document
  async deleteDoc(collection, docId) {
    await db.collection(collection).doc(docId).delete();
  },

  // Batch operations
  batch() {
    return db.batch();
  }
};

module.exports = { db, firestoreHelpers };
```

## 🎯 PASO 4: Migrar config/database.js

```javascript
// functions/src/config/firestore.js
const { firestoreHelpers } = require('../utils/firestore');

// Inicializar datos por defecto
async function initializeFirestore() {
  try {
    // Verificar si ya existe un admin
    const adminUser = await firestoreHelpers.getDoc('users', 'admin');
    
    if (!adminUser) {
      console.log('Creando usuario admin...');
      await firestoreHelpers.createDoc('users', 'admin', {
        username: 'admin',
        email: 'admin@cpc-ugr.es',
        password: '$2a$12$hashedPassword', // Usar bcrypt
        role: 'admin',
        isActive: true
      });
    }

    // Crear categorías por defecto
    const categoriesExist = await firestoreHelpers.getCollection('content_categories');
    if (categoriesExist.length === 0) {
      console.log('Creando categorías por defecto...');
      
      const categories = [
        { id: 'get-started', title: 'GET STARTED', description: 'Primeros pasos', order_index: 0 },
        { id: 'estructuras', title: 'ESTRUCTURAS DE DATOS', description: 'Arrays, listas, árboles', order_index: 1 },
        { id: 'algoritmos', title: 'ALGORITMOS', description: 'Algoritmos fundamentales', order_index: 2 }
      ];

      for (const category of categories) {
        await firestoreHelpers.createDoc('content_categories', category.id, category);
      }
    }

    console.log('✅ Firestore inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firestore:', error);
  }
}

module.exports = { firestoreHelpers, initializeFirestore };
```

## 🔄 PASO 5: Migrar rutas principales

### CMS Routes (functions/src/routes/cms.js):

```javascript
const express = require('express');
const { firestoreHelpers } = require('../config/firestore');
const router = express.Router();

// GET /content - Obtener estructura completa
router.get('/content', async (req, res) => {
  try {
    // Obtener categorías
    const categories = await firestoreHelpers.getCollection(
      'content_categories', 
      null, 
      { field: 'order_index' }
    );

    // Obtener páginas
    const pages = await firestoreHelpers.getCollection(
      'content_pages',
      { field: 'is_published', operator: '==', value: true },
      { field: 'order_index' }
    );

    // Obtener secciones
    const sections = await firestoreHelpers.getCollection(
      'content_sections',
      null,
      { field: 'order_index' }
    );

    // Construir estructura de navegación
    const navigationSections = categories.map(category => ({
      id: category.id,
      title: category.title,
      items: pages
        .filter(page => page.category_id === category.id)
        .map(page => ({
          id: page.id,
          title: page.title
        }))
    }));

    // Construir contenido de páginas
    const pageContent = {};
    pages.forEach(page => {
      const pageSections = sections
        .filter(section => section.page_id === page.id)
        .map(section => ({
          id: section.id,
          title: section.title,
          content: section.content
        }));

      pageContent[page.id] = {
        title: page.title,
        sections: pageSections
      };
    });

    // Construir guía de aprendizaje
    const learningGuide = pages
      .sort((a, b) => a.order_index - b.order_index)
      .map((page, index) => ({
        id: page.id,
        title: page.title,
        order: index + 1
      }));

    res.json({
      navigationSections,
      pageContent,
      learningGuide
    });

  } catch (error) {
    console.error('Error al obtener contenido:', error);
    res.status(500).json({ error: 'Error al cargar el contenido' });
  }
});

// POST /pages - Crear página
router.post('/pages', async (req, res) => {
  try {
    const { id, title, description, category_id, order_index } = req.body;
    
    await firestoreHelpers.createDoc('content_pages', id, {
      title,
      description: description || '',
      category_id: category_id || '',
      order_index: order_index || 0,
      is_published: true
    });

    res.status(201).json({ message: 'Página creada exitosamente', id });
  } catch (error) {
    console.error('Error creando página:', error);
    res.status(500).json({ error: 'Error al crear la página' });
  }
});

// PUT /pages/:pageId - Actualizar página
router.put('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const updateData = req.body;
    
    await firestoreHelpers.updateDoc('content_pages', pageId, updateData);
    
    res.json({ message: 'Página actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando página:', error);
    res.status(500).json({ error: 'Error al actualizar la página' });
  }
});

// POST /sections - Crear sección
router.post('/sections', async (req, res) => {
  try {
    const { id, page_id, title, content, order_index } = req.body;
    
    await firestoreHelpers.createDoc('content_sections', id, {
      page_id,
      title,
      content,
      content_type: 'markdown',
      order_index: order_index || 0
    });

    res.status(201).json({ message: 'Sección creada exitosamente', id });
  } catch (error) {
    console.error('Error creando sección:', error);
    res.status(500).json({ error: 'Error al crear la sección' });
  }
});

module.exports = router;
```

### Auth Routes (functions/src/routes/auth.js):

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const { firestoreHelpers } = require('../config/firestore');
const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUsers = await firestoreHelpers.getCollection(
      'users',
      { field: 'username', operator: '==', value: username }
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const userId = await firestoreHelpers.createDoc('users', null, {
      username,
      email,
      password: hashedPassword,
      role: 'student',
      isActive: true
    });

    // Configurar sesión (usar Firebase Auth en producción)
    req.session.userId = userId;

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: userId, username, email, role: 'student' }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const users = await firestoreHelpers.getCollection(
      'users',
      { field: 'username', operator: '==', value: username }
    );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Configurar sesión
    req.session.userId = user.id;

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
```

## 🚀 PASO 6: Functions principal

```javascript
// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const { initializeFirestore } = require('./src/config/firestore');

// Importar rutas
const cmsRoutes = require('./src/routes/cms');
const authRoutes = require('./src/routes/auth');
const progressRoutes = require('./src/routes/progress');
const codeRoutes = require('./src/routes/code');

const app = express();

// Middleware
app.use(cors({ 
  origin: true, 
  credentials: true 
}));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/cms', cmsRoutes);
app.use('/auth', authRoutes);
app.use('/progress', progressRoutes);
app.use('/code', codeRoutes);

// Inicializar Firestore al arrancar
initializeFirestore();

// Exportar como Cloud Function
exports.api = functions.https.onRequest(app);
```

## 📊 PASO 7: Script de migración de datos

```javascript
// scripts/migrate-to-firestore.js
const admin = require('firebase-admin');
const sqlite3 = require('sqlite3').verbose();

// Inicializar Firebase Admin
const serviceAccount = require('./path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Abrir SQLite
const sqliteDb = new sqlite3.Database('./backend/database/cpc.db');

async function migrateData() {
  console.log('🔄 Iniciando migración SQLite → Firestore...');

  try {
    // Migrar categorías
    await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM navigation_categories', async (err, rows) => {
        if (err) reject(err);
        
        for (const row of rows) {
          await db.collection('content_categories').doc(row.id).set({
            title: row.title,
            description: row.description,
            order_index: row.order_index,
            is_active: row.is_active,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        console.log(`✅ Migradas ${rows.length} categorías`);
        resolve();
      });
    });

    // Migrar páginas
    await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM content_pages', async (err, rows) => {
        if (err) reject(err);
        
        for (const row of rows) {
          await db.collection('content_pages').doc(row.id).set({
            title: row.title,
            description: row.description,
            category_id: row.category_id,
            order_index: row.order_index,
            is_published: row.is_published,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        console.log(`✅ Migradas ${rows.length} páginas`);
        resolve();
      });
    });

    // Migrar secciones
    await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM content_sections', async (err, rows) => {
        if (err) reject(err);
        
        for (const row of rows) {
          await db.collection('content_sections').doc(row.id).set({
            page_id: row.page_id,
            title: row.title,
            content: row.content,
            content_type: row.content_type,
            order_index: row.order_index,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        console.log(`✅ Migradas ${rows.length} secciones`);
        resolve();
      });
    });

    console.log('🎉 Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    sqliteDb.close();
  }
}

migrateData();
```

¿Quieres que empecemos con algún paso específico? Te recomiendo empezar por el **PASO 1** (setup de Firebase) y luego vamos paso a paso. 🚀 