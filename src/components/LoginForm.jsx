import { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await login(formData);
      
      if (result.success) {
        console.log('Login exitoso:', result.user);
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pure-white dark:bg-black transition-colors duration-300 pt-16">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-pure-white dark:bg-black pointer-events-none">
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.06]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               backgroundSize: '300px 300px'
             }}>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md">
          {/* Card principal */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-warm-orange/20 dark:bg-warm-orange/10 rounded-lg mb-4">
                <LogIn className="h-6 w-6 text-warm-orange" />
              </div>
              <h1 className="text-2xl font-light text-black dark:text-white mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-light">
                Accede a tu cuenta del CPC UGR
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Usuario/Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usuario o Email
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange focus:border-transparent transition-all duration-200"
                  placeholder="tu-usuario o email@ejemplo.com"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-orange focus:border-transparent transition-all duration-200"
                    placeholder="Tu contraseña"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-warm-orange bg-gray-100 border-gray-300 rounded focus:ring-warm-orange focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Recordar sesión
                  </span>
                </label>
                
                <button
                  type="button"
                  className="text-sm text-warm-orange hover:text-warm-red transition-colors"
                  disabled={loading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading || !formData.username.trim() || !formData.password.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-warm-orange hover:bg-warm-red text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            {/* Link to register */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-warm-orange hover:text-warm-red font-medium transition-colors"
                  disabled={loading}
                >
                  Regístrate aquí
                </button>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔐 Credenciales de prueba:
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div><strong>Admin:</strong> admin / admin123</div>
                <div><strong>Estudiante:</strong> Regístrate con cualquier email</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 