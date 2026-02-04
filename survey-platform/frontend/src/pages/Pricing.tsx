import { useEffect, useRef } from 'react';
import { ArrowLeft, Check, Star, TrendingUp, Shield, CircleQuestionMark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePricingStore } from '../stores/PricingStore';
import { plans } from '../utils/pricingPlans';
import { useTranslation } from '../../node_modules/react-i18next';

export default function PricingPage() {
  const { selectedPlan, setSelectedPlan, fetchSelectedPlan, cancelingPlan, cancelPlan } = usePricingStore()
  const navigate = useNavigate()
  const isFetched = useRef<boolean>(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (isFetched.current) return

    fetchSelectedPlan()

    isFetched.current = true
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-base-100)] relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-secondary)]/5 translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-[var(--color-accent)]/5"></div>
      </div>

      {cancelingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn">
            
            <div className="flex flex-col items-center gap-6 py-12 px-6">
              <h1 className="font-bold text-2xl text-[var(--color-base-content)]">
                {t('pricing.actions.cancelingPlan')}
              </h1>
              <div className="loading w-9 h-9"></div>
            </div>

            <div className="px-6 pb-6">
              <div className="flex items-center gap-2 text-sm border border-blue-200 rounded-lg p-3 font-bold">
                <CircleQuestionMark className="w-5 h-5 flex-shrink-0" />
                <p className="text-center">
                  {t('pricing.hint.refund')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="relative z-10">

        <div className="container mx-auto px-6 pt-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-base-200)] hover:bg-[var(--color-base-300)] text-[var(--color-base-content)] transition-all border border-[var(--color-base-300)] group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('pricing.back')}</span>
          </button>
        </div>

        <div className="container mx-auto px-6 pt-12 pb-8 text-center">
          <div className="inline-block p-3 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-[var(--color-base-content)] mb-4">
            {t('pricing.choosePlanTitle')}
          </h1>
          <p className="text-xl text-[var(--color-base-content)] opacity-70 max-w-2xl mx-auto">
            {t('pricing.choosePlanSubtitle')}
          </p>
        </div>

        <div className="container mx-auto px-6 pb-16 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? `${plan.borderColor} shadow-2xl`
                    : 'border-[var(--color-base-300)] hover:border-[var(--color-primary)]/30 hover:shadow-lg'
                } ${plan.popular ? 'md:scale-110 z-10' : ''}`}
                style={{
                  backgroundColor: selectedPlan === plan.id 
                    ? plan.bgColor 
                    : 'var(--color-base-200)'
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-bold shadow-lg flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    {t('pricing.mostPopular')}
                  </div>
                )}

                <div className="absolute top-4 right-4 w-20 h-20 opacity-10">
                  <img 
                    src={plan.branchImage}
                    alt={`${plan.name} branch`}
                    className="w-full h-full object-contain"
                  />
                </div>

                <h3 className="text-2xl font-bold text-[var(--color-base-content)] mb-2">
                  {plan.name}
                </h3>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-[var(--color-base-content)]">
                      ${plan.price}
                    </span>
                    <span className="text-[var(--color-base-content)] opacity-60">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-base-content)] opacity-70 mb-6 min-h-[40px]">
                  {plan.note}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 ${
                        feature.included 
                          ? 'text-[var(--color-success)]' 
                          : 'text-[var(--color-base-content)] opacity-30'
                      }`}>
                        <Check className="w-5 h-5" />
                      </div>
                      <span className={`text-sm ${
                        feature.included 
                          ? 'text-[var(--color-base-content)]' 
                          : 'text-[var(--color-base-content)] opacity-40 line-through'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={async () => {
                    if (plan.id === selectedPlan) return

                    if (plan.id === 'free') {
                      await cancelPlan()
                      return
                    }

                    await setSelectedPlan({ id: plan.id, name: plan.name, period: plan.period, price: plan.price, features: plan.features })
                    navigate('/upgrade/payment')
                  }}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    selectedPlan === plan.id
                      ? `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:shadow-xl hover:scale-105`
                      : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-primary)] hover:text-white'
                  }`}
                >
                  {selectedPlan === plan.id ? t('pricing.button.currentSelection') : t('pricing.button.choosePlan')}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-20 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--color-base-content)] text-center mb-8">
              {t('pricing.featureComparison.title')}
            </h2>
            <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-2xl p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-base-300)]">
                      <th className="text-left py-4 px-4 text-[var(--color-base-content)] font-bold">{t('pricing.featureComparison.columns.feature')}</th>
                      <th className="text-center py-4 px-4 text-[var(--color-base-content)] font-bold">{t('pricing.featureComparison.columns.free')}</th>
                      <th className="text-center py-4 px-4 text-[var(--color-base-content)] font-bold">{t('pricing.featureComparison.columns.professional')}</th>
                      <th className="text-center py-4 px-4 text-[var(--color-base-content)] font-bold">{t('pricing.featureComparison.columns.enterprise')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: t('pricing.featureComparison.rows.surveysPerMonth'), free: '5', pro: t('pricing.featureComparison.rows.unlimited'), enterprise: t('pricing.featureComparison.rows.unlimited') },
                      { feature: t('pricing.featureComparison.rows.responsesPerSurvey'), free: '50', pro: '500', enterprise: t('pricing.featureComparison.rows.unlimited') },
                      { feature: t('pricing.featureComparison.rows.advancedAnalytics'), free: false, pro: true, enterprise: true },
                      { feature: t('pricing.featureComparison.rows.customBranding'), free: false, pro: true, enterprise: true },
                      { feature: t('pricing.featureComparison.rows.teamCollaboration'), free: false, pro: false, enterprise: true },
                      { feature: t('pricing.featureComparison.rows.whiteLabel'), free: false, pro: false, enterprise: true },
                      { feature: t('pricing.featureComparison.rows.prioritySupport'), free: false, pro: true, enterprise: true },
                      { feature: t('pricing.featureComparison.rows.apiAccess'), free: false, pro: true, enterprise: true }
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-[var(--color-base-300)] last:border-0">
                        <td className="py-4 px-4 text-[var(--color-base-content)]">{row.feature}</td>
                        <td className="text-center py-4 px-4">
                          {typeof row.free === 'boolean' ? (
                            row.free ? <Check className="w-5 h-5 text-[var(--color-success)] mx-auto" /> : <span className="text-[var(--color-base-content)] opacity-30">—</span>
                          ) : (
                            <span className="text-[var(--color-base-content)]">{row.free}</span>
                          )}
                        </td>
                        <td className="text-center py-4 px-4">
                          {typeof row.pro === 'boolean' ? (
                            row.pro ? <Check className="w-5 h-5 text-[var(--color-success)] mx-auto" /> : <span className="text-[var(--color-base-content)] opacity-30">—</span>
                          ) : (
                            <span className="text-[var(--color-base-content)]">{row.pro}</span>
                          )}
                        </td>
                        <td className="text-center py-4 px-4">
                          {typeof row.enterprise === 'boolean' ? (
                            row.enterprise ? <Check className="w-5 h-5 text-[var(--color-success)] mx-auto" /> : <span className="text-[var(--color-base-content)] opacity-30">—</span>
                          ) : (
                            <span className="text-[var(--color-base-content)]">{row.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center space-y-6">
            <div className="p-8 rounded-2xl bg-[var(--color-primary)] max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">
                {t('pricing.faq.title')}
              </h3>
              <p className="text-white/90 mb-6 text-lg">
                {t('pricing.faq.subtitle')}
              </p>
              <button onClick={() => navigate('/contact-us')} className="px-8 py-3 rounded-xl bg-white text-[var(--color-primary)] font-bold hover:opacity-80 transition-all shadow-lg">
                {t('pricing.button.contactSales')}
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 flex-wrap text-sm text-[var(--color-base-content)] opacity-70">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-success)]" />
                <span>{t('pricing.guarantees.moneyBack')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-success)]" />
                <span>{t('pricing.guarantees.cancelAnytime')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-success)]" />
                <span>{t('pricing.guarantees.securePayments')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--color-success)]" />
                <span>{t('pricing.guarantees.gdprCompliant')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}