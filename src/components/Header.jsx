import { Github, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const router = useRouter();
  
  const navItems = [
    { label: 'Sobre nosotros', path: '/sobre-nosotros' },
    { label: 'Noticias', path: '/noticias' },
    { label: 'Aprende', path: '/aprende' },
    { label: 'Compite', path: '/compite' },
    { label: 'Comparte', path: '/comparte' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-pure-white/5 dark:bg-black/5 backdrop-blur-sm">
      <div className="w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            {/* Logo */}
            <div className="w-16 h-16 flex-shrink-0">
              {/* Logo para modo claro */}
              <img 
                src="/assets/logo_claro.svg" 
                alt="CPC UGR Logo" 
                className="w-full h-full block dark:hidden"
              />
              {/* Logo para modo oscuro */}
              <img 
                src="/assets/logo_oscuro.png" 
                alt="CPC UGR Logo" 
                className="w-full h-full hidden dark:block"
              />
            </div>
            {/* Brand Text */}
            <div className="text-lg font-light text-black dark:text-pure-white">
              CPC UGR
            </div>
          </Link>

          {/* Right side: Navigation + GitHub + Theme Toggle */}
          <div className="flex items-center space-x-8">
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className={`text-sm font-light transition-colors duration-200 ${
                    router.pathname === item.path
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-gray-700 dark:text-pure-white hover:text-red-500 dark:hover:text-red-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 dark:text-pure-white hover:text-gray-900 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
    </header>
  );
};

export default Header; 