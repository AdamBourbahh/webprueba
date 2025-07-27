const BackgroundEffects = ({ intensity = 'normal' }) => {
  // Adjust opacity based on intensity
  const opacities = {
    subtle: {
      glass1: 'opacity-[0.008]',
      glass1Dark: 'opacity-[0.03]',
      glass2: 'opacity-[0.004]',
      glass2Dark: 'opacity-[0.015]',
      cloudsLight: 'from-warm-orange/4 via-warm-pink/2',
      cloudsLightSecondary: 'from-warm-red/3 via-warm-orange/1',
      cloudsDark: 'from-white/3 via-white/1',
      cloudsDarkSecondary: 'from-white/2 via-white/1'
    },
    normal: {
      glass1: 'opacity-[0.015]',
      glass1Dark: 'opacity-[0.06]',
      glass2: 'opacity-[0.008]',
      glass2Dark: 'opacity-[0.03]',
      cloudsLight: 'from-warm-orange/6 via-warm-pink/3',
      cloudsLightSecondary: 'from-warm-red/4 via-warm-orange/2',
      cloudsDark: 'from-white/4 via-white/2',
      cloudsDarkSecondary: 'from-white/3 via-white/1'
    }
  };

  const config = opacities[intensity] || opacities.normal;

  return (
    <>
      {/* Glass/Crystal Background Effect */}
      <div className="absolute inset-0 bg-pure-white dark:bg-black pointer-events-none">
        <div className={`absolute inset-0 ${config.glass1} dark:${config.glass1Dark}`} 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               backgroundSize: '300px 300px'
             }}>
        </div>
        
        {/* Secondary texture layer for depth */}
        <div className={`absolute inset-0 ${config.glass2} dark:${config.glass2Dark}`} 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)'/%3E%3C/svg%3E")`,
               backgroundSize: '500px 500px'
             }}>
        </div>
      </div>

      {/* Subtle Cloud Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light mode clouds */}
        <div className="dark:hidden">
          <div className={`absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-radial ${config.cloudsLight} to-transparent blur-3xl animate-cloud-glow`}></div>
          <div className={`absolute top-2/3 right-1/4 w-80 h-80 bg-gradient-radial ${config.cloudsLightSecondary} to-transparent blur-2xl animate-cloud-glow`} style={{animationDelay: '2s'}}></div>
        </div>

        {/* Dark mode clouds */}
        <div className="hidden dark:block">
          <div className={`absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-radial ${config.cloudsDark} to-transparent blur-3xl animate-cloud-glow`}></div>
          <div className={`absolute top-2/3 right-1/4 w-80 h-80 bg-gradient-radial ${config.cloudsDarkSecondary} to-transparent blur-2xl animate-cloud-glow`} style={{animationDelay: '2s'}}></div>
        </div>
      </div>
    </>
  );
};

export default BackgroundEffects; 