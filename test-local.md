# 🧪 Guía de Testing Local - Firebase

Esta guía te ayudará a probar todo localmente antes del deploy.

## 📋 CHECKLIST DE TESTING

### ✅ PASO 1: Verificar instalación
```bash
# Verificar Firebase CLI
firebase --version

# Verificar Node.js (recomendado 18+)
node --version

# Verificar dependencias
cd functions && npm list
```

### ✅ PASO 2: Inicializar Firebase (si no lo has hecho)
```bash
# En la raíz del proyecto
firebase init

# Seleccionar:
# - Firestore (Database rules and indexes)
# - Functions (JavaScript, ESLint sí, Install dependencies sí)
# - Hosting (Public directory: dist, SPA: sí)
```

### ✅ PASO 3: Crear proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. "Create a project" → Nombre: `cpc-ugr-test` (o el que prefieras)
3. Copia el Project ID

### ✅ PASO 4: Configurar variables de entorno
```bash
# Crear .env
echo "VITE_FIREBASE_PROJECT_ID=tu-project-id" > .env
echo "VITE_API_URL_DEV=http://localhost:5001/tu-project-id/us-central1/api/api" >> .env
```

### ✅ PASO 5: Iniciar emuladores
```bash
# Opción 1: Solo backend (Functions + Firestore)
firebase emulators:start --only functions,firestore

# Opción 2: Todo (Functions + Firestore + Hosting)
firebase emulators:start

# Opción 3: Con UI web
firebase emulators:start --import=./emulator-data --export-on-exit
```

### ✅ PASO 6: Iniciar frontend (en otra terminal)
```bash
# En otra terminal, en la raíz del proyecto
npm run dev
```

## 🔗 URLs de testing local

### Emuladores:
- **Emulator UI**: http://localhost:4000
- **Functions**: http://localhost:5001
- **Firestore**: http://localhost:8080
- **Hosting**: http://localhost:5000

### Frontend:
- **Vite Dev Server**: http://localhost:5173

### API Endpoints:
- **Health Check**: http://localhost:5001/tu-project-id/us-central1/api/api/health
- **CMS Content**: http://localhost:5001/tu-project-id/us-central1/api/api/cms/content
- **Auth Login**: http://localhost:5001/tu-project-id/us-central1/api/api/auth/login

## 🧪 TESTS A REALIZAR

### 1. ✅ Test Backend
```bash
# Verificar que Functions arrancan
curl http://localhost:5001/tu-project-id/us-central1/api/api/health

# Debería devolver:
# {"status":"ok","timestamp":"...","service":"CPC UGR Backend"}
```

### 2. ✅ Test Base de Datos
```bash
# Inicializar datos de prueba
curl -X POST http://localhost:5001/tu-project-id/us-central1/api/api/init-firestore

# Verificar contenido
curl http://localhost:5001/tu-project-id/us-central1/api/api/cms/content
```

### 3. ✅ Test Autenticación
```bash
# Test registro (usando Postman o curl)
curl -X POST http://localhost:5001/tu-project-id/us-central1/api/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'

# Test login
curl -X POST http://localhost:5001/tu-project-id/us-central1/api/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 4. ✅ Test Frontend
1. Abrir http://localhost:5173
2. Verificar que carga sin errores
3. Ir a "Aprende" → debe cargar contenido
4. Ir a "Admin CMS" → probar login (admin/admin123)
5. Verificar que el backend status muestra "conectado"

## 🐛 RESOLUCIÓN DE PROBLEMAS

### ❌ Error: "Port already in use"
```bash
# Matar procesos en puertos
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# O usar otros puertos
firebase emulators:start --only functions --port=5002
```

### ❌ Error: "ECONNREFUSED"
- Verificar que emulators están corriendo
- Verificar VITE_API_URL_DEV en .env
- Verificar que el project ID es correcto

### ❌ Error: "Module not found"
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: "Permission denied"
```bash
# En Windows, ejecutar como administrador
# O cambiar permisos de carpeta
```

## ✅ CHECKLIST FINAL ANTES DEL DEPLOY

- [ ] ✅ Emuladores arrancan sin errores
- [ ] ✅ Health check responde OK
- [ ] ✅ Base de datos se inicializa correctamente
- [ ] ✅ Frontend conecta con backend local
- [ ] ✅ Login admin funciona
- [ ] ✅ CMS carga y muestra contenido
- [ ] ✅ Se pueden crear/editar páginas
- [ ] ✅ Navegación funciona correctamente
- [ ] ✅ No hay errores en consola del navegador
- [ ] ✅ No hay errores en logs de Functions

## 🚀 DEPLOY DESPUÉS DEL TESTING

```bash
# 1. Build del frontend
npm run build

# 2. Deploy completo
firebase deploy

# 3. Verificar en producción
# Ir a https://tu-project-id.web.app
```

## 📊 LOGS Y DEBUGGING

```bash
# Ver logs de Functions en tiempo real
firebase functions:log --follow

# Ver logs de emuladores
# Se muestran automáticamente en la terminal

# Firestore data viewer
# http://localhost:4000 → Firestore
```

¡Sigue esta guía paso a paso y tendrás todo funcionando perfectamente antes del deploy! 🎉 