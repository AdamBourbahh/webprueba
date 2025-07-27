# Club de Programación UGR - Plataforma Educativa

Una plataforma educativa completa para el aprendizaje de programación competitiva, desarrollada por y para el Club de Programación de la Universidad de Granada.

## 🚀 Características

### 🎯 **Sistema CMS Completo**
- ✅ Gestión de contenido en Markdown con frontmatter YAML
- ✅ Subida de múltiples archivos con auto-división en secciones
- ✅ Editor de contenido con preview en tiempo real
- ✅ Estructura jerárquica de páginas y categorías
- ✅ Sistema de navegación dinámico
- ✅ Exportar/importar contenido

### 💻 **Ejecución de Código en Tiempo Real**
- ✅ Compilación y ejecución segura de C++, C, Python y Java
- ✅ Sistema de test cases automatizado
- ✅ Límites de tiempo y memoria configurables
- ✅ Evaluación instantánea con feedback detallado
- ✅ Historial de submissions por usuario
- ✅ Soporte para múltiples lenguajes de programación

### 👥 **Sistema de Usuarios Robusto**
- ✅ Registro y autenticación con bcrypt
- ✅ Sesiones seguras con cookies
- ✅ Roles de estudiante y administrador
- ✅ Gestión de perfiles y contraseñas
- ✅ Migración automática de datos

### 📊 **Seguimiento de Progreso Inteligente**
- ✅ Progreso por cookies (usuarios anónimos)
- ✅ Progreso en base de datos (usuarios registrados)
- ✅ Migración automática al registrarse
- ✅ Estadísticas y rankings globales
- ✅ Analytics de uso detallados

### 🎨 **Frontend Moderno**
- ✅ Interfaz elegante con React + Tailwind CSS
- ✅ Modo oscuro/claro dinámico
- ✅ Responsive design completo
- ✅ Efectos visuales suaves
- ✅ Navegación intuitiva tipo SPA

## 🏗️ Arquitectura

```
📁 Proyecto/
├── 🎨 Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── context/          # Contextos (Auth, Content, Theme)
│   │   ├── services/         # Cliente API
│   │   └── ...
│   └── ...
│
└── 🔧 Backend (Node.js + Express)
    ├── config/               # Configuración de BD
    ├── middleware/           # Middleware de auth y seguridad
    ├── routes/              # Rutas de API (CMS, Auth, Code, Progress)
    ├── uploads/             # Archivos subidos
    ├── temp/                # Archivos temporales de ejecución
    ├── database/            # Base de datos SQLite
    └── scripts/             # Scripts de inicialización
```

## 🛠️ Instalación y Configuración

### Prerequisitos
- **Node.js** 16+ y npm
- **Git**
- **g++** y **python3** (para compilación)
- **SQLite3**

### 1. Clonar el repositorio
```bash
git clone [url-del-repo]
cd club-programacion-ugr
```

### 2. Configurar el backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tu configuración
```

### 3. Inicializar base de datos
```bash
npm run init-data
```

### 4. Configurar el frontend
```bash
cd ../
npm install
```

### 5. Ejecutar en desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🎮 Uso

### Para Estudiantes
1. **Explorar contenido**: Navega por las lecciones sin registro
2. **Practicar código**: Resuelve ejercicios directamente en el navegador
3. **Seguir progreso**: Registrate para guardar tu avance
4. **Competir**: Participa en el ranking global

### Para Administradores
1. **Gestionar contenido**: Panel CMS en `/admin-cms`
2. **Subir archivos Markdown**: Soporte para múltiples archivos
3. **Crear ejercicios**: Sistema completo de evaluación de código
4. **Ver estadísticas**: Analytics detallados de usuarios

### Credenciales por defecto
- **Admin**: `admin` / `admin123`
- **Estudiantes**: Registro libre con cualquier email

## 📚 API Endpoints

### 🔐 Autenticación (`/api/auth`)
```
POST /register          # Registrar usuario
POST /login             # Iniciar sesión  
POST /logout            # Cerrar sesión
GET  /status            # Estado de autenticación
GET  /profile           # Perfil del usuario
PUT  /profile           # Actualizar perfil
PUT  /change-password   # Cambiar contraseña
```

### 📝 CMS (`/api/cms`)
```
GET  /content                  # Estructura completa
GET  /pages/:id               # Página específica
POST /pages                   # Crear página (admin)
POST /upload-markdown         # Subir archivos MD (admin)
POST /convert-markdown        # Convertir MD a HTML
GET  /export                  # Exportar contenido (admin)
POST /import                  # Importar contenido (admin)
```

### 💻 Ejecución de Código (`/api/code`)
```
GET  /exercises               # Listar ejercicios
GET  /exercises/:id          # Ejercicio específico
POST /exercises              # Crear ejercicio (admin)
POST /submit                 # Enviar código
GET  /submissions/:id        # Estado de submission
GET  /submissions            # Historial
```

### 📊 Progreso (`/api/progress`)
```
GET  /user-progress          # Progreso completo
POST /complete               # Marcar completado
GET  /page/:id              # Progreso de página
POST /migrate-from-cookie    # Migrar de cookie a BD
GET  /leaderboard           # Ranking global
```

## 🔒 Seguridad

### Medidas Implementadas
- ✅ **Helmet.js** - Headers HTTP seguros
- ✅ **Rate Limiting** - Protección anti-spam/DDoS
- ✅ **CORS** configurado - Solo dominios permitidos
- ✅ **Validación de entrada** - Schemas Joi
- ✅ **Sanitización** - Prevención de inyecciones
- ✅ **Sesiones seguras** - Cookies httpOnly
- ✅ **Hashing bcrypt** - Contraseñas seguras

### Ejecución de Código
- ✅ **Sandboxing** con timeouts y límites de memoria
- ✅ **Directorio temporal** por ejecución
- ✅ **Limpieza automática** de archivos
- ✅ **Validación de lenguajes** permitidos

## 🗄️ Base de Datos

### Esquema Principal (SQLite)
- **users** - Información de usuarios
- **content_pages** - Páginas del contenido
- **content_sections** - Secciones dentro de páginas
- **navigation_categories** - Categorías de navegación
- **user_progress** - Progreso de usuarios
- **code_exercises** - Ejercicios de programación
- **code_submissions** - Envíos de código
- **uploaded_files** - Archivos subidos

## 🌟 Funcionalidades Destacadas

### 📁 **Sistema de Archivos Markdown Avanzado**
```markdown
---
title: "Mi Lección"
description: "Aprende recursividad"
order: 1
difficulty: "medium"
---

# Introducción
Este es el contenido...

## Ejercicio Práctico
Implementa fibonacci...
```

- **Frontmatter YAML** - Metadatos en archivos
- **Auto-splitting** - División automática en secciones
- **Múltiples archivos** - Procesamiento en lote
- **Preview en tiempo real** - Editor con vista previa

### 💻 **Editor de Código Integrado**
- **Sintaxis highlighting** para múltiples lenguajes
- **Autocompletado** básico
- **Ejecución en tiempo real** con feedback instantáneo
- **Test cases visuales** con entrada/salida esperada
- **Historial de submissions** por usuario

### 📊 **Sistema de Progreso Híbrido**
- **Usuarios anónimos**: Progreso en cookies del navegador
- **Usuarios registrados**: Progreso persistente en base de datos
- **Migración automática**: Al registrarse, migra progreso de cookies
- **Sincronización**: Fallback inteligente online/offline

## 🚦 Estados del Desarrollo

- ✅ **Backend completo** - APIs funcionales
- ✅ **Frontend integrado** - Interfaz conectada
- ✅ **Base de datos** - Esquema completo
- ✅ **Autenticación** - Sistema seguro
- ✅ **CMS** - Gestión de contenido
- ✅ **Ejecución de código** - Evaluación automática
- ✅ **Progreso** - Seguimiento híbrido
- ✅ **Documentación** - Guías completas

## 🤝 Contribución

### Para desarrolladores
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Para contenido educativo
1. Acceder al panel admin en `/admin-cms`
2. Subir archivos Markdown con frontmatter
3. Crear ejercicios con test cases
4. Revisar y publicar contenido

## 📞 Soporte

- **Email**: cpc@ugr.es
- **Discord**: Canal del CPC UGR
- **Issues**: GitHub Issues del proyecto

## 📄 Licencia

MIT License - Ver archivo [LICENSE](LICENSE)

---

**Desarrollado con ❤️ por el Club de Programación UGR**

### 🎯 **Roadmap Futuro**
- [ ] Sistema de notificaciones en tiempo real
- [ ] Integración con plataformas externas (Codeforces, AtCoder)
- [ ] Sistema de badges y logros
- [ ] Chat en tiempo real para estudiantes
- [ ] Análisis de código con IA
- [ ] Modo competición en vivo
- [ ] Integración con calendar académico UGR
- [ ] App móvil nativa 