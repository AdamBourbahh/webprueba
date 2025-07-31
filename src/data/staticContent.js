// Datos estáticos para la aplicación - Reemplaza el backend
export const staticContent = {
  pages: [
    {
      id: 'introduccion',
      title: 'Introducción a la Programación Competitiva',
      description: 'Primeros pasos en el mundo de la programación competitiva',
      category: 'introduccion',
      order_index: 0,
      is_active: true,
      sections: [
        {
          id: 'que-es',
          title: '¿Qué es la Programación Competitiva?',
          type: 'text',
          content: `# ¿Qué es la Programación Competitiva?

La programación competitiva es una actividad mental que consiste en escribir código fuente para resolver problemas de algoritmia en el menor tiempo posible.

## Características principales

* **Tiempo limitado**: Los concursos tienen duraciones específicas
* **Problemas algorítmicos**: Requieren pensamiento lógico y matemático
* **Múltiples lenguajes**: C++, Python, Java son los más populares
* **Ranking global**: Competencia con programadores de todo el mundo

## Beneficios

* Mejora las habilidades de resolución de problemas
* Prepara para entrevistas técnicas
* Desarrolla el pensamiento algorítmico
* Conecta con una comunidad global`,
          order_index: 0
        },
        {
          id: 'primeros-pasos',
          title: 'Primeros Pasos',
          type: 'text',
          content: `# Primeros Pasos

## 1. Elegir un Lenguaje

### C++
* **Ventajas**: Muy rápido, gran cantidad de librerías (STL)
* **Desventajas**: Sintaxis más compleja
* **Recomendado para**: Competidores serios

### Python
* **Ventajas**: Sintaxis simple, fácil de escribir
* **Desventajas**: Más lento en ejecución
* **Recomendado para**: Principiantes

## 2. Plataformas de Práctica

* **Codeforces**: La más popular mundialmente
* **AtCoder**: Concursos japoneses de alta calidad
* **LeetCode**: Orientado a entrevistas de trabajo
* **UVa Online Judge**: Problemas clásicos

## 3. Configurar el Entorno

### Para C++
\`\`\`bash
g++ -std=c++17 -O2 -Wall solution.cpp -o solution
\`\`\`

### Para Python
\`\`\`bash
python3 solution.py
\`\`\``,
          order_index: 1
        }
      ]
    },
    {
      id: 'estructuras',
      title: 'ESTRUCTURAS DE DATOS',
      description: 'Arrays, listas, árboles y estructuras avanzadas',
      category: 'estructuras-de-datos',
      order_index: 1,
      is_active: true,
      sections: [
        {
          id: 'arrays',
          title: 'Arrays y Vectores',
          type: 'text',
          content: `# Arrays y Vectores

Los arrays son la estructura de datos más fundamental en programación competitiva.

## Array Básico en C++

\`\`\`cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {1, 2, 3, 4, 5};
    
    // Recorrer el array
    for (int i = 0; i < arr.size(); i++) {
        cout << arr[i] << " ";
    }
    
    return 0;
}
\`\`\`

## Operaciones Comunes

* **Búsqueda lineal**: O(n)
* **Búsqueda binaria**: O(log n) en arrays ordenados
* **Inserción/eliminación**: O(n) en el peor caso
* **Acceso por índice**: O(1)

## Técnicas Importantes

### Two Pointers
Útil para problemas de subarray y búsqueda de pares.

### Sliding Window
Para problemas de subarrays con propiedades específicas.`,
          order_index: 0
        },
        {
          id: 'trees',
          title: 'Árboles Binarios',
          type: 'text',
          content: `# Árboles Binarios

Los árboles son estructuras jerárquicas fundamentales.

## Definición Básica

\`\`\`cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
\`\`\`

## Recorridos

### Inorder (Izquierda, Raíz, Derecha)
\`\`\`cpp
void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}
\`\`\`

### Preorder (Raíz, Izquierda, Derecha)
### Postorder (Izquierda, Derecha, Raíz)

## Aplicaciones
* Expresiones matemáticas
* Sistemas de archivos
* Bases de datos (B-trees)
* Algoritmos de búsqueda`,
          order_index: 1
        }
      ]
    },
    {
      id: 'algoritmos',
      title: 'ALGORITMOS',
      description: 'Algoritmos fundamentales y técnicas de optimización',
      category: 'algoritmos',
      order_index: 2,
      is_active: true,
      sections: [
        {
          id: 'sorting',
          title: 'Algoritmos de Ordenamiento',
          type: 'text',
          content: `# Algoritmos de Ordenamiento

## Quick Sort
Complejidad promedio: O(n log n)

\`\`\`cpp
void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}
\`\`\`

## Merge Sort
Complejidad: O(n log n) garantizado

## Heap Sort
Utiliza una estructura de heap para ordenar eficientemente.`,
          order_index: 0
        },
        {
          id: 'dp',
          title: 'Programación Dinámica',
          type: 'text',
          content: `# Programación Dinámica

La programación dinámica resuelve problemas complejos dividiéndolos en subproblemas más simples.

## Fibonacci con DP

\`\`\`cpp
int fibonacci(int n) {
    vector<int> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    
    return dp[n];
}
\`\`\`

## Problema de la Mochila

\`\`\`cpp
int knapsack(vector<int>& weights, vector<int>& values, int W) {
    int n = weights.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (weights[i-1] <= w) {
                dp[i][w] = max(dp[i-1][w], 
                              dp[i-1][w-weights[i-1]] + values[i-1]);
            } else {
                dp[i][w] = dp[i-1][w];
            }
        }
    }
    
    return dp[n][W];
}
\`\`\`

## Principios Clave
* **Subestructura óptima**
* **Subproblemas superpuestos**
* **Memoización**`,
          order_index: 1
        }
      ]
    }
  ],
  
  categories: [
    {
      id: 'introduccion',
      title: 'INTRODUCCIÓN',
      description: 'Primeros pasos en programación competitiva',
      order_index: 0,
      is_active: true
    },
    {
      id: 'estructuras-de-datos',
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
  ]
}; 