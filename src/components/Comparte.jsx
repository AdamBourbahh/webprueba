import { ExternalLink, BookOpen, Code, Users, Trophy, Download } from 'lucide-react';

import BackgroundEffects from './BackgroundEffects';

const Comparte = () => {
  const recursos = [
    {
      categoria: "Plataformas de práctica",
      items: [
        { nombre: "Codeforces", url: "https://codeforces.com", descripcion: "Competencias regulares y banco de problemas extenso", icono: <Trophy className="w-5 h-5" /> },
        { nombre: "AtCoder", url: "https://atcoder.jp", descripcion: "Plataforma japonesa con problemas únicos", icono: <Code className="w-5 h-5" /> },
        { nombre: "LeetCode", url: "https://leetcode.com", descripcion: "Ideal para preparación de entrevistas técnicas", icono: <BookOpen className="w-5 h-5" /> },
        { nombre: "HackerRank", url: "https://hackerrank.com", descripcion: "Variedad de dominios y certificaciones", icono: <Users className="w-5 h-5" /> }
      ]
    },
    {
      categoria: "Recursos educativos", 
      items: [
        { nombre: "CP-Algorithms", url: "https://cp-algorithms.com", descripcion: "Algoritmos explicados con implementaciones", icono: <BookOpen className="w-5 h-5" /> },
        { nombre: "USACO Guide", url: "https://usaco.guide", descripcion: "Guía completa para programación competitiva", icono: <Code className="w-5 h-5" /> },
        { nombre: "Competitive Programmer's Handbook", url: "#", descripcion: "Libro gratuito con fundamentos esenciales", icono: <Download className="w-5 h-5" /> },
        { nombre: "GeeksforGeeks", url: "https://geeksforgeeks.org", descripcion: "Artículos y tutoriales de algoritmos", icono: <BookOpen className="w-5 h-5" /> }
      ]
    },
    {
      categoria: "Comunidades",
      items: [
        { nombre: "Discord CPC UGR", url: "#", descripcion: "Nuestro servidor oficial para discusiones", icono: <Users className="w-5 h-5" /> },
        { nombre: "Reddit r/programming", url: "https://reddit.com/r/programming", descripcion: "Comunidad global de programadores", icono: <Users className="w-5 h-5" /> },
        { nombre: "Stack Overflow", url: "https://stackoverflow.com", descripcion: "Plataforma de preguntas y respuestas", icono: <Code className="w-5 h-5" /> },
        { nombre: "GitHub", url: "https://github.com/cpc-ugr", descripcion: "Nuestros repositorios y proyectos", icono: <Code className="w-5 h-5" /> }
      ]
    }
  ];

  const templates = [
    { nombre: "Template C++", archivo: "template.cpp", descripcion: "Plantilla básica para competencias", tamaño: "2.1 KB" },
    { nombre: "Algoritmos básicos", archivo: "algorithms.cpp", descripcion: "Implementaciones de algoritmos frecuentes", tamaño: "15.3 KB" },
    { nombre: "Estructuras de datos", archivo: "data_structures.cpp", descripcion: "DSU, Segment Tree, Fenwick Tree, etc.", tamaño: "8.7 KB" },
    { nombre: "Template Python", archivo: "template.py", descripcion: "Plantilla optimizada para Python", tamaño: "1.8 KB" }
  ];

  return (
    <section className="min-h-screen relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
      <BackgroundEffects intensity="subtle" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-black dark:text-pure-white leading-tight mb-6 drop-shadow-sm">
            Recursos compartidos
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-light max-w-3xl mx-auto">
            Descubre plataformas, herramientas y recursos que te ayudarán a mejorar en programación competitiva
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {recursos.map((categoria, index) => (
            <div key={index} className="bg-gray-50/70 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-light text-black dark:text-pure-white mb-6 text-center">
                {categoria.categoria}
              </h2>
              
              <div className="space-y-4">
                {categoria.items.map((item, itemIndex) => (
                  <a
                    key={itemIndex}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white/50 dark:bg-gray-800/30 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700/40 transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-warm-orange dark:text-warm-pink group-hover:text-warm-red dark:group-hover:text-warm-orange transition-colors duration-200">
                        {item.icono}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-light text-black dark:text-pure-white group-hover:text-warm-red dark:group-hover:text-warm-orange transition-colors duration-200">
                            {item.nombre}
                          </h3>
                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-warm-orange dark:group-hover:text-warm-pink transition-colors duration-200" />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-light mt-1 leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Templates Section */}
        <div className="bg-gray-50/70 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-8">
          <h2 className="text-2xl font-light text-black dark:text-pure-white mb-8 text-center">
            Templates y código de referencia
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <div
                key={index}
                className="bg-white/50 dark:bg-gray-800/30 rounded-lg p-5 hover:bg-white/70 dark:hover:bg-gray-700/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Download className="w-5 h-5 text-warm-orange dark:text-warm-pink group-hover:text-warm-red dark:group-hover:text-warm-orange transition-colors duration-200" />
                  <h3 className="text-sm font-light text-black dark:text-pure-white">
                    {template.nombre}
                  </h3>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-300 font-light mb-3 leading-relaxed">
                  {template.descripcion}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
                    {template.tamaño}
                  </span>
                  <button className="text-xs text-warm-orange dark:text-warm-pink hover:text-warm-red dark:hover:text-warm-orange transition-colors duration-200 font-light">
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution CTA */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-light text-black dark:text-pure-white mb-4">
            ¿Tienes un recurso útil que compartir?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 font-light mb-6 max-w-2xl mx-auto">
            Ayuda a la comunidad compartiendo tus recursos favoritos, templates personalizados o cualquier material que consideres valioso.
          </p>
          <button className="bg-warm-orange/20 hover:bg-warm-orange/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-pure-white px-8 py-3 rounded-lg font-light transition-all duration-300 backdrop-blur-sm">
            Contribuir recurso
          </button>
        </div>
      </div>
    </section>
  );
};

export default Comparte; 