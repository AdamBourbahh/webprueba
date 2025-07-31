const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-start relative px-4 sm:px-6 lg:px-8">
      {/* Background Effects - FIXED like in Comparte */}
      <div className="fixed inset-0 bg-pure-white dark:bg-black pointer-events-none">
        {/* Fine grain texture for glass effect */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.08]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               backgroundSize: '300px 300px'
             }}>
        </div>
        
        {/* Secondary texture layer for depth */}
        <div className="absolute inset-0 opacity-[0.008] dark:opacity-[0.03]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)'/%3E%3C/svg%3E")`,
               backgroundSize: '500px 500px'
             }}>
        </div>
        
        {/* Gradient Cloud Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Light mode clouds */}
          <div className="dark:hidden">
            {/* Large diffused gradient blob - top center */}
            <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-gradient-radial from-warm-orange/30 via-warm-pink/20 to-transparent blur-3xl animate-cloud-glow"></div>
            
            {/* Medium gradient blob - center left */}
            <div className="absolute top-1/3 -left-32 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-gradient-radial from-warm-red/25 via-warm-orange/15 to-transparent blur-2xl animate-cloud-glow" style={{animationDelay: '1s'}}></div>
            
            {/* Small gradient blob - bottom center */}
            <div className="absolute bottom-20 left-1/4 w-64 h-64 sm:w-[400px] sm:h-[400px] bg-gradient-radial from-warm-pink/35 via-warm-red/20 to-transparent blur-xl animate-cloud-glow" style={{animationDelay: '2s'}}></div>
            
            {/* Additional atmospheric effect */}
            <div className="absolute top-1/2 left-1/3 w-72 h-72 sm:w-[450px] sm:h-[450px] bg-gradient-radial from-warm-orange/40 via-transparent to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '0.5s'}}></div>
            
            {/* Extra large background cloud */}
            <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-gradient-radial from-warm-pink/20 via-warm-orange/12 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '1.5s'}}></div>
            
            {/* Right side gradient for balance */}
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-warm-red/22 via-warm-pink/12 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '3s'}}></div>
            
            {/* Extra warm accent - bottom right */}
            <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-gradient-radial from-warm-orange/35 via-warm-pink/18 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '2.5s'}}></div>
            
            {/* ADDITIONAL RIGHT COVERAGE */}
            <div className="absolute top-0 right-0 w-[100vw] h-full bg-gradient-radial from-warm-red/15 via-warm-orange/8 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '4s'}}></div>
            <div className="absolute inset-y-0 right-0 w-[50vw] bg-gradient-radial from-warm-pink/20 via-warm-red/10 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '5s'}}></div>
          </div>

          {/* Dark mode clouds - ONLY WHITE */}
          <div className="hidden dark:block">
            {/* Large diffused gradient blob - top center */}
            <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-gradient-radial from-white/20 via-white/10 to-transparent blur-3xl animate-cloud-glow"></div>
            
            {/* Medium gradient blob - center left */}
            <div className="absolute top-1/3 -left-32 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-gradient-radial from-white/18 via-white/8 to-transparent blur-2xl animate-cloud-glow" style={{animationDelay: '1s'}}></div>
            
            {/* Small gradient blob - bottom center */}
            <div className="absolute bottom-20 left-1/4 w-64 h-64 sm:w-[400px] sm:h-[400px] bg-gradient-radial from-white/25 via-white/12 to-transparent blur-xl animate-cloud-glow" style={{animationDelay: '2s'}}></div>
            
            {/* Additional atmospheric effect */}
            <div className="absolute top-1/2 left-1/3 w-72 h-72 sm:w-[450px] sm:h-[450px] bg-gradient-radial from-white/30 via-transparent to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '0.5s'}}></div>
            
            {/* Extra large background cloud */}
            <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-gradient-radial from-white/15 via-white/6 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '1.5s'}}></div>
            
            {/* Right side gradient for balance */}
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-white/22 via-white/10 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '3s'}}></div>
            
            {/* Extra warm accent - bottom right */}
            <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-gradient-radial from-white/16 via-white/6 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '2.5s'}}></div>
            
            {/* ADDITIONAL RIGHT COVERAGE */}
            <div className="absolute top-0 right-0 w-[100vw] h-full bg-gradient-radial from-white/12 via-white/6 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '4s'}}></div>
            <div className="absolute inset-y-0 right-0 w-[50vw] bg-gradient-radial from-white/15 via-white/8 to-transparent blur-3xl animate-cloud-glow" style={{animationDelay: '5s'}}></div>
          </div>
        </div>
      </div>

      {/* Content - Aligned to the left */}
      <div className="relative z-10 max-w-5xl w-full text-left pl-4 sm:pl-8 lg:pl-12 xl:pl-16">
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-black dark:text-pure-white leading-tight mb-8 drop-shadow-sm">
          Tu espacio para aprender,
          <br />
          competir y crecer en el mundo
          <br />
          de los algoritmos.
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm lg:text-base text-black dark:text-pure-white font-light tracking-wider opacity-90">
          CLUB DE PROGRAMACIÓN COMPETITIVA UGR
        </p>
      </div>
    </section>
  );
};

export default HeroSection; 