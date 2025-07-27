import { useState } from 'react';
import { Lock, Calendar } from 'lucide-react';

const CMSLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (inputPassword) => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString();
    
    const validPassword = `${day}/${month}/${year}`;
    return inputPassword === validPassword;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular un pequeño delay para UX
    setTimeout(() => {
      if (validatePassword(password)) {
        // Guardar autenticación en sessionStorage
        sessionStorage.setItem('cms-authenticated', 'true');
        sessionStorage.setItem('cms-auth-time', Date.now().toString());
        onLogin(true);
      } else {
        setError('Contraseña incorrecta.');
        setPassword('');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-pure-white dark:bg-black transition-colors duration-300 pt-16">
      {/* Glass/Crystal Background Effect */}
      <div className="fixed inset-0 bg-pure-white dark:bg-black pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.08]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               backgroundSize: '300px 300px'
             }}>
        </div>
        
        {/* Secondary texture layer for depth */}
        <div className="absolute inset-0 opacity-[0.01] dark:opacity-[0.04]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)'/%3E%3C/svg%3E")`,
               backgroundSize: '500px 500px'
             }}>
        </div>
      </div>

      {/* Subtle Cloud Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Light mode clouds */}
        <div className="dark:hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-warm-orange/8 via-warm-pink/4 to-transparent blur-3xl animate-cloud-glow"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-radial from-warm-red/6 via-warm-orange/3 to-transparent blur-2xl animate-cloud-glow" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Dark mode clouds */}
        <div className="hidden dark:block">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-white/6 via-white/3 to-transparent blur-3xl animate-cloud-glow"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-radial from-white/4 via-white/2 to-transparent blur-2xl animate-cloud-glow" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-gray-50/90 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-warm-orange/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-warm-orange" />
              </div>
              <h1 className="text-2xl font-light text-black dark:text-pure-white mb-2">
                Acceso al CMS
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                Introduce la fecha de hoy para acceder
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="dd/mm/yyyy"
                    className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-pure-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-warm-orange/50 focus:border-warm-orange transition-all duration-200"
                    required
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-warm-red font-light">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-light transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-warm-orange/20 hover:bg-warm-orange/30 text-black dark:text-pure-white hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </div>
                ) : (
                  'Acceder al CMS'
                )}
              </button>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSLogin; 