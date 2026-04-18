import { useNavigate } from "react-router-dom";
import useUpgradeItems from "../utils/prices";
import { UpgradeCheckMark } from "../components/Icons";
import { useTranslation } from "../../node_modules/react-i18next";

export default function UpgradePage() {
  const { billingCycle, setBillingCycle, plans } = useUpgradeItems()
  const navigate = useNavigate();

  const { t } = useTranslation()

  const language = localStorage.getItem('language') || 'en'

  const theme = localStorage.getItem('theme') || 'dark'

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--color-base-100)",
        color: "var(--color-base-content)",
      }}
    >
      <div className="px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg transition-all"
          style={{ color: "var(--color-base-text)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-base-400)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <div className="text-center pt-12 pb-8">
        <h1
          className="merriweather text-4xl font-semibold mb-8"
          style={{ color: "var(--color-base-text)" }}
        >
          {t('upgrade.title')}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`w-full min-h-full flex flex-col gap-4 items-stretch relative z-[5] transition-opacity duration-300 max-w-sm p-6 opacity-100 rounded-2xl transition-all duration-300 ease-in-out border ${theme === 'light' ? 'bg-[var(--color-base-200)]' : 'bg-[var(--color-base-300)]'} border-[var(--color-outline-2)] border-opacity-25 shadow-sm`}
            >
              <div
                className="flex items-start justify-between w-full"
                style={{ color: "var(--color-base-content)" }}
              >
                <div className="text-[var(--color-base-content)] max-w-20">
                    {plan.icon}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {plan.id === 'pro' && (
                    <div className="mt-1">
                      <div className="inter inline-flex rounded-full bg-[var(--color-base-400)] p-0.5">
                        <button onClick={() => setBillingCycle('monthly')} className={`rounded-full ${language === 'ru' ? 'px-2' : 'px-2.5'} py-1 text-xs font-medium ${billingCycle === 'monthly' && 'bg-[var(--color-base-100)]'} text-[var(--color-base-text)]`}>{t('upgrade.monthly')}</button>
                        <button onClick={() => setBillingCycle('yearly')} className={`rounded-full ${language === 'ru' ? 'px-2' : 'px-2.5'} py-1 text-xs font-medium ${billingCycle === 'yearly' && 'bg-[var(--color-base-100)]'} text-[var(--color-base-content)] ${theme !== 'light' && 'shadow-sm'}`}>
                          {t('upgrade.yearly')}
                          <span className="ml-0.5 text-[var(--color-outline)]">{t('upgrade.yearlySave')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 min-h-44">
                <div className="inter flex flex-col gap-2">
                    <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--color-base-content)" }}
                    >
                    {plan.name}
                    </h2>
                    <p
                    className="-mt-2"
                    style={{ color: "var(--color-base-text)" }}
                    >
                    {plan.description}
                    </p>

                    <div className="flex flex-col gap-0.5 mt-3">
                        <div className="-ml-0.5">
                            {plan.priceSubtext ? (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="inter text-3xl font-semibold">{plan.pricePrefix}{plan.price}<span className="raleway">$</span></span>
                                <span className="inter inline-flex shrink-0 flex-col text-[var(--color-base-text)] text-xs font-normal leading-tight">
                                  {plan.priceSubtext.map((subText, idx) => (
                                    <span key={idx}>{subText}</span>
                                  ))}
                                </span>
                              </div>
                            ) : (
                              <span className="text-3xl font-semibold inter">{plan.pricePrefix}{plan.price}<span className="raleway">$</span></span>
                            )}
                        </div>
                        <div className="text-[var(--color-base-text)] -ml-0.5 text-sm flex flex-col"></div>
                    </div>
                </div>
                <div className="flex-grow"></div>
                
                <div>
                    <button onClick={() => plan.id === 'free' ? navigate('/new') : navigate(`/upgrade/${plan.id === 'pro' ? `pro${billingCycle === 'yearly' ? '?yearly=true' : ''}` : 'max'}`)} className={`inter inline-flex items-center justify-center relative shrink-0 can-focus select-none overflow-hidden transition-all ${plan.buttonStyle === 'primary' && theme === 'light' ? 'bg-[var(--color-base-content)] text-[var(--color-base-200)]' : plan.buttonStyle === 'primary' && 'bg-[var(--color-primary-content)] text-[var(--color-base-400)]'} ${plan.buttonStyle !== "primary" && 'border border-[var(--color-outline-2)]'} duration-100 ${plan.buttonStyle !== 'primary' && 'hover:bg-[var(--color-base-400)]'} backface-hidden h-11 rounded-[0.6rem] px-5 min-w-full active:scale-[0.985] whitespace-nowrap !text-base shadow-sm hover:shadow-md ${plan.buttonStyle === 'primary' && 'hover:opacity-95'} hover:border-transparent`} style={{ fontWeight: 500 }} type="button">{plan.buttonText}</button>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 text-[var(--color-base-text)] text-sm border-t border-[var(--color-outline-2)] border-opacity-25 -mx-6 px-6 pt-6">
                <ul className="inline-flex flex-col text-left gap-1">
                  {plan.highlight && (
                    <div className="text-[var(--color-base-text)] font-medium">{plan.highlight}</div>
                  )}

                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex gap-2">
                      <UpgradeCheckMark />
                      {feature}
                    </li>
                  ))}
                </ul>  
              </div>
            </div>
          ))}
        </div>

        <p
          className="text-center text-sm mt-8"
          style={{ color: "var(--color-base-text)", opacity: theme === 'light' ? 0.7 : 0.4 }}
        >
          {t('upgrade.usageNote')}
        </p>
      </div>
    </div>
  );
}