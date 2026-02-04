import { useState, useEffect } from 'react';
import { Home, ArrowLeft, MapPin, HelpCircle, Sparkles } from 'lucide-react';
import { useTranslation } from '../../node_modules/react-i18next';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const suggestions = [
    { icon: <Home className="w-5 h-5" />, text: t('notFound.toHomePage'), action: () => window.location.href = '/' },
    { icon: <HelpCircle className="w-5 h-5" />, text: t('notFound.getHelp'), action: () => navigate('/contact-us') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-base-100)] to-[var(--color-base-200)] relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden">

        <div 
          className="absolute w-96 h-96 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 bg-[var(--color-secondary)] opacity-10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            right: `${(window.innerWidth - mousePosition.x) / 25}px`,
            bottom: `${(window.innerHeight - mousePosition.y) / 25}px`,
          }}
        ></div>
        <div className="absolute w-64 h-64 bg-[var(--color-accent)] opacity-8 rounded-full blur-2xl top-1/4 left-1/3 animate-pulse"></div>
        
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[var(--color-primary)] rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center">

          <div className="mb-8 relative">
            <div 
              className="text-[12rem] md:text-[16rem] font-black leading-none relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <span 
                className="inline-block transition-all duration-300 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] bg-clip-text text-transparent"
                style={{
                  transform: isHovering ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                }}
              >
                4
              </span>
              <span 
                className="inline-block transition-all duration-300 bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-accent)] to-[var(--color-primary)] bg-clip-text text-transparent"
                style={{
                  transform: isHovering ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                0
              </span>
              <span 
                className="inline-block transition-all duration-300 bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent"
                style={{
                  transform: isHovering ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                }}
              >
                4
              </span>
            </div>
            
            <Sparkles className="absolute top-0 left-1/4 w-8 h-8 text-[var(--color-warning)] animate-pulse" />
            <Sparkles className="absolute top-1/4 right-1/4 w-6 h-6 text-[var(--color-success)] animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute bottom-1/4 left-1/3 w-7 h-7 text-[var(--color-info)] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur mb-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-base-content)] mb-3">
                {t('notFound.title')}
              </h1>
              <p className="text-xl text-[var(--color-base-content)] opacity-70 mb-2">
                {t('notFound.subtitle')} 🗺️
              </p>
              <p className="text-[var(--color-base-content)] opacity-60">
                {t('notFound.subtitle2')}
              </p>
            </div>

            <div className="my-8 p-6 bg-[var(--color-base-100)] rounded-xl border-2 border-[var(--color-base-300)]">
              <div className="flex items-center justify-center gap-4 text-6xl mb-4">
                <span className="animate-bounce">🔍</span>
                <span className="animate-pulse">🤔</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>📍</span>
              </div>
              <p className="text-[var(--color-base-content)] opacity-70">
                {t('notFound.subtitle3')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={suggestion.action}
                  className="cursor-pointer group relative overflow-hidden bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-all hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all">
                      {suggestion.icon}
                    </div>
                    <span className="font-medium text-[var(--color-base-content)] text-left">
                      {suggestion.text}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] opacity-0 group-hover:opacity-5 transition-all"></div>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="cursor-pointer px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold text-lg hover:scale-105 transition-all shadow-lg flex items-center gap-3"
              >
                <Home className="w-6 h-6" />
                {t('notFound.takeMeHome')}
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="cursor-pointer px-8 py-4 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] font-bold text-lg hover:bg-[var(--color-neutral)] hover:scale-105 transition-all flex items-center gap-3"
              >
                <ArrowLeft className="w-6 h-6" />
                {t('notFound.goBack')}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[var(--color-base-content)] opacity-50 text-sm">
              {t('notFound.errorCode')}
            </p>
            <p className="text-[var(--color-base-content)] opacity-50 text-sm mt-2">
              {t('notFound.mistake')} <button onClick={() => alert('Contact support')} className="cursor-pointer text-[var(--color-primary)] hover:underline font-medium">{t('notFound.contactSupport').toLowerCase()}</button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0.5;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}