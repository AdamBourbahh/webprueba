import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Inicializar con false por defecto para evitar hidration mismatch
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Efecto para cargar la preferencia guardada después del primer render (solo en cliente)
  useEffect(() => {
    setMounted(true);
    
    // Verificar si hay una preferencia guardada en localStorage
    const saved = localStorage.getItem('theme');
    if (saved) {
      const savedIsDark = saved === 'dark';
      setIsDark(savedIsDark);
      // Aplicar la clase inmediatamente
      if (savedIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Si no hay preferencia guardada, usar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Efecto para aplicar el tema cuando cambia
  useEffect(() => {
    if (!mounted) return;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark, mounted]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // No renderizar hasta que el componente esté montado para evitar hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ isDark: false, toggleTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  const value = {
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 