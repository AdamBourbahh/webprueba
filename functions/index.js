const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Importar configuración
const { initializeFirestore } = require('./src/config/firestore');

// Importar rutas (las crearemos después)
const cmsRoutes = require('./src/routes/cms');
const authRoutes = require('./src/routes/auth');
// const progressRoutes = require('./src/routes/progress');
// const codeRoutes = require('./src/routes/code');

const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    // Agregar tu dominio de Firebase Hosting aquí después
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' }
});
app.use('/api/', limiter);

// Middleware general
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'CPC UGR Backend',
    version: '1.0.0'
  });
});

// Rutas principales
app.use('/api/cms', cmsRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/progress', progressRoutes);
// app.use('/api/code', codeRoutes);

// Ruta para inicializar Firestore manualmente (solo desarrollo)
app.post('/api/init-firestore', async (req, res) => {
  try {
    await initializeFirestore();
    res.json({ message: 'Firestore inicializado correctamente' });
  } catch (error) {
    console.error('Error inicializando Firestore:', error);
    res.status(500).json({ error: 'Error al inicializar Firestore' });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.originalUrl 
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Inicializar Firestore al arrancar
initializeFirestore().catch(console.error);

// Exportar como Cloud Function
exports.api = functions
  .region('us-central1') // Región más cercana a España
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onRequest(app);

// Función para inicialización programática
exports.initData = functions
  .region('us-central1')
  .https.onRequest(async (req, res) => {
    try {
      await initializeFirestore();
      res.json({ message: 'Datos inicializados correctamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }); 