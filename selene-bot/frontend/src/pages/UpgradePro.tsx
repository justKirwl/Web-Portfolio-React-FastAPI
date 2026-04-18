import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { InfoIcon, SelectChevronDown, UpgradeCheckMark } from "../components/Icons";
import { useUpgradeProActions, useUpgradeProCardData, useUpgradeProErrors, useUpgradeProInfo, useUpgradeProTouched } from "../stores/UpgradeProStore";
import useUpgradeProFunctions from "../utils/upgradeProFunctions";
import { useTranslation } from "../../node_modules/react-i18next";

export default function UpgradePro() {
  const formData = useUpgradeProCardData()
  const errors = useUpgradeProErrors()
  const touched = useUpgradeProTouched()

  const { currentPricing, handleFieldBlur, handleFieldChange, handlePurchase, formatCardNumber, formatExpiryDate, formatZipCode, annualTotal, pricing } = useUpgradeProFunctions()

  const { isProcessing, billingCycle } = useUpgradeProInfo()
  const { setBillingCycle } = useUpgradeProActions()

  const navigate = useNavigate();

  const [params] = useSearchParams()

  const { t } = useTranslation()

  const theme = localStorage.getItem('theme') || 'dark'

  const selectCountryRef = useRef<HTMLSelectElement>(null);

  const includedInPro = t('upgradePro.features', { returnObjects: true }) as string[]

  useEffect(() => {
    if (params.get('yearly') && params.get('yearly') === 'true') {
      setBillingCycle('yearly')

      return;
    }

    setBillingCycle('monthly')
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "var(--color-base-100)",
        color: "var(--color-base-text)",
      }}
    >
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 p-2 rounded-lg transition-all inline-flex items-center gap-2 text-sm"
          style={{ color: "var(--color-base-text)", opacity: 0.7 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.background = "var(--color-base-400)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.7";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1
              className="merriweather text-3xl font-semibold mb-2"
              style={{ color: "var(--color-base-content)" }}
            >
              {t('upgradePro.title')}
            </h1>
            <p
              className="inter text-sm mb-8"
              style={{ color: "var(--color-base-text)" }}
            >
              {t('upgradePro.description')}
            </p>

            <div className="mb-8">
              <p
                className="inter text-sm font-medium mb-3"
                style={{ color: "var(--color-base-text)" }}
              >
                {t('upgradePro.selectBillingCycle')}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className="inter w-full p-4 rounded-xl text-left transition-all"
                  style={{
                    background: billingCycle === "monthly" ? "var(--color-base-200)" : "var(--color-base-300)",
                    border: `2px solid ${billingCycle === "monthly" ? "var(--color-outline)" : "var(--color-outline-2)"}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: billingCycle === "monthly" ? "var(--color-outline)" : "var(--color-outline-2)",
                        }}
                      >
                        {billingCycle === "monthly" && (
                          <div
                            className="w-3 h-3 rounded-full"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "var(--color-base-content)" }}>
                          {t('upgradePro.monthly')}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-base-text)", opacity: 0.5 }}>
                          <span className="raleway">$</span>{t('upgradePro.monthlySubtext', { price: pricing.monthly.priceWithTax })}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setBillingCycle("yearly")}
                  className="inter w-full p-4 rounded-xl text-left transition-all relative overflow-hidden"
                  style={{
                    background: billingCycle === "yearly" ? "var(--color-base-200)" : "var(--color-base-300)",
                    border: `2px solid ${billingCycle === "yearly" ? "var(--color-outline)" : "var(--color-outline-2)"}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: billingCycle === "yearly" ? "var(--color-outline)" : "var(--color-outline-2)",
                        }}
                      >
                        {billingCycle === "yearly" && (
                          <div
                            className="w-3 h-3 rounded-full"
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium" style={{ color: "var(--color-base-content)" }}>
                            {t('upgradePro.yearly')}
                          </p>
                          <div
                            className="text-xs px-2 py-0.5 bg-[var(--color-outline)]/20 rounded-full font-semibold"
                            style={{
                              color: "var(--color-outline)"
                            }}
                          >
                            {t('upgradePro.yearlySave')}
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: "var(--color-base-text)", opacity: 0.5 }}>
                          <span className="raleway">$</span>{t('upgradePro.yearlySubtext', { price: pricing.yearly.priceWithTax })}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                background: "var(--color-base-200)",
                border: "1px solid var(--color-base-300)",
              }}
            >
              <p
                className="inter text-sm font-semibold mb-4"
                style={{ color: "var(--color-base-content)" }}
              >
                {t('upgradePro.includedTitle')}
              </p>
              <ul className="space-y-3">
                {includedInPro.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm"
                    style={{ color: "var(--color-base-text)", opacity: 0.8 }}
                  >
                    <UpgradeCheckMark />
                    <span className="inter">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div
              className="p-6 rounded-xl mb-6"
              style={{
                background: "var(--color-base-200)",
                border: "1px solid var(--color-base-300)",
              }}
            >
              <h2
                className="inter text-lg font-semibold mb-4"
                style={{ color: "var(--color-base-content)" }}
              >
                {t('upgradePro.orderSummary')}
              </h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b" style={{ borderColor: "var(--color-base-300)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-base-text)", opacity: 0.7 }}>
                    {t('upgradePro.proPlan', { billingCycle: billingCycle })}
                  </span>
                  <span style={{ color: "var(--color-base-text)" }}>
                    <span className="raleway">$</span>{t('upgradePro.monthlySubtext', { price: currentPricing.price })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-base-text)", opacity: 0.7 }}>
                    {t('upgradePro.tax')}
                  </span>
                  <span style={{ color: "var(--color-base-text)" }}>
                    <span className="raleway">$</span>{(currentPricing.priceWithTax - currentPricing.price).toFixed(2)}
                  </span>
                </div>
                {billingCycle === "yearly" && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--color-primary)" }}>
                      {t('upgradePro.annualDiscount')}
                    </span>
                    <span style={{ color: "var(--color-primary)" }}>
                      -<span className="raleway">$</span>{((20 - 17) * 12).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline mb-2">
                <span className="text-lg font-semibold" style={{ color: "var(--color-base-text)" }}>
                  {billingCycle === "monthly" ? t('upgradePro.monthlyTotal') : t('upgradePro.dueToday')}
                </span>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: "var(--color-base-text)" }}>
                    <span className="raleway">$</span>{billingCycle === "yearly" ? (annualTotal || 0).toFixed(2) : currentPricing.priceWithTax}
                  </p>
                  {billingCycle === "yearly" && (
                    <p className="text-xs" style={{ color: "var(--color-base-text)", opacity: 0.5 }}>
                      {t('upgradePro.billedAnnually')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
            className="inter p-6 rounded-xl mb-6"
            style={{
              background: "var(--color-base-200)",
              border: "1px solid var(--color-base-300)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--color-base-content)" }}
            >
              {t('upgradePro.paymentMethod')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-base-content)" }}>
                  {t('upgradePro.fullName')}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                  placeholder={t('upgradePro.fullNamePlaceholder')}
                  className={`w-full px-4 py-3 rounded-lg outline-none text-sm transition-all duration-200 focus:shadow-xs focus:shadow-blue-300`}
                  style={{
                    background: "var(--color-base-300)",
                    border: `1px solid ${
                      touched.fullName && errors.fullName ? "var(--color-base-red)" : "var(--color-outline-2)"
                    }`,
                    color: "var(--color-base-content)",
                  }}
                  onFocus={(e) => {
                    if (!errors.fullName) {
                      e.currentTarget.style.borderColor = "var(--color-outline)";
                    }
                  }}
                  onBlur={(e) => {
                    handleFieldBlur("fullName");
                    if (!errors.fullName) {
                      e.currentTarget.style.borderColor = "var(--color-outline-2)";
                    }
                  }}
                />
                {touched.fullName && errors.fullName && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                    <InfoIcon className="shrink-0 w-3.5 h-3.5"/>
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-base-content)" }}>
                  {t('upgradePro.emailAddress')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder={t('upgradePro.emailPlaceholder')}
                  className={`w-full px-4 py-3 rounded-lg outline-none text-sm transition-all duration-200 focus:shadow-xs focus:shadow-blue-300`}
                  style={{
                    background: "var(--color-base-300)",
                    border: `1px solid ${
                      touched.email && errors.email ? "var(--color-base-red)" : "var(--color-outline-2)"
                    }`,
                    color: "var(--color-base-content)",
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.currentTarget.style.borderColor = "var(--color-outline)";
                    }
                  }}
                  onBlur={(e) => {
                    handleFieldBlur("email");
                    if (!errors.email) {
                      e.currentTarget.style.borderColor = "var(--color-outline-2)";
                    }
                  }}
                />
                {touched.email && errors.email && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                    <InfoIcon className="shrink-0 w-3.5 h-3.5"/>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-base-content)" }}>
                  {t('upgradePro.cardNumber')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      handleFieldChange("cardNumber", formatted);
                    }}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-4 py-3 rounded-lg outline-none text-sm transition-all duration-200 focus:shadow-xs focus:shadow-blue-300`}
                    style={{
                      background: "var(--color-base-300)",
                      border: `1px solid ${
                        touched.cardNumber && errors.cardNumber ? "var(--color-base-red)" : "var(--color-outline-2)"
                      }`,
                      color: "var(--color-base-content)",
                    }}
                    onFocus={(e) => {
                      if (!errors.cardNumber) {
                        e.currentTarget.style.borderColor = "var(--color-outline)";
                      }
                    }}
                    onBlur={(e) => {
                      handleFieldBlur("cardNumber");
                      if (!errors.cardNumber) {
                        e.currentTarget.style.borderColor = "var(--color-outline-2)";
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                      <rect width="32" height="20" rx="3" fill="var(--color-base-400)" opacity="0.2"/>
                      <circle cx="12" cy="10" r="5" fill="var(--color-error)" opacity="0.7"/>
                      <circle cx="20" cy="10" r="5" fill="var(--color-warning)" opacity="0.7"/>
                    </svg>
                  </div>
                </div>
                {touched.cardNumber && errors.cardNumber && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                    <InfoIcon className="shrink-0 w-3.5 h-3.5"/>
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-base-content)" }}>
                    {t('upgradePro.expiryDate')}
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      handleFieldChange("expiryDate", formatted);
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full px-4 py-3 rounded-lg outline-none text-sm transition-all duration-200 focus:shadow-xs focus:shadow-blue-300`}
                    style={{
                      background: "var(--color-base-300)",
                      border: `1px solid ${
                        touched.expiryDate && errors.expiryDate ? "var(--color-base-red)" : "var(--color-outline-2)"
                      }`,
                      color: "var(--color-base-content)",
                    }}
                    onFocus={(e) => {
                      if (!errors.expiryDate) {
                        e.currentTarget.style.borderColor = "var(--color-outline)";
                      }
                    }}
                    onBlur={(e) => {
                      handleFieldBlur("expiryDate");
                      if (!errors.expiryDate) {
                        e.currentTarget.style.borderColor = "var(--color-outline-2)";
                      }
                    }}
                  />
                  {touched.expiryDate && errors.expiryDate && (
                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                      <InfoIcon className="shrink-0 w-3.5 h-3.5"/>
                      {errors.expiryDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-base-content)" }}>
                    CVC
                  </label>
                  <input
                    type="text"
                    value={formData.cvc}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                      handleFieldChange("cvc", value);
                    }}
                    placeholder="123"
                    maxLength={4}
                    className={`w-full px-4 py-3 rounded-lg outline-none text-sm transition-all duration-200 focus:shadow-xs focus:shadow-blue-300`}
                    style={{
                      background: "var(--color-base-300)",
                      border: `1px solid ${
                        touched.cvc && errors.cvc ? "var(--color-base-red)" : "var(--color-outline-2)"
                      }`,
                      color: "var(--color-base-content)",
                    }}
                    onFocus={(e) => {
                      if (!errors.cvc) {
                        e.currentTarget.style.borderColor = "var(--color-outline)";
                      }
                    }}
                    onBlur={(e) => {
                      handleFieldBlur("cvc");
                      if (!errors.cvc) {
                        e.currentTarget.style.borderColor = "var(--color-outline-2)";
                      }
                    }}
                  />
                  {touched.cvc && errors.cvc && (
                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                      <InfoIcon className="shrink-0 w-3.5 h-3.5"/>
                      {errors.cvc}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-base-content)" }}>
                    {t('upgradePro.country')}
                  </label>
                  <div className="relative">
                    <select
                      ref={selectCountryRef}
                      value={formData.country}
                      onChange={(e) => handleFieldChange("country", e.target.value)}
                      className={`w-full cursor-pointer px-4 py-3 rounded-lg outline-none text-sm transition-all duration-200 focus:shadow-xs focus:shadow-blue-300`}
                      style={{
                        background: "var(--color-base-300)",
                        border: "1px solid var(--color-outline-2)",
                        color: "var(--color-base-content)",
                      }}
                      onFocus={(e) => {
                        if (!errors.country) {
                          e.currentTarget.style.borderColor = "var(--color-outline)";
                        }
                      }}
                      onBlur={(e) => {
                        handleFieldBlur("country");
                        if (!errors.country) {
                          e.currentTarget.style.borderColor = "var(--color-outline-2)";
                        }
                      }}
                    >
                      <option value="US">{t('upgradePro.countries.US')}</option>
                      <option value="UK">{t('upgradePro.countries.UK')}</option>
                      <option value="CA">{t('upgradePro.countries.CA')}</option>
                      <option value="AU">{t('upgradePro.countries.AU')}</option>
                      <option value="DE">{t('upgradePro.countries.DE')}</option>
                      <option value="FR">{t('upgradePro.countries.FR')}</option>
                      <option value="Other">{t('upgradePro.countries.other')}</option>
                    </select>
                    <div className="absolute right-3 top-4 cursor-pointer" onClick={() => {selectCountryRef.current?.focus(); selectCountryRef.current?.showPicker()}}>
                      <SelectChevronDown />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-base-content)" }}>
                    {t('upgradePro.zipCode')}
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => {
                      const formatted = formatZipCode(e.target.value);
                      handleFieldChange("zipCode", formatted);
                    }}
                    placeholder="12345"
                    className={`w-full px-4 py-3 rounded-lg outline-none text-sm transition-all duration-200 focus:shadow-xs focus:shadow-blue-300`}
                    style={{
                      background: "var(--color-base-300)",
                      border: `1px solid ${
                        touched.zipCode && errors.zipCode ? "var(--color-base-red)" : "var(--color-outline-2)"
                      }`,
                      color: "var(--color-base-content)",
                    }}
                    onFocus={(e) => {
                      if (!errors.zipCode) {
                        e.currentTarget.style.borderColor = "var(--color-outline)";
                      }
                    }}
                    onBlur={(e) => {
                      handleFieldBlur("zipCode");
                      if (!errors.zipCode) {
                        e.currentTarget.style.borderColor = "var(--color-outline-2)";
                      }
                    }}
                  />
                  {touched.zipCode && errors.zipCode && (
                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                      <InfoIcon className="shrink-0 w-3.5 h-3.5"/>
                      {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>

              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{
                  background: "var(--color-base-300)",
                  border: "1px solid var(--color-base-400)",
                }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  className="shrink-0 mt-0.5" 
                  style={{ opacity: 0.6 }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-base-content)", opacity: 0.7 }}>
                  {t('upgradePro.secureNote')}
                </p>
              </div>

              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="inter w-full py-2 rounded-lg transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                style={{
                  background: theme === 'light' ? 'var(--color-base-content)' : "var(--color-primary-content)",
                  color: "var(--color-base-400)",
                  fontWeight: 500,
                }}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    {t('upgradePro.processing')}
                  </span>
                ) : (
                  <span>{t('upgradePro.purchaseTitle')}<span className="raleway">$</span>{billingCycle === "yearly" ? (annualTotal || 0).toFixed(2) : currentPricing.priceWithTax.toFixed(2)}</span>
                )}
              </button>

              <p
                className="text-xs text-center leading-relaxed"
                style={{ color: "var(--color-base-text)", opacity: theme === 'light' ? 0.8 : 0.5 }}
              >
                {t('upgradePro.byPurchase')}{" "}
                <span className="inline underline underline-offset-[3px]
                          [&:not(:is(:hover,:focus))]:decoration-[color-mix(in_srgb,currentColor,transparent_60%)] 
                          cursor-pointer">{t('upgradePro.terms')}</span>
                {" "}{t('upgradePro.and')}{" "}
                <span className="inline underline underline-offset-[3px]
                          [&:not(:is(:hover,:focus))]:decoration-[color-mix(in_srgb,currentColor,transparent_60%)] 
                          cursor-pointer">{t('upgradePro.privacy')}</span>.
                {billingCycle === "yearly" && t('upgradePro.renewAnnually')}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}