const bcrypt = require('bcryptjs');
const { firestoreHelpers } = require('../utils/firestore');

// Inicializar datos por defecto en Firestore
async function initializeFirestore() {
  try {
    console.log('🔄 Inicializando Firestore...');

    // 1. Crear usuario admin por defecto
    const adminExists = await firestoreHelpers.docExists('users', 'admin');
    if (!adminExists) {
      console.log('👤 Creando usuario admin...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await firestoreHelpers.createDoc('users', 'admin', {
        username: 'admin',
        email: 'admin@cpc-ugr.es',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Usuario admin creado');
    }

    // 2. Crear categorías por defecto
    const categories = await firestoreHelpers.getCollection('content_categories');
    if (categories.length === 0) {
      console.log('📂 Creando categorías por defecto...');
      
      const defaultCategories = [
        { 
          id: 'get-started', 
          title: 'GET STARTED', 
          description: 'Primeros pasos en programación competitiva', 
          order_index: 0,
          is_active: true
        },
        { 
          id: 'estructuras', 
          title: 'ESTRUCTURAS DE DATOS', 
          description: 'Arrays, listas, árboles y más', 
          order_index: 1,
          is_active: true
        },
        { 
          id: 'algoritmos', 
          title: 'ALGORITMOS', 
          description: 'Algoritmos fundamentales', 
          order_index: 2,
          is_active: true
        }
      ];

      for (const category of defaultCategories) {
        await firestoreHelpers.createDoc('content_categories', category.id, category);
      }
      console.log(`✅ ${defaultCategories.length} categorías creadas`);
    }

    // 3. Crear páginas por defecto
    const pages = await firestoreHelpers.getCollection('content_pages');
    if (pages.length === 0) {
      console.log('📄 Creando páginas por defecto...');
      
      const defaultPages = [
        { 
          id: 'introduccion', 
          title: 'INTRODUCCIÓN', 
          description: 'Bienvenida al mundo de la programación competitiva', 
          category_id: 'get-started', 
          order_index: 0,
          is_published: true
        },
        { 
          id: 'plataformas', 
          title: 'PLATAFORMAS', 
          description: 'Conoce las principales plataformas de práctica', 
          category_id: 'get-started', 
          order_index: 1,
          is_published: true
        },
        { 
          id: 'arrays-strings', 
          title: 'ARRAYS Y STRINGS', 
          description: 'Estructuras de datos básicas', 
          category_id: 'estructuras', 
          order_index: 0,
          is_published: true
        },
        { 
          id: 'recursividad', 
          title: 'RECURSIVIDAD', 
          description: 'Técnica fundamental de programación', 
          category_id: 'algoritmos', 
          order_index: 0,
          is_published: true
        }
      ];

      for (const page of defaultPages) {
        await firestoreHelpers.createDoc('content_pages', page.id, page);
      }
      console.log(`✅ ${defaultPages.length} páginas creadas`);
    }

    // 4. Crear secciones por defecto
    const sections = await firestoreHelpers.getCollection('content_sections');
    if (sections.length === 0) {
      console.log('📝 Creando secciones por defecto...');
      
      const defaultSections = [
        { 
          id: 'intro-bienvenida', 
          page_id: 'introduccion', 
          title: 'Bienvenida al CPC UGR', 
          content: `¡Bienvenido al Club de Programación Competitiva de la Universidad de Granada!

En esta plataforma encontrarás todo lo necesario para iniciarte y mejorar en programación competitiva:

- **Tutoriales paso a paso** desde nivel básico hasta avanzado
- **Ejercicios prácticos** con evaluación automática
- **Comunidad activa** de estudiantes y mentores
- **Recursos curados** de las mejores fuentes

## ¿Qué es la programación competitiva?

La programación competitiva es una actividad mental que consiste en resolver problemas algorítmicos bajo limitaciones de tiempo. Es como un deporte, pero usando el cerebro y el código.

### Beneficios principales:
- Mejora tu capacidad de resolución de problemas
- Te prepara para entrevistas técnicas
- Desarrolla tu pensamiento lógico
- Es divertido y adictivo

¡Empecemos este viaje juntos!`,
          content_type: 'markdown',
          order_index: 0
        },
        { 
          id: 'intro-primeros-pasos', 
          page_id: 'introduccion', 
          title: 'Primeros Pasos', 
          content: `## Tu primer ejercicio

Antes de adentrarnos en teoría compleja, vamos a resolver un problema simple para familiarizarnos con la plataforma.

### Problema: Hello World
Imprime "Hello, Competitive Programming!" en la salida estándar.

**Entrada:** Ninguna
**Salida:** Una línea con el texto "Hello, Competitive Programming!"

Este es el ejercicio más simple posible, pero te ayudará a entender cómo funciona nuestra plataforma de evaluación automática.

> **Consejo:** Asegúrate de que tu salida coincida exactamente con lo esperado, incluyendo mayúsculas y signos de puntuación.`,
          content_type: 'markdown',
          order_index: 1
        },
        { 
          id: 'arrays-introduccion', 
          page_id: 'arrays-strings', 
          title: 'Introducción a Arrays', 
          content: `## ¿Qué son los Arrays?

Un array es una estructura de datos que almacena elementos del mismo tipo en posiciones consecutivas de memoria. Es una de las estructuras más fundamentales en programación.

### Características importantes:
- **Acceso aleatorio**: Puedes acceder a cualquier elemento en O(1)
- **Tamaño fijo**: Una vez creado, su tamaño no cambia
- **Índices**: Los elementos se acceden mediante índices (normalmente empezando en 0)

### Ejemplo básico en C++:
\`\`\`cpp
int arr[5] = {1, 2, 3, 4, 5};
cout << arr[0]; // Imprime 1
cout << arr[4]; // Imprime 5
\`\`\`

Los arrays son la base para muchos algoritmos y estructuras de datos más complejas.`,
          content_type: 'markdown',
          order_index: 0
        }
      ];

      for (const section of defaultSections) {
        await firestoreHelpers.createDoc('content_sections', section.id, section);
      }
      console.log(`✅ ${defaultSections.length} secciones creadas`);
    }

    console.log('🎉 Firestore inicializado correctamente!');
  } catch (error) {
    console.error('❌ Error inicializando Firestore:', error);
    throw error;
  }
}

module.exports = { initializeFirestore, firestoreHelpers }; 