import { ArrowLeft, Users, Target, Award, TrendingUp, CheckCircle, Sparkles, } from 'lucide-react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { additionalFeaturesIcons, mainFeaturesIcons } from '../utils/features';
import { useTranslation } from '../../node_modules/react-i18next';

export default function FeaturesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const mainFeatures = t('features.mainFeatures', { returnObjects: true }) as { title: string, description: string, benefits: string[], color: string }[]
  const additionalFeatures = t('features.additionalFeatures', { returnObjects: true }) as string[]

  return (
    <div className="min-h-screen bg-[var(--color-base-100)]">

      <nav className="sticky top-0 z-50 bg-[var(--color-base-200)]/80 backdrop-blur-lg border-b border-[var(--color-base-300)]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-base-300)] hover:bg-[var(--color-base-300)]/80 text-[var(--color-base-content)] transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('features.back')}</span>
          </button>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            {t('features.heroBadge')}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-base-content)] mb-6">
            {t('features.heroTitle')}
            <br />
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              {t('features.heroHighlight')}
            </span>
          </h1>
          
          <p className="text-xl text-[var(--color-base-content)] opacity-70 mb-8 max-w-2xl mx-auto">
            {t('features.heroDescription')}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {mainFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-2xl bg-[var(--color-base-200)] border border-[var(--color-base-300)] hover:border-[var(--color-primary)] hover:shadow-2xl transition-all duration-300"
            >
              <div className={`inline-block p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                {mainFeaturesIcons[idx]}
              </div>
              
              <h3 className="text-2xl font-bold text-[var(--color-base-content)] mb-3">
                {feature.title}
              </h3>
              
              <p className="text-[var(--color-base-content)] opacity-70 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-base-content)] opacity-80">
                    <CheckCircle className="w-4 h-4 text-[var(--color-success)] flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-base-200)] py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--color-base-content)] mb-4">
              {t('features.moreTitle')}
            </h2>
            <p className="text-lg text-[var(--color-base-content)] opacity-70 max-w-2xl mx-auto">
              {t('features.moreDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {additionalFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-base-100)] border border-[var(--color-base-300)] hover:border-[var(--color-primary)] hover:shadow-lg transition-all"
              >
                <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  {additionalFeaturesIcons[idx]}
                </div>
                <span className="text-sm font-medium text-[var(--color-base-content)]">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--color-base-content)] mb-4">
            {t('features.useCasesTitle')}
          </h2>
          <p className="text-lg text-[var(--color-base-content)] opacity-70 max-w-2xl mx-auto">
            {t('features.useCasesDescription')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: t('features.useCases.customerFeedback.title'),
              description: t('features.useCases.customerFeedback.description'),
              icon: <Users className="w-8 h-8" />,
              examples: t('features.useCases.customerFeedback.examples', { returnObjects: true }) as string[]
            },
            {
              title: t('features.useCases.employeeEngagement.title'),
              description: t('features.useCases.employeeEngagement.description'),
              icon: <TrendingUp className="w-8 h-8" />,
              examples: t('features.useCases.employeeEngagement.examples', { returnObjects: true }) as string[]
            },
            {
              title: t('features.useCases.educationTraining.title'),
              description: t('features.useCases.educationTraining.description'),
              icon: <Award className="w-8 h-8" />,
              examples: t('features.useCases.educationTraining.examples', { returnObjects: true }) as string[]
            },
            {
              title: t('features.useCases.marketResearch.title'),
              description: t('features.useCases.marketResearch.description'),
              icon: <Target className="w-8 h-8" />,
              examples: t('features.useCases.marketResearch.examples', { returnObjects: true }) as string[]
            }
          ].map((useCase, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-[var(--color-base-200)] border border-[var(--color-base-300)] hover:border-[var(--color-primary)] hover:shadow-xl transition-all"
            >
              <div className="p-3 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] inline-block mb-4">
                {useCase.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-[var(--color-base-content)] mb-3">
                {useCase.title}
              </h3>
              
              <p className="text-[var(--color-base-content)] opacity-70 mb-4">
                {useCase.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {useCase.examples.map((example, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-[var(--color-base-300)] text-[var(--color-base-content)] text-xs font-medium"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}