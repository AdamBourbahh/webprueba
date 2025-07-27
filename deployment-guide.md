# 🚀 Guía de Deployment - Club de Programación UGR

Esta guía te ayudará a desplegar tu plataforma educativa completamente gratis.

## 🎯 OPCIÓN 1: Railway (RECOMENDADA - Más fácil)

**¿Por qué Railway?**
- ✅ Deploy completo en 5 minutos
- ✅ Mantiene tu código actual sin cambios
- ✅ Base de datos SQLite funciona perfectamente
- ✅ $5 USD gratis al mes (suficiente para tu proyecto)
- ✅ SSL automático
- ✅ Logs en tiempo real

### Pasos para Railway:

1. **Crear cuenta en Railway:**
   ```bash
   # Instalar Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   ```

2. **Preparar tu proyecto:**
   ```bash
   # En la raíz de tu proyecto, crear railway.json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "cd backend && npm start",
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

3. **Deploy backend:**
   ```bash
   cd backend
   railway init
   railway up
   ```

4. **Deploy frontend:**
   ```bash
   # Actualizar VITE_API_URL en .env con la URL de Railway
   echo "VITE_API_URL=https://tu-backend.railway.app/api" > .env
   
   # Build y deploy
   npm run build
   # Subir dist/ a Netlify o Vercel (siguiente sección)
   ```

---

## 🔥 OPCIÓN 2: Firebase (Si quieres aprender algo nuevo)

### Frontend en Firebase Hosting:

1. **Instalar Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Configurar proyecto:**
   ```bash
   firebase init hosting
   # Seleccionar 'dist' como directorio público
   # Decir 'No' a SPA
   ```

3. **Deploy frontend:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Backend en Firebase Functions:

1. **Migrar a Functions:**
   ```bash
   firebase init functions
   cd functions
   # Copiar tu código del backend aquí
   ```

2. **Adaptar para Functions:**
   ```javascript
   // functions/index.js
   const functions = require("firebase-functions");
   const express = require("express");
   const app = express();
   
   // Tu código de Express aquí
   // ... routes, middleware, etc.
   
   exports.api = functions.https.onRequest(app);
   ```

3. **Migrar de SQLite a Firestore:**
   ```javascript
   // Cambiar config/database.js
   const admin = require("firebase-admin");
   admin.initializeApp();
   const db = admin.firestore();
   
   // Ejemplo de conversión:
   // SQLite: SELECT * FROM users WHERE id = ?
   // Firestore: db.collection('users').doc(id).get()
   ```

---

## ⚡ OPCIÓN 3: Render + Netlify (Gratis total)

### Backend en Render:
1. Conecta tu repo de GitHub
2. Configurar:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node.js

### Frontend en Netlify:
1. Conecta tu repo de GitHub
2. Configurar:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variable:** `VITE_API_URL=https://tu-backend.onrender.com/api`

---

## 🌐 OPCIÓN 4: Vercel (Solo si separas repos)

**Limitación:** Vercel Functions tienen timeout de 10s en plan gratuito.

### Frontend:
```bash
npm install -g vercel
vercel
# Seguir el wizard
```

### Backend:
- Mejor usar Railway o Render para el backend
- Vercel solo para frontend

---

## 📦 OPCIÓN 5: Supabase + Netlify (Arquitectura moderna)

### Migrar a Supabase:
1. **Base de datos:** PostgreSQL automático
2. **Autenticación:** Supabase Auth
3. **APIs:** Auto-generadas desde la DB

```javascript
// Cambiar a Supabase client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xyzcompany.supabase.co',
  'public-anon-key'
)

// Ejemplo de query:
const { data, error } = await supabase
  .from('content_pages')
  .select('*')
```

---

## 🏆 RECOMENDACIÓN FINAL

**Para tu caso específico:**

### 🥇 **Opción más fácil:** Railway
- Mantiene todo tu código actual
- Deploy en 5 minutos
- Gratis por meses

### 🥈 **Opción más profesional:** Supabase + Netlify
- Arquitectura moderna
- Escalable
- Gratis para siempre

### 🥉 **Opción de aprendizaje:** Firebase
- Aprenderás servicios de Google
- Muy documentado
- Ecosistema completo

---

## 🔧 CONFIGURACIÓN POST-DEPLOY

### Variables de entorno necesarias:
```bash
# Backend
NODE_ENV=production
PORT=3001
SESSION_SECRET=tu-secret-super-seguro
CORS_ORIGIN=https://tu-frontend.netlify.app

# Frontend
VITE_API_URL=https://tu-backend.railway.app/api
```

### Headers de seguridad:
```javascript
// En tu backend
app.use(cors({
  origin: ['https://tu-frontend.netlify.app', 'http://localhost:5173'],
  credentials: true
}));
```

## 📊 COSTOS COMPARATIVOS

| Plataforma | Frontend | Backend | Base de datos | Total/mes |
|------------|----------|---------|---------------|-----------|
| Railway + Netlify | Gratis | $5 USD | Incluida | $5 USD |
| Firebase | Gratis | Gratis | Gratis | $0 USD |
| Render + Netlify | Gratis | Gratis* | Incluida | $0 USD |
| Supabase + Netlify | Gratis | Gratis | Gratis | $0 USD |

*Render gratuito tiene limitaciones (duerme tras 15 min inactivo)

¿Con cuál te gustaría empezar? Te puedo ayudar con los pasos específicos. 