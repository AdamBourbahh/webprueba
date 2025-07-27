const { runQuery, getQuery, allQuery, initDatabase } = require('../config/database');

// Datos iniciales basados en el contenido actual del frontend
const initialData = {
  categories: [
    { id: 'get-started', title: 'GET STARTED', description: 'Primeros pasos en programación competitiva', order_index: 0 },
    { id: 'estructuras', title: 'ESTRUCTURAS DE DATOS', description: 'Arrays, listas, árboles y más', order_index: 1 },
    { id: 'algoritmos', title: 'ALGORITMOS', description: 'Algoritmos fundamentales', order_index: 2 }
  ],
  
  pages: [
    { id: 'introduccion', title: 'INTRODUCCIÓN', description: 'Bienvenida al mundo de la programación competitiva', category_id: 'get-started', order_index: 0 },
    { id: 'plataformas', title: 'PLATAFORMAS', description: 'Conoce las principales plataformas de práctica', category_id: 'get-started', order_index: 1 },
    { id: 'arrays-strings', title: 'ARRAYS Y STRINGS', description: 'Estructuras de datos básicas', category_id: 'estructuras', order_index: 0 },
    { id: 'recursividad', title: 'RECURSIVIDAD', description: 'Técnica fundamental de programación', category_id: 'algoritmos', order_index: 0 }
  ],
  
  sections: [
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
      order_index: 0
    }
  ],
  
  exercises: [
    {
      id: 'hello-world',
      page_id: 'introduccion',
      title: 'Hello World',
      description: 'Tu primer ejercicio: imprime un mensaje de bienvenida.',
      starter_code: `#include <iostream>
using namespace std;

int main() {
    // Tu código aquí
    
    return 0;
}`,
      solution_code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Competitive Programming!" << endl;
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'Hello, Competitive Programming!',
          description: 'Caso básico'
        }
      ],
      difficulty: 'easy',
      time_limit: 1,
      memory_limit: 64
    },
    {
      id: 'suma-simple',
      page_id: 'introduccion',
      title: 'Suma Simple',
      description: 'Lee dos números enteros y muestra su suma.',
      starter_code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    // Leer los números
    
    // Calcular y mostrar la suma
    
    return 0;
}`,
      solution_code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
      test_cases: [
        {
          input: '5 3',
          expected_output: '8',
          description: 'Números positivos'
        },
        {
          input: '-2 7',
          expected_output: '5',
          description: 'Un número negativo'
        },
        {
          input: '0 0',
          expected_output: '0',
          description: 'Ambos cero'
        }
      ],
      difficulty: 'easy',
      time_limit: 1,
      memory_limit: 64
    },
    {
      id: 'maximo-array',
      page_id: 'arrays-strings',
      title: 'Máximo en Array',
      description: 'Encuentra el elemento máximo en un array de enteros.',
      starter_code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    // Encuentra el máximo
    
    return 0;
}`,
      solution_code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    int maximo = *max_element(arr.begin(), arr.end());
    cout << maximo << endl;
    
    return 0;
}`,
      test_cases: [
        {
          input: '5\n1 3 7 2 5',
          expected_output: '7',
          description: 'Array simple'
        },
        {
          input: '3\n-5 -1 -10',
          expected_output: '-1',
          description: 'Números negativos'
        },
        {
          input: '1\n42',
          expected_output: '42',
          description: 'Un solo elemento'
        }
      ],
      difficulty: 'easy',
      time_limit: 1,
      memory_limit: 64
    },
    {
      id: 'fibonacci',
      page_id: 'recursividad',
      title: 'Fibonacci',
      description: 'Calcula el n-ésimo número de Fibonacci.',
      starter_code: `#include <iostream>
using namespace std;

// Función recursiva para calcular Fibonacci
int fibonacci(int n) {
    // Tu código aquí
}

int main() {
    int n;
    cin >> n;
    cout << fibonacci(n) << endl;
    return 0;
}`,
      solution_code: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    int n;
    cin >> n;
    cout << fibonacci(n) << endl;
    return 0;
}`,
      test_cases: [
        {
          input: '0',
          expected_output: '0',
          description: 'F(0) = 0'
        },
        {
          input: '1',
          expected_output: '1',
          description: 'F(1) = 1'
        },
        {
          input: '5',
          expected_output: '5',
          description: 'F(5) = 5'
        },
        {
          input: '10',
          expected_output: '55',
          description: 'F(10) = 55'
        }
      ],
      difficulty: 'medium',
      time_limit: 2,
      memory_limit: 64
    },
    {
      id: 'palindromo',
      page_id: 'arrays-strings',
      title: 'Verificar Palíndromo',
      description: 'Determina si una cadena es un palíndromo (se lee igual al derecho y al revés).',
      starter_code: `#include <iostream>
#include <string>
using namespace std;

bool esPalindromo(string s) {
    // Tu código aquí
}

int main() {
    string palabra;
    cin >> palabra;
    
    if (esPalindromo(palabra)) {
        cout << "Si" << endl;
    } else {
        cout << "No" << endl;
    }
    
    return 0;
}`,
      solution_code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool esPalindromo(string s) {
    string reversed = s;
    reverse(reversed.begin(), reversed.end());
    return s == reversed;
}

int main() {
    string palabra;
    cin >> palabra;
    
    if (esPalindromo(palabra)) {
        cout << "Si" << endl;
    } else {
        cout << "No" << endl;
    }
    
    return 0;
}`,
      test_cases: [
        {
          input: 'aba',
          expected_output: 'Si',
          description: 'Palíndromo simple'
        },
        {
          input: 'racecar',
          expected_output: 'Si',
          description: 'Palíndromo más largo'
        },
        {
          input: 'hello',
          expected_output: 'No',
          description: 'No es palíndromo'
        },
        {
          input: 'a',
          expected_output: 'Si',
          description: 'Una sola letra'
        }
      ],
      difficulty: 'easy',
      time_limit: 1,
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