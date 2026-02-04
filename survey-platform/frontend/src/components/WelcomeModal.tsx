import { X, ChevronRight, CheckCircle, BarChart3, Users, Zap, Shield, TrendingUp, Award, Sparkles } from 'lucide-react';
import { useWelcomeStore } from '../stores/WelcomeStore';
import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { useAuthStore } from '../stores/AuthStore';

export default function WelcomeModal() {
  const { currentStep, setCurrentStep, isOpen, setIsOpen, resetSteps } = useWelcomeStore()
  const navigate = useNavigate()

  const steps = useMemo(() => ([
    {
      title: 'Welcome to SurveyHub! 🎉',
      subtitle: 'Your journey to better insights starts here',
      description: 'Join thousands of teams who trust SurveyHub to collect feedback, measure satisfaction, and make data-driven decisions. Let\'s show you around!',
      icon: <Sparkles className="w-16 h-16" />,
      features: [
        { icon: <CheckCircle className="w-5 h-5" />, text: 'Create unlimited surveys & quizzes' },
        { icon: <CheckCircle className="w-5 h-5" />, text: 'Real-time analytics & insights' },
        { icon: <CheckCircle className="w-5 h-5" />, text: 'Enterprise-grade security' }
      ]
    },
    {
      title: 'Build Beautiful Surveys',
      subtitle: 'Professional surveys in minutes',
      description: 'Our intuitive drag-and-drop builder makes creating surveys effortless. Choose from multiple question types, customize the design, and share with your audience instantly.',
      icon: <BarChart3 className="w-16 h-16" />,
      features: [
        { icon: <Zap className="w-5 h-5" />, text: 'Drag & drop interface' },
        { icon: <Zap className="w-5 h-5" />, text: '15+ question types' },
        { icon: <Zap className="w-5 h-5" />, text: 'Custom branding & themes' }
      ]
    },
    {
      title: 'Engage with Interactive Quizzes',
      subtitle: 'Test knowledge, train teams',
      description: 'Create engaging quizzes with scoring, time limits, and instant feedback. Perfect for training, assessments, and employee engagement.',
      icon: <Award className="w-16 h-16" />,
      features: [
        { icon: <Award className="w-5 h-5" />, text: 'Automatic grading & scoring' },
        { icon: <Award className="w-5 h-5" />, text: 'Leaderboards & certificates' },
        { icon: <Award className="w-5 h-5" />, text: 'Time limits & shuffling' }
      ]
    },
    {
      title: 'Powerful Analytics',
      subtitle: 'Turn data into action',
      description: 'Get instant insights with beautiful charts, export reports, and track response rates in real-time. Make informed decisions backed by data.',
      icon: <TrendingUp className="w-16 h-16" />,
      features: [
        { icon: <BarChart3 className="w-5 h-5" />, text: 'Real-time response tracking' },
        { icon: <BarChart3 className="w-5 h-5" />, text: 'Visual analytics dashboard' },
        { icon: <BarChart3 className="w-5 h-5" />, text: 'Export to CSV, PDF, Excel' }
      ]
    },
    {
      title: 'You\'re All Set! 🚀',
      subtitle: 'Ready to create something amazing?',
      description: 'Start by creating your first survey or quiz. Need help? Our support team is here 24/7, and we have extensive documentation to guide you.',
      icon: <Users className="w-16 h-16" />,
      features: [
        { icon: <Shield className="w-5 h-5" />, text: '99.9% uptime guarantee' },
        { icon: <Shield className="w-5 h-5" />, text: '24/7 customer support' },
        { icon: <Shield className="w-5 h-5" />, text: 'GDPR & SOC 2 compliant' }
      ]
    }
  ]), [])

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGetStarted = useCallback(() => {
    setIsOpen(false);
    resetSteps()
    navigate('/dashboard')
    useAuthStore.setState(state => ({ ...state, isAuthorized: true }))
  }, [])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      ></div>

      <div 
        className="relative w-full max-w-4xl bg-[var(--color-base-200)] rounded-2xl shadow-2xl overflow-hidden"
        style={{
          maxHeight: '90vh'
        }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("/welcome-bg.webp")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
        </div>

        <button
          onClick={() => {
            setIsOpen(false)
            navigate('/')
        }}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-[var(--color-base-300)]/80 hover:bg-[var(--color-base-300)] text-[var(--color-base-content)] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-base-300)]">
          <div 
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">

            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] flex items-center justify-center text-white shadow-2xl">
                {currentStepData.icon}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-base-content)] mb-2">
                {currentStepData.title}
              </h2>
              
              <p className="text-lg text-[var(--color-primary)] font-semibold mb-4">
                {currentStepData.subtitle}
              </p>
              
              <p className="text-[var(--color-base-content)] opacity-80 leading-relaxed mb-6 max-w-2xl">
                {currentStepData.description}
              </p>

              <div className="space-y-3 mb-8">
                {currentStepData.features.map((feature, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-base-100)]/50 backdrop-blur-sm border border-[var(--color-base-300)]"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    <div className="p-1.5 rounded-lg bg-[var(--color-success)]/20 text-[var(--color-success)]">
                      {feature.icon}
                    </div>
                    <span className="text-[var(--color-base-content)] font-medium">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {!isLastStep ? (
                  <>
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                    >
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentStep(steps.length - 1)}
                      className="px-6 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] font-medium hover:bg-[var(--color-base-300)]/80 transition-all"
                    >
                      Skip Tour
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleGetStarted}
                    className="px-10 py-4 rounded-xl bg-[var(--color-primary)] text-white font-bold text-lg hover:scale-105 transition-all shadow-2xl flex items-center gap-2"
                  >
                    Get Started
                    <Sparkles className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]'
                    : 'w-2 bg-[var(--color-base-300)] hover:bg-[var(--color-base-content)]/30'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}