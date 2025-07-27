import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ContentProvider } from './context/ContentContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SobreNosotros from './components/SobreNosotros';
import Noticias from './components/Noticias';
import Aprende from './components/Aprende';
import AdminCMS from './components/AdminCMS';
import Compite from './components/Compite';
import Comparte from './components/Comparte';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import CodeExercise from './components/CodeExercise';

function App() {
  const [currentSection, setCurrentSection] = useState(() => {
    // Leer la sección de la URL al cargar
    const path = window.location.pathname.slice(1); // Quitar el '/' inicial
    const hash = window.location.hash.slice(1); // Quitar el '#' inicial
    return hash || path || 'home';
  });

  // Sincronizar URL con el estado de la sección
  useEffect(() => {
    const updateURL = (section) => {
      if (section === 'home') {
        window.history.pushState({}, '', '/');
      } else if (section.startsWith('exercise-')) {
        // Para ejercicios, usar hash para mantener SPA
        window.history.pushState({}, '', `/#${section}`);
      } else if (['login', 'register'].includes(section)) {
        // Para auth, usar hash
        window.history.pushState({}, '', `/#${section}`);
      } else {
        // Para páginas principales, usar path
        window.history.pushState({}, '', `/${section}`);
      }
    };
    
    updateURL(currentSection);
  }, [currentSection]);

  // Manejar navegación del navegador (botón atrás/adelante)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1);
      const hash = window.location.hash.slice(1);
      setCurrentSection(hash || path || 'home');
    };

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentSection(hash);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderSection = () => {
    // Ejercicios de código
    if (currentSection.startsWith('exercise-')) {
      const exerciseId = currentSection.replace('exercise-', '');
      return <CodeExercise exerciseId={exerciseId} />;
    }

    // Páginas principales
    switch (currentSection) {
      case 'sobre-nosotros':
        return <SobreNosotros />;
      case 'noticias':
        return <Noticias />;
      case 'compite':
        return <Compite />;
      case 'comparte':
        return <Comparte />;
      case 'aprende':
        return <Aprende />;
      case 'admin-cms':
        return <AdminCMS />;
      case 'login':
        return <LoginForm onSuccess={() => setCurrentSection('home')} />;
      case 'register':
        return <RegisterForm onSuccess={() => setCurrentSection('home')} />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <ContentProvider>
          <div className="min-h-screen bg-pure-white dark:bg-black transition-colors duration-300">
            <Header 
              currentSection={currentSection} 
              setCurrentSection={setCurrentSection}
            />
            <main>
              {renderSection()}
            </main>
            
            {/* Indicador de conexión al backend */}
            <BackendStatus />
          </div>
        </ContentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Componente para mostrar el estado de conexión al backend
const BackendStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', {
          method: 'GET',
          timeout: 3000
        });
        setBackendStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    // Verificar estado inicial
    checkBackend();

    // Verificar periódicamente
    const interval = setInterval(checkBackend, 30000); // cada 30 segundos

    // Listener para detectar cambios de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      checkBackend();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Solo mostrar si hay problemas
  if (isOnline && backendStatus === 'online') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
        !isOnline 
          ? 'bg-gray-800 text-gray-200' 
          : backendStatus === 'offline'
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          : 'bg-blue-100 text-blue-800 border border-blue-300'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            !isOnline 
              ? 'bg-gray-400' 
              : backendStatus === 'offline'
              ? 'bg-yellow-500'
              : 'bg-blue-500 animate-pulse'
          }`}></div>
          <span>
            {!isOnline 
              ? 'Sin conexión a internet' 
              : backendStatus === 'offline'
              ? 'Modo offline - funcionalidad limitada'
              : 'Conectando al servidor...'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default App; 