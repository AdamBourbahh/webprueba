import BackgroundEffects from './BackgroundEffects';

const SobreNosotros = () => {
  return (
    <section className="min-h-screen flex items-center justify-start relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <BackgroundEffects intensity="subtle" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl w-full pl-4 sm:pl-8 lg:pl-12 xl:pl-16">
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-black dark:text-pure-white leading-tight mb-12 drop-shadow-sm">
          Sobre nosotros
        </h1>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-light text-black dark:text-pure-white mb-4">
                Nuestra misión
              </h2>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                El Club de Programación Competitiva UGR es una comunidad dedicada a fomentar 
                el desarrollo de habilidades algorítmicas y de resolución de problemas entre 
                estudiantes universitarios.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-light text-black dark:text-pure-white mb-4">
                ¿Qué hacemos?
              </h2>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                Organizamos entrenamientos semanales, participamos en competencias nacionales 
                e internacionales, y creamos un ambiente colaborativo donde los miembros pueden 
                aprender y mejorar sus habilidades de programación.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-light text-black dark:text-pure-white mb-4">
                Únete a nosotros
              </h2>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                No importa tu nivel de experiencia. Desde principiantes hasta expertos, 
                todos son bienvenidos a formar parte de nuestra comunidad.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-light text-warm-orange dark:text-white mb-2">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-light">Miembros</div>
              </div>
              
              <div className="text-center p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-light text-warm-pink dark:text-white mb-2">150+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-light">Problemas</div>
              </div>
              
              <div className="text-center p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-light text-warm-red dark:text-white mb-2">25+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-light">Competencias</div>
              </div>
              
              <div className="text-center p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-light text-warm-orange dark:text-white mb-2">3</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-light">Años activos</div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-light text-black dark:text-pure-white mb-4">
                Nuestros valores
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 font-light">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-warm-orange rounded-full mr-3"></span>
                  Colaboración y aprendizaje mutuo
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-warm-pink rounded-full mr-3"></span>
                  Excelencia en programación
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-warm-red rounded-full mr-3"></span>
                  Inclusión y diversidad
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-warm-orange rounded-full mr-3"></span>
                  Crecimiento personal y profesional
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreNosotros; 