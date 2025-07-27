import BackgroundEffects from './BackgroundEffects';

const Compite = () => {
  const competenciasActivas = [
    {
      id: 1,
      nombre: "Weekly Contest #47",
      fecha: "25 Nov 2024, 19:00",
      duracion: "2 horas",
      participantes: 43,
      estado: "Próxima",
      dificultad: "Intermedio"
    },
    {
      id: 2,
      nombre: "ICPC Training Round",
      fecha: "28 Nov 2024, 17:00", 
      duracion: "5 horas",
      participantes: 28,
      estado: "Inscripciones abiertas",
      dificultad: "Avanzado"
    },
    {
      id: 3,
      nombre: "Beginner's Challenge",
      fecha: "30 Nov 2024, 16:00",
      duracion: "1.5 horas", 
      participantes: 67,
      estado: "Próxima",
      dificultad: "Principiante"
    }
  ];

  const ranking = [
    { posicion: 1, nombre: "Alexandra García", puntos: 2847, resueltos: 312 },
    { posicion: 2, nombre: "Miguel Rodríguez", puntos: 2734, resueltos: 298 },
    { posicion: 3, nombre: "Carmen López", puntos: 2689, resueltos: 285 },
    { posicion: 4, nombre: "David Martín", puntos: 2543, resueltos: 267 },
    { posicion: 5, nombre: "Sara Fernández", puntos: 2456, resueltos: 254 },
    { posicion: 6, nombre: "Carlos Jiménez", puntos: 2398, resueltos: 241 },
    { posicion: 7, nombre: "Elena Moreno", puntos: 2287, resueltos: 228 },
    { posicion: 8, nombre: "Javier Ruiz", puntos: 2156, resueltos: 215 }
  ];

  const estadoDificultadColors = {
    "Próxima": "bg-blue-100/70 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "Inscripciones abiertas": "bg-green-100/70 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    "Principiante": "bg-warm-orange/20 text-warm-orange dark:bg-orange-900/30 dark:text-orange-300",
    "Intermedio": "bg-warm-pink/20 text-warm-pink dark:bg-pink-900/30 dark:text-pink-300",
    "Avanzado": "bg-warm-red/20 text-warm-red dark:bg-red-900/30 dark:text-red-300"
  };

  return (
    <section className="min-h-screen relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
      <BackgroundEffects intensity="subtle" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-black dark:text-pure-white leading-tight mb-6 drop-shadow-sm">
            Competencias
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-light max-w-3xl mx-auto">
            Pon a prueba tus habilidades, compite con otros miembros y sube en el ranking del club
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Upcoming Competitions */}
          <div>
            <h2 className="text-2xl font-light text-black dark:text-pure-white mb-8 text-center lg:text-left">
              Próximas competencias
            </h2>
            
            <div className="space-y-6">
              {competenciasActivas.map((comp) => (
                <div 
                  key={comp.id}
                  className="bg-gray-50/70 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-light text-black dark:text-pure-white">
                      {comp.nombre}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-light ${estadoDificultadColors[comp.estado]}`}>
                      {comp.estado}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 font-light">
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Fecha</span>
                      {comp.fecha}
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Duración</span>
                      {comp.duracion}
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Participantes</span>
                      {comp.participantes} inscritos
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Dificultad</span>
                      <span className={`px-2 py-1 rounded text-xs ${estadoDificultadColors[comp.dificultad]}`}>
                        {comp.dificultad}
                      </span>
                    </div>
                  </div>
                  
                  <button className="mt-4 w-full bg-warm-orange/20 hover:bg-warm-orange/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-pure-white py-2 rounded-lg font-light transition-all duration-200">
                    Inscribirse
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rankings */}
          <div>
            <h2 className="text-2xl font-light text-black dark:text-pure-white mb-8 text-center lg:text-left">
              Ranking del club
            </h2>
            
            <div className="bg-gray-50/70 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-100/70 dark:bg-gray-800/50">
                <div className="grid grid-cols-4 gap-4 text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <div>#</div>
                  <div className="col-span-2">Participante</div>
                  <div className="text-right">Puntos</div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {ranking.map((user) => (
                  <div key={user.posicion} className="p-4 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors duration-200">
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="text-lg font-light text-black dark:text-pure-white">
                        {user.posicion <= 3 ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            user.posicion === 1 ? 'bg-yellow-400 text-yellow-900' :
                            user.posicion === 2 ? 'bg-gray-300 text-gray-800' :
                            'bg-orange-400 text-orange-900'
                          }`}>
                            {user.posicion}
                          </span>
                        ) : (
                          user.posicion
                        )}
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm font-light text-black dark:text-pure-white">
                          {user.nombre}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.resueltos} problemas
                        </div>
                      </div>
                      <div className="text-right text-sm font-light text-warm-orange dark:text-warm-pink">
                        {user.puntos.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-6">
              <button className="text-warm-orange dark:text-warm-pink hover:text-warm-red dark:hover:text-warm-orange transition-colors duration-200 text-sm font-light">
                Ver ranking completo →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Compite; 