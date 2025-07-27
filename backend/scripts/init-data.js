const { runQuery, getQuery, allQuery, initDatabase } = require('../config/database');

// Datos iniciales basados en el contenido actual del frontend
const initialData = {
  categories: [
    {
      id: 'get-started',
      title: 'GET STARTED',
      description: 'Introducción y conceptos básicos para comenzar',
      order_index: 0
    },
    {
      id: 'estructuras',
      title: 'ESTRUCTURAS DE DATOS',
      description: 'Estructuras fundamentales: arrays, listas, árboles, grafos',
      order_index: 1
    },
    {
      id: 'algoritmos',
      title: 'ALGORITMOS',
      description: 'Algoritmos esenciales: recursividad, DP, divide y vencerás',
      order_index: 2
    }
  ],

  pages: [
    // GET STARTED
    {
      id: 'introduccion',
      title: 'INTRODUCCIÓN',
      description: 'Bienvenida al mundo de la programación competitiva',
      category_id: 'get-started',
      order_index: 0
    },
    {
      id: 'plataformas',
      title: 'PLATAFORMAS DE PRÁCTICA',
      description: 'Conoce las principales plataformas de programación competitiva',
      category_id: 'get-started',
      order_index: 1
    },

    // ESTRUCTURAS DE DATOS
    {
      id: 'arrays-strings',
      title: 'ARRAYS Y STRINGS',
      description: 'Fundamentos de arrays y manipulación de strings',
      category_id: 'estructuras',
      order_index: 2
    },
    {
      id: 'listas-enlazadas',
      title: 'LISTAS ENLAZADAS',
      description: 'Listas simples, dobles y circulares',
      category_id: 'estructuras',
      order_index: 3
    },
    {
      id: 'pilas-colas',
      title: 'PILAS Y COLAS',
      description: 'Estructuras LIFO y FIFO fundamentales',
      category_id: 'estructuras',
      order_index: 4
    },
    {
      id: 'arboles',
      title: 'ÁRBOLES',
      description: 'Árboles binarios, BST, AVL y más',
      category_id: 'estructuras',
      order_index: 5
    },
    {
      id: 'grafos',
      title: 'GRAFOS',
      description: 'Representación y algoritmos en grafos',
      category_id: 'estructuras',
      order_index: 6
    },

    // ALGORITMOS
    {
      id: 'algo-introduccion',
      title: 'INTRODUCCIÓN A ALGORITMOS',
      description: 'Conceptos básicos y análisis de complejidad',
      category_id: 'algoritmos',
      order_index: 7
    },
    {
      id: 'recursividad',
      title: 'RECURSIVIDAD',
      description: 'Técnicas recursivas y casos base',
      category_id: 'algoritmos',
      order_index: 8
    },
    {
      id: 'divide-venceras',
      title: 'DIVIDE Y VENCERÁS',
      description: 'Paradigma divide y vencerás con ejemplos',
      category_id: 'algoritmos',
      order_index: 9
    },
    {
      id: 'programacion-dinamica',
      title: 'PROGRAMACIÓN DINÁMICA',
      description: 'DP: memoización y programación bottom-up',
      category_id: 'algoritmos',
      order_index: 10
    },
    {
      id: 'backtracking',
      title: 'BACKTRACKING',
      description: 'Exploración exhaustiva con vuelta atrás',
      category_id: 'algoritmos',
      order_index: 11
    }
  ],

  sections: [
    // INTRODUCCIÓN
    {
      id: 'intro-bienvenida',
      page_id: 'introduccion',
      title: 'Bienvenida al CPC UGR',
      content: `¡Bienvenido/a al Club de Programación Competitiva de la Universidad de Granada! 👋

Esta plataforma está diseñada para ayudarte a dominar los conceptos fundamentales de la programación competitiva, desde los algoritmos más básicos hasta las técnicas más avanzadas.

## ¿Qué encontrarás aquí?

- **Teoría clara y concisa**: Explicaciones paso a paso de conceptos fundamentales
- **Ejemplos prácticos**: Código real que puedes ejecutar y modificar
- **Ejercicios interactivos**: Practica directamente en la plataforma
- **Seguimiento de progreso**: Ve tu avance en tiempo real
- **Comunidad activa**: Aprende junto a otros estudiantes apasionados

## Nuestra filosofía

En el CPC UGR creemos que la programación competitiva es mucho más que resolver problemas: es una forma de entrenar el pensamiento lógico, aprender a estructurar soluciones eficientes y, por qué no, pasarlo bien mientras lo haces.`,
      order_index: 0
    },
    {
      id: 'intro-como-empezar',
      page_id: 'introduccion',
      title: 'Cómo empezar',
      content: `## Ruta de aprendizaje recomendada

Si eres nuevo en programación competitiva, te recomendamos seguir este orden:

### 1. **Fundamentos básicos**
- Familiarízate con las estructuras de datos básicas (arrays, strings)
- Aprende análisis de complejidad (Big O)
- Practica problemas simples de implementación

### 2. **Estructuras de datos**
- Domina arrays y strings completamente
- Aprende listas enlazadas, pilas y colas
- Estudia árboles y grafos básicos

### 3. **Algoritmos fundamentales**
- Recursividad y casos base
- Algoritmos de búsqueda y ordenamiento
- Técnicas básicas de optimización

### 4. **Técnicas avanzadas**
- Programación dinámica
- Divide y vencerás
- Backtracking y poda

## Consejos para el éxito

- **Practica regularmente**: La consistencia es clave
- **Entiende antes de memorizar**: Comprende el "por qué" detrás de cada algoritmo
- **Participa en la comunidad**: Únete a nuestros eventos y concursos
- **No te rindas**: Los problemas difíciles requieren tiempo y paciencia`,
      order_index: 1
    },

    // PLATAFORMAS
    {
      id: 'plataformas-intro',
      page_id: 'plataformas',
      title: 'Introducción a las plataformas',
      content: `Las plataformas de programación competitiva son el lugar donde pondrás en práctica todo lo que aprendas. Cada una tiene sus características únicas y tipos de problemas específicos.

## ¿Por qué usar plataformas online?

- **Evaluación automática**: Feedback inmediato de tus soluciones
- **Problemas clasificados**: Desde principiante hasta experto
- **Competiciones regulares**: Contests para medir tu progreso
- **Comunidad global**: Aprende de programadores de todo el mundo
- **Histórico de submissions**: Sigue tu evolución a lo largo del tiempo`,
      order_index: 0
    },
    {
      id: 'plataformas-codeforces',
      page_id: 'plataformas',
      title: 'Codeforces',
      content: `## Codeforces - La plataforma más popular

**URL**: [codeforces.com](https://codeforces.com)

### Características principales:
- **Contests regulares**: 2-3 concursos por semana
- **Sistema de rating**: Desde Newbie (gris) hasta Tourist (rojo)
- **Problemset extenso**: Miles de problemas clasificados por dificultad
- **Editorial completo**: Explicaciones detalladas de las soluciones

### Tipos de contest:
- **Div. 1**: Para usuarios experimentados (rating ≥ 1900)
- **Div. 2**: Para usuarios intermedios (rating < 1900)
- **Div. 3**: Para principiantes (rating < 1600)
- **Educational**: Enfoque pedagógico, ideales para aprender

### Recomendaciones:
- Empieza con problemas Div. 2 A y B
- Participa en contests aunque no resuelvas todos los problemas
- Lee los editoriales después de cada contest`,
      order_index: 1
    },
    {
      id: 'plataformas-atcoder',
      page_id: 'plataformas',
      title: 'AtCoder',
      content: `## AtCoder - Calidad japonesa

**URL**: [atcoder.jp](https://atcoder.jp)

### Características:
- **Problemas de alta calidad**: Muy bien pensados y testeados
- **Contests semanales**: ABC (AtCoder Beginner Contest) cada sábado
- **Sistema de colores**: Del gris al rojo, similar a Codeforces
- **Editorials excelentes**: Explicaciones muy claras

### Tipos de contest:
- **ABC**: AtCoder Beginner Contest (ideal para empezar)
- **ARC**: AtCoder Regular Contest (nivel intermedio)
- **AGC**: AtCoder Grand Contest (nivel avanzado)

### Por qué es especial:
- Problemas muy educativos y progresivos
- Testcases muy completos
- Comunidad muy respetuosa`,
      order_index: 2
    },

    // ARRAYS Y STRINGS
    {
      id: 'arrays-introduccion',
      page_id: 'arrays-strings',
      title: 'Introducción a Arrays',
      content: `Los arrays son la estructura de datos más fundamental en programación competitiva. Un array es una colección de elementos del mismo tipo almacenados en posiciones contiguas de memoria.

## Características principales:

- **Acceso aleatorio**: Puedes acceder a cualquier elemento en O(1)
- **Tamaño fijo**: Una vez creado, el tamaño no puede cambiar (en arrays estáticos)
- **Indexado**: Los elementos se acceden mediante índices (generalmente empezando en 0)
- **Memoria contigua**: Los elementos están uno al lado del otro en memoria

## Declaración en C++:

\`\`\`cpp
// Array estático
int arr[100];  // Array de 100 enteros
int arr[5] = {1, 2, 3, 4, 5};  // Inicialización

// Vector (array dinámico)
vector<int> v;  // Vector vacío
vector<int> v(10);  // Vector de 10 elementos inicializados a 0
vector<int> v = {1, 2, 3, 4, 5};  // Inicialización con valores
\`\`\`

## Operaciones básicas:

\`\`\`cpp
// Acceso
int valor = arr[2];  // Obtener elemento en posición 2
arr[2] = 10;         // Modificar elemento en posición 2

// Recorrido
for(int i = 0; i < n; i++) {
    cout << arr[i] << " ";
}

// Con vector
for(int x : v) {
    cout << x << " ";
}
\`\`\``,
      order_index: 0
    },

    // RECURSIVIDAD
    {
      id: 'recursividad-concepto',
      page_id: 'recursividad',
      title: 'Concepto de Recursividad',
      content: `La recursividad es una técnica de programación donde una función se llama a sí misma para resolver un problema dividiéndolo en subproblemas más pequeños.

## Componentes de la recursividad:

### 1. **Caso base**
La condición que detiene la recursión. Sin esto, tendríamos una recursión infinita.

### 2. **Caso recursivo**
La función se llama a sí misma con parámetros modificados.

### 3. **Progreso hacia el caso base**
Cada llamada recursiva debe acercarse al caso base.

## Ejemplo clásico: Factorial

\`\`\`cpp
int factorial(int n) {
    // Caso base
    if (n <= 1) {
        return 1;
    }
    
    // Caso recursivo
    return n * factorial(n - 1);
}
\`\`\`

## Cómo funciona:
- factorial(5) = 5 × factorial(4)
- factorial(4) = 4 × factorial(3)  
- factorial(3) = 3 × factorial(2)
- factorial(2) = 2 × factorial(1)
- factorial(1) = 1 (caso base)

## Ventajas:
- Código más limpio y legible
- Natural para problemas que tienen estructura recursiva
- Implementación directa de definiciones matemáticas

## Desventajas:
- Puede ser ineficiente (llamadas repetidas)
- Uso de memoria adicional (stack de llamadas)
- Posible stack overflow con recursiones muy profundas`,
      order_index: 0
    }
  ],

  exercises: [
    {
      id: 'hello-world',
      page_id: 'introduccion',
      title: 'Hello World',
      description: 'Tu primer programa: imprime "Hello, World!" en la consola.',
      starter_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Tu código aquí\n    \n    return 0;\n}',
      solution_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
      test_cases: [
        {
          input: '',
          expected_output: 'Hello, World!',
          description: 'Debe imprimir exactamente "Hello, World!"'
        }
      ],
      difficulty: 'easy',
      time_limit: 1,
      memory_limit: 64
    },
    {
      id: 'suma-dos-numeros',
      page_id: 'introduccion',
      title: 'Suma de dos números',
      description: 'Lee dos números enteros e imprime su suma.',
      starter_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    // Tu código aquí\n    \n    return 0;\n}',
      solution_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}',
      test_cases: [
        {
          input: '3 5',
          expected_output: '8',
          description: 'Suma de 3 + 5 = 8'
        },
        {
          input: '-2 10',
          expected_output: '8',
          description: 'Suma de -2 + 10 = 8'
        },
        {
          input: '0 0',
          expected_output: '0',
          description: 'Suma de 0 + 0 = 0'
        }
      ],
      difficulty: 'easy',
      time_limit: 1,
      memory_limit: 64
    },
    {
      id: 'factorial-recursivo',
      page_id: 'recursividad',
      title: 'Factorial Recursivo',
      description: 'Implementa una función recursiva para calcular el factorial de un número.',
      starter_code: '#include <iostream>\nusing namespace std;\n\nint factorial(int n) {\n    // Tu implementación recursiva aquí\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << factorial(n) << endl;\n    return 0;\n}',
      solution_code: '#include <iostream>\nusing namespace std;\n\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << factorial(n) << endl;\n    return 0;\n}',
      test_cases: [
        {
          input: '5',
          expected_output: '120',
          description: '5! = 120'
        },
        {
          input: '0',
          expected_output: '1',
          description: '0! = 1'
        },
        {
          input: '1',
          expected_output: '1',
          description: '1! = 1'
        },
        {
          input: '7',
          expected_output: '5040',
          description: '7! = 5040'
        }
      ],
      difficulty: 'medium',
      time_limit: 2,
      memory_limit: 64
    }
  ]
};

async function initializeData() {
  console.log('🚀 Inicializando datos en la base de datos...');

  try {
    // Inicializar base de datos
    await initDatabase();

    // Insertar categorías
    console.log('📂 Insertando categorías...');
    for (const category of initialData.categories) {
      await runQuery(`
        INSERT OR IGNORE INTO navigation_categories (id, title, description, order_index)
        VALUES (?, ?, ?, ?)
      `, [category.id, category.title, category.description, category.order_index]);
    }

    // Insertar páginas
    console.log('📄 Insertando páginas...');
    for (const page of initialData.pages) {
      await runQuery(`
        INSERT OR IGNORE INTO content_pages (id, title, description, category_id, order_index)
        VALUES (?, ?, ?, ?, ?)
      `, [page.id, page.title, page.description, page.category_id, page.order_index]);
    }

    // Insertar secciones
    console.log('📝 Insertando secciones...');
    for (const section of initialData.sections) {
      await runQuery(`
        INSERT OR IGNORE INTO content_sections (id, page_id, title, content, order_index)
        VALUES (?, ?, ?, ?, ?)
      `, [section.id, section.page_id, section.title, section.content, section.order_index]);
    }

    // Insertar ejercicios
    console.log('💻 Insertando ejercicios...');
    for (const exercise of initialData.exercises) {
      await runQuery(`
        INSERT OR IGNORE INTO code_exercises (
          id, page_id, title, description, starter_code, solution_code,
          test_cases, difficulty, time_limit, memory_limit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        exercise.id, exercise.page_id, exercise.title, exercise.description,
        exercise.starter_code, exercise.solution_code, JSON.stringify(exercise.test_cases),
        exercise.difficulty, exercise.time_limit, exercise.memory_limit
      ]);
    }

    console.log('✅ Datos inicializados correctamente!');
    console.log(`
📊 Resumen:
- ${initialData.categories.length} categorías
- ${initialData.pages.length} páginas  
- ${initialData.sections.length} secciones
- ${initialData.exercises.length} ejercicios

🎯 La plataforma está lista para usar!
`);

  } catch (error) {
    console.error('❌ Error al inicializar datos:', error);
    throw error;
  }
}

// Ejecutar script si se llama directamente
if (require.main === module) {
  initializeData()
    .then(() => {
      console.log('🎉 Inicialización completada exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la inicialización:', error);
      process.exit(1);
    });
}

module.exports = { initializeData, initialData }; 