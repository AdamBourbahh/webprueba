# Backend - Club de Programación UGR

Backend completo para la plataforma educativa del Club de Programación de la UGR, con sistema CMS, ejecución de código C++ y seguimiento de progreso.

## 🚀 Características

### 🎯 **Sistema CMS Completo**
- ✅ Gestión de contenido en Markdown
- ✅ Estructura jerárquica de páginas y secciones
- ✅ Subida y procesamiento de archivos `.md`
- ✅ Conversión automática Markdown → HTML con sintaxis highlighting
- ✅ Sistema de categorías y navegación
- ✅ Exportar/importar contenido

### 💻 **Ejecución de Código C++**
- ✅ Compilación y ejecución segura de código C++
- ✅ Sistema de test cases automatizado
- ✅ Límites de tiempo y memoria configurables
- ✅ Soporte para múltiples lenguajes (C++, C, Python, Java)
- ✅ Evaluación en tiempo real
- ✅ Historial de submissions

### 👥 **Sistema de Usuarios**
- ✅ Registro y autenticación con bcrypt
- ✅ Sesiones con cookies seguras
- ✅ Roles (estudiante, administrador)
- ✅ Gestión de perfiles y contraseñas

### 📊 **Seguimiento de Progreso**
- ✅ Progreso por cookies (usuarios anónimos)
- ✅ Progreso en BD (usuarios registrados)
- ✅ Migración automática cookie → BD
- ✅ Estadísticas y rankings
- ✅ Analytics de uso

## 🛠️ Instalación

### Requisitos
- **Node.js** 16+ y npm
- **SQLite3**
- **Docker** (para ejecución segura de código)
- **g++** y **python3** (compiladores)

### 1. Instalación de dependencias
```bash
cd backend
npm install
```

### 2. Configuración de entorno
```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar variables de entorno
nano .env
```

### 3. Inicializar base de datos
```bash
# La base de datos se crea automáticamente al iniciar el servidor
npm start
```

### 4. Usuario administrador por defecto
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Email:** `admin@cpc.ugr.es`

## 🎮 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Testing
```bash
npm test
```

## 📚 API Endpoints

### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/status` | Estado de autenticación |
| POST | `/register` | Registro de usuario |
| POST | `/login` | Iniciar sesión |
| POST | `/logout` | Cerrar sesión |
| GET | `/profile` | Perfil del usuario |
| PUT | `/profile` | Actualizar perfil |
| PUT | `/change-password` | Cambiar contraseña |

### 📝 CMS (`/api/cms`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/content` | Obtener toda la estructura |
| GET | `/pages/:id` | Obtener página específica |
| POST | `/pages` | Crear nueva página (admin) |
| PUT | `/pages/:id` | Actualizar página (admin) |
| DELETE | `/pages/:id` | Eliminar página (admin) |
| POST | `/sections` | Crear sección (admin) |
| PUT | `/sections/:id` | Actualizar sección (admin) |
| DELETE | `/sections/:id` | Eliminar sección (admin) |
| POST | `/upload-markdown` | Subir archivo Markdown (admin) |
| POST | `/convert-markdown` | Convertir Markdown a HTML |
| GET | `/export` | Exportar todo el contenido (admin) |
| POST | `/import` | Importar contenido (admin) |

### 💻 Ejecución de Código (`/api/code`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/exercises` | Listar ejercicios |
| GET | `/exercises/:id` | Obtener ejercicio específico |
| POST | `/exercises` | Crear ejercicio (admin) |
| PUT | `/exercises/:id` | Actualizar ejercicio (admin) |
| POST | `/submit` | Enviar código para evaluación |
| GET | `/submissions/:id` | Estado de submission |
| GET | `/submissions` | Historial de submissions |

### 📊 Progreso (`/api/progress`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/user-progress` | Progreso completo del usuario |
| POST | `/complete` | Marcar página/sección completada |
| GET | `/page/:id` | Progreso de página específica |
| DELETE | `/reset` | Resetear progreso (auth) |
| POST | `/migrate-from-cookie` | Migrar progreso de cookie a BD |
| GET | `/stats/global` | Estadísticas globales |
| GET | `/leaderboard` | Ranking de usuarios |

## 🗄️ Estructura de Base de Datos

### Tablas principales:
- **users** - Información de usuarios
- **content_pages** - Páginas del contenido
- **content_sections** - Secciones dentro de páginas
- **navigation_categories** - Categorías de navegación
- **user_progress** - Progreso de usuarios
- **code_exercises** - Ejercicios de programación
- **code_submissions** - Envíos de código
- **uploaded_files** - Archivos subidos

## 🔒 Seguridad

### Medidas implementadas:
- ✅ **Helmet.js** - Headers de seguridad HTTP
- ✅ **Rate limiting** - Protección contra spam/DDoS
- ✅ **CORS configurado** - Solo dominios permitidos
- ✅ **Validación de entrada** - Joi schemas
- ✅ **Sanitización** - Prevención de inyecciones
- ✅ **Sesiones seguras** - httpOnly cookies
- ✅ **Hashing de contraseñas** - bcrypt con salt

### Ejecución de código:
- ✅ **Sandboxing** con timeout y límites de memoria
- ✅ **Directorio temporal** para cada ejecución
- ✅ **Limpieza automática** de archivos temporales
- ✅ **Validación de lenguajes** permitidos

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js         # Configuración de SQLite
├── middleware/
│   └── auth.js            # Middleware de autenticación
├── routes/
│   ├── auth.js            # Rutas de autenticación
│   ├── cms.js             # Rutas del CMS
│   ├── code.js            # Rutas de ejecución de código
│   └── progress.js        # Rutas de progreso
├── uploads/               # Archivos subidos
├── temp/                  # Archivos temporales de código
├── database/              # Base de datos SQLite
├── server.js              # Servidor principal
├── package.json
└── README.md
```

## ⚙️ Variables de Entorno

```env
# Servidor
PORT=3001
NODE_ENV=development

# Sesiones
SESSION_SECRET=tu-clave-secreta-muy-segura

# CORS (en producción)
FRONTEND_URL=https://tu-dominio.com

# Base de datos (opcional, usa SQLite por defecto)
DB_PATH=./database/cpc.db

# Límites de ejecución
CODE_TIME_LIMIT=5
CODE_MEMORY_LIMIT=128
```

## 🐳 Docker (Opcional)

Para mayor seguridad en la ejecución de código, puedes usar Docker:

```dockerfile
# Dockerfile para ejecución de código
FROM gcc:latest
RUN apt-get update && apt-get install -y python3
COPY . /app
WORKDIR /app
```

## 🚦 Estado del Desarrollo

- ✅ **Base de datos** - SQLite con esquema completo
- ✅ **Autenticación** - Sistema completo con sesiones
- ✅ **CMS** - Gestión completa de contenido Markdown
- ✅ **Ejecución de código** - Sistema funcional de evaluación
- ✅ **Progreso** - Seguimiento con cookies y BD
- ✅ **APIs** - Todas las rutas implementadas
- ✅ **Seguridad** - Medidas de protección activas
- ✅ **Documentación** - Guías completas

## 🤝 Integración con Frontend

El backend está diseñado para integrarse perfectamente con el frontend React existente:

1. **Mantiene compatibilidad** con la estructura actual de `ContentContext`
2. **APIs RESTful** fáciles de consumir
3. **Manejo de cookies** automático para progreso
4. **Autenticación transparente** con sesiones

### Ejemplo de integración:
```javascript
// Obtener contenido del CMS
const response = await fetch('/api/cms/content');
const content = await response.json();

// Marcar progreso
await fetch('/api/progress/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    page_id: 'introduccion',
    section_id: 'intro'
  })
});

// Enviar código
await fetch('/api/code/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exercise_id: 'arrays-basic',
    code: '// Mi código aquí',
    language: 'cpp'
  })
});
```

## 📞 Soporte

Para preguntas o reportar issues:
- **Email**: cpc@ugr.es
- **GitHub**: [Repositorio del proyecto]
- **Discord**: Canal del CPC UGR

---

**¡El backend está listo para usar! 🎉**

Características principales implementadas:
- 📚 **CMS completo** con Markdown
- 💻 **Ejecución de C++** segura
- 👥 **Sistema de usuarios** robusto
- 📊 **Progreso con cookies** persistente
- 🔒 **Seguridad** de nivel producción 