import { CheckCircle, BarChart3, Users, Zap, Shield, Star, TrendingUp, Award } from 'lucide-react';
import { useAuthStore } from '../stores/AuthStore';
import { Toaster } from 'sonner';
import { useNotificationStore } from '../stores/NotificationStore';
import { useTranslation } from '../../node_modules/react-i18next';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useUserDropdownStore } from '../stores/UserDropdownStore';
import { useMemo } from 'react';
import WelcomeModal from '../components/WelcomeModal';
import { useWelcomeStore } from '../stores/WelcomeStore';
import { useDemoStore } from '../stores/DemoModalStore';
import DemoModal from '../components/SiteDemoModal';

export default function Main() {
  const { isAuthorized } = useAuthStore()
  const { currentTheme } = useUserDropdownStore()
  const { isOpen } = useWelcomeStore()
  const { showNotifications, setShowNotifications } = useNotificationStore()
  const { isOpen: isDemoOpen, setOpen } = useDemoStore()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const testimonials = t('main.testimonials.items', { returnObjects: true }) as {
    quote: string
    author: string
    role: string
  }[]

  const bgStyle = useMemo(() => {
    return currentTheme === 'light' ? {position: 'relative'} : {
      backgroundImage: 'url("/landing-bg.webp")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }
  }, [currentTheme])

  return (
    <div className="min-h-screen bg-[var(--color-base-100)] text-[var(--color-base-content)]" style={bgStyle}>
      {currentTheme !== 'light' && <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 0
      }}></div>}

      <div style={{ position: 'relative', zIndex: 1 }}>

        <Navbar />

        <Toaster />

        {isOpen && <WelcomeModal />}
        {isDemoOpen && <DemoModal />}

        <section className="container mx-auto px-6 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div data-aos='fade-up' data-aos-easing="ease-out-cubic" className="inline-block mb-4 px-4 py-2 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium font-tektur">
              {t('main.hero.badge')}
            </div>
            <h1 data-aos='fade-up' data-aos-delay='100' data-aos-easing='ease-out-cubic' className="text-6xl font-bold mb-6 text-[var(--color-base-content)] drop-shadow-lg" dangerouslySetInnerHTML={{ __html: t('main.hero.title') }}>
            </h1>
            <p data-aos='fade-up' data-aos-easing="ease-out-cubic" data-aos-delay='150' className="text-xl mb-8 text-[var(--color-base-content)] opacity-90 drop-shadow-md">
              {t('main.hero.subtitle')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap mb-8">
              <button
                data-aos='fade-up' data-aos-easing="ease-out-cubic" data-aos-delay='200'
                onClick={() => !isAuthorized ? navigate('/auth') : navigate('/dashboard')}
                className="px-8 py-4 rounded-lg font-medium text-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105 transition-all shadow-lg"
              >
                {!isAuthorized ? t('main.hero.ctaTrial') : t('main.hero.ctaStart')}
              </button>
              <button onClick={() => setOpen(true)} data-aos='fade-up' data-aos-easing="ease-out-cubic" data-aos-delay='200' className="px-8 py-4 rounded-lg font-medium text-lg bg-[var(--color-base-200)]/80 backdrop-blur-sm text-[var(--color-base-content)] hover:scale-105 transition-all border border-[var(--color-base-300)]">
                {t('main.hero.ctaDemo')}
              </button>
            </div>

            <div data-aos='fade-up' data-aos-easing="ease-out-cubic" data-aos-delay='250' className="flex items-center justify-center gap-8 flex-wrap text-sm text-[var(--color-base-content)] opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
                <span>{t('main.hero.trust.noCard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--color-info)]" />
                <span>{t('main.hero.trust.security')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[var(--color-warning)]" />
                <span>{t('main.hero.trust.rating')}</span>
              </div>
            </div>
          </div>
        </section>

        <section data-aos='fade-up' data-aos-easing="ease-out-cubic" data-aos-delay='300' className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { number: '50K+', label: t('main.stats.users'), icon: <Users className="w-6 h-6" /> },
              { number: '10M+', label: t('main.stats.surveys'), icon: <BarChart3 className="w-6 h-6" /> },
              { number: '99.9%', label: t('main.stats.uptime'), icon: <TrendingUp className="w-6 h-6" /> },
              { number: '24/7', label: t('main.stats.support'), icon: <Award className="w-6 h-6" /> }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 rounded-lg bg-[var(--color-base-200)]/80 backdrop-blur-sm border border-[var(--color-base-300)] transition-all">
                <div className="flex justify-center mb-3 text-[var(--color-primary)]">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">{stat.number}</div>
                <div className="text-sm text-[var(--color-base-content)] opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section data-aos='fade-up' data-aos-easing="ease-out-cubic" data-aos-delay='100' className="container mx-auto px-6 py-20">
          <h3 className="text-4xl font-bold text-center mb-4 text-[var(--color-base-content)]">
            {t('main.features.title')}
          </h3>
          <p className="text-center text-[var(--color-base-content)] opacity-80 mb-12 text-lg">
            {t('main.features.subtitle')}
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: t('main.features.builder.title'),
                description: t('main.features.builder.description'),
                color: 'var(--color-primary)',
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: t('main.features.analytics.title'),
                description: t('main.features.analytics.description'),
                color: 'var(--color-secondary)',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: t('main.features.collaboration.title'),
                description: t('main.features.collaboration.description'),
                color: 'var(--color-accent)',
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-lg bg-[var(--color-base-200)]/80 backdrop-blur-sm border-2 border-[var(--color-base-300)] transition-all"
              >
                <div className="mb-4 inline-block p-4 rounded-lg bg-[var(--color-primary)]/20">
                  <div className="text-[var(--color-primary)]">{feature.icon}</div>
                </div>
                <h4 className="text-xl font-bold mb-3 text-[var(--color-base-content)]">
                  {feature.title}
                </h4>
                <p className="text-[var(--color-base-content)] opacity-80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 bg-[var(--color-base-200)]/60 backdrop-blur-sm">
          <div data-aos='fade-up' data-aos-easing="ease-out-cubic" className="container mx-auto px-6">
            <h3 className="text-4xl font-bold text-center mb-4 text-[var(--color-base-content)]">
              {t('main.useCases.title')}
            </h3>
            <p className="text-center text-[var(--color-base-content)] opacity-80 mb-12 text-lg">
              {t('main.useCases.subtitle')}
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: t('main.useCases.customer.title'),
                  description: t('main.useCases.customer.description'),
                  icon: <CheckCircle className="w-6 h-6" />
                },
                {
                  title: t('main.useCases.market.title'),
                  description: t('main.useCases.market.description'),
                  icon: <Zap className="w-6 h-6" />
                },
                {
                  title: t('main.useCases.employee.title'),
                  description: t('main.useCases.employee.description'),
                  icon: <BarChart3 className="w-6 h-6" />
                },
                {
                  title: t('main.useCases.event.title'),
                  description: t('main.useCases.event.description'),
                  icon: <Users className="w-6 h-6" />
                }
              ].map((service, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-lg bg-[var(--color-base-100)]/80 backdrop-blur-sm border-2 border-[var(--color-base-300)] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-[var(--color-base-content)]">
                        {service.title}
                      </h4>
                      <p className="text-[var(--color-base-content)] opacity-80 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <h3 data-aos='fade-up' data-aos-easing="ease-out-cubic" className="text-4xl font-bold text-center mb-12 text-[var(--color-base-content)]">
            {t('main.testimonials.title')}
          </h3>
          <div data-aos='fade-up' data-aos-easing="ease-out-cubic" data-aos-delay='100' className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-8 rounded-lg bg-[var(--color-base-200)]/80 backdrop-blur-sm border border-[var(--color-base-300)] transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                  ))}
                </div>
                <p className="text-[var(--color-base-content)] opacity-90 mb-4 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-bold text-[var(--color-base-content)]">{testimonial.author}</div>
                  <div className="text-sm text-[var(--color-base-content)] opacity-70">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 py-20 text-center">
          <div data-aos='fade-up' data-aos-easing="ease-out-cubic" className="max-w-3xl mx-auto p-12 rounded-lg bg-[var(--color-base-200)]/80 backdrop-blur-sm border-2 border-[var(--color-primary)] shadow-2xl">
            <h3 className="text-4xl font-bold mb-4 text-[var(--color-base-content)]">
              {t('main.cta.title')}
            </h3>
            <p className="text-lg mb-8 text-[var(--color-base-content)] opacity-80">
              {t('main.cta.subtitle')}
            </p>
            <button
              onClick={() => !isAuthorized ? navigate('/auth') : navigate('/dashboard')}
              className="px-10 py-4 rounded-lg font-medium text-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105 transition-all shadow-lg mb-4"
            >
              {!isAuthorized ? t('main.cta.buttonTrial') : t('main.cta.buttonStart')}
            </button>
            <p className="text-sm text-[var(--color-base-content)] opacity-70">
              {t('main.cta.note')}
            </p>
          </div>
        </section>

        <Footer />
      </div>

      {showNotifications && (
        <div
          className="fixed z-10"
          onClick={() => {
            setShowNotifications(false);
          }}
        ></div>
      )}
    </div>
  );
}