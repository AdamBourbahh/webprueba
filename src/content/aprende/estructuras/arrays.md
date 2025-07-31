# Arrays y Vectores

Los arrays son la estructura de datos más fundamental en programación competitiva.

## Array Básico en C++

```cpp
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
```

## Operaciones Comunes

* **Búsqueda lineal**: $O(n)$
* **Búsqueda binaria**: $O(\log n)$ en arrays ordenados
* **Inserción/eliminación**: $O(n)$ en el peor caso
* **Acceso por índice**: $O(1)$

## Técnicas Importantes

### Two Pointers

Útil para problemas de subarray y búsqueda de pares.

```cpp
// Ejemplo: Encontrar par con suma objetivo
vector<int> twoSum(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) {
            return {left, right};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return {};
}
```

### Sliding Window

Para problemas de subarrays con propiedades específicas.

```cpp
// Ejemplo: Subarray de suma máxima (Kadane's Algorithm)
int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    
    for (int i = 1; i < nums.size(); i++) {
        currentSum = max(nums[i], currentSum + nums[i]);
        maxSum = max(maxSum, currentSum);
    }
    
    return maxSum;
}
```

## Algoritmos Clásicos

### Ordenamiento de Arrays

```cpp
// Usando STL
sort(arr.begin(), arr.end());

// Ordenamiento personalizado
sort(arr.begin(), arr.end(), [](int a, int b) {
    return a > b;  // Orden descendente
});
```

### Búsqueda Binaria

```cpp
int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;  // No encontrado
}
```

## Problemas Típicos

1. **Subarray de suma máxima** - Kadane's Algorithm
2. **Two Sum** - Encontrar dos números que sumen un objetivo
3. **Merge Intervals** - Fusionar intervalos superpuestos
4. **Maximum Product Subarray** - Subarray de producto máximo
5. **Rotate Array** - Rotar un array k posiciones

## Complejidades a Recordar

| Operación | Array | Vector (C++) | 
|-----------|-------|--------------|
| Acceso | $O(1)$ | $O(1)$ |
| Búsqueda | $O(n)$ | $O(n)$ |
| Inserción (final) | $O(n)$ | $O(1)$ amortizado |
| Inserción (medio) | $O(n)$ | $O(n)$ |
| Eliminación | $O(n)$ | $O(n)$ | 