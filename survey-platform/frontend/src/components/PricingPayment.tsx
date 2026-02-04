import { ArrowLeft, CreditCard, Lock, Shield, Check, AlertCircle, Calendar, User, Mail, MapPin, Info, Zap, Star, Trophy } from 'lucide-react';
import { usePricingPaymentStore } from '../stores/PricingPaymentStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';

export default function PricingPayment() {
  const { cardData, setCardData, errors, setErrors, selectedPlan, showSuccess, isProcessing, handleSubmit, resetCardData } = usePricingPaymentStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const countries = t('checkout.billing.country.options', { returnObjects: true }) as string[]

  useEffect(() => {
    if (showSuccess) setTimeout(() => {
        navigate('/dashboard')
        resetCardData()
    }, 2500)
  }, [showSuccess])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/[^0-9]/gi, '').slice(0, 4);
    }

    setCardData(name, formattedValue);
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  if (!selectedPlan) {
    window.history.back()
    return
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[var(--color-base-100)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--color-base-200)] rounded-3xl p-8 text-center border-2 border-[var(--color-success)] shadow-2xl">
          <div className="w-20 h-20 bg-[var(--color-success)] rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--color-base-content)] mb-3">{t('checkout.success.title')}</h2>
          <p className="text-[var(--color-base-content)] opacity-70 mb-6">
            {t('checkout.success.welcome', { plan: selectedPlan.name })}
          </p>
          <div className="bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-[var(--color-base-content)]">
              {t('checkout.success.info', { email: cardData.email })}
            </p>
          </div>
          <p className="text-sm text-[var(--color-base-content)] opacity-60">
            {t('checkout.success.redirect')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-base-100)] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[var(--color-primary)]/5 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-secondary)]/5 translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 pt-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-base-200)] hover:bg-[var(--color-base-300)] text-[var(--color-base-content)] transition-all border border-[var(--color-base-300)] group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('checkout.back')}</span>
          </button>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block p-3 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-[var(--color-base-content)] mb-3">
                {t('checkout.header.title')}
              </h1>
              <p className="text-[var(--color-base-content)] opacity-70">
                {t('checkout.header.subtitle')}
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 mb-12 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-[var(--color-base-content)] opacity-70">
                <Shield className="w-5 h-5 text-[var(--color-success)]" />
                <span>{t('checkout.badges.ssl')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-base-content)] opacity-70">
                <Check className="w-5 h-5 text-[var(--color-success)]" />
                <span>{t('checkout.badges.pci')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-base-content)] opacity-70">
                <Lock className="w-5 h-5 text-[var(--color-success)]" />
                <span>{t('checkout.badges.secure')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-[var(--color-base-200)] rounded-2xl p-8 border border-[var(--color-base-300)] shadow-xl">
                  <h2 className="text-2xl font-bold text-[var(--color-base-content)] mb-6 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[var(--color-primary)]" />
                    {t('checkout.paymentDetails.title')}
                  </h2>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                      {t('checkout.paymentDetails.cardNumber')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-4 py-3 pl-12 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 ${
                          errors.cardNumber ? 'border-red-500' : 'border-[var(--color-base-300)]'
                        } focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                    </div>
                    {errors.cardNumber && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                      {t('checkout.paymentDetails.cardHolder')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardHolder"
                        value={cardData.cardHolder}
                        onChange={handleInputChange}
                        placeholder={t('checkout.paymentDetails.cardHolderPlaceholder')}
                        className={`w-full px-4 py-3 pl-12 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 ${
                          errors.cardHolder ? 'border-red-500' : 'border-[var(--color-base-300)]'
                        } focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                    </div>
                    {errors.cardHolder && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.cardHolder}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                        {t('checkout.paymentDetails.expiryDate')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="expiryDate"
                          value={cardData.expiryDate}
                          onChange={handleInputChange}
                          placeholder={t('checkout.paymentDetails.expiryDatePlaceholder')}
                          maxLength={5}
                          className={`w-full px-4 py-3 pl-12 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 ${
                            errors.expiryDate ? 'border-red-500' : 'border-[var(--color-base-300)]'
                          } focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                      </div>
                      {errors.expiryDate && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)] flex items-center gap-1">
                        {t('checkout.paymentDetails.cvv.label')}
                        <div className="group relative">
                          <Info className="w-4 h-4 text-[var(--color-base-content)] opacity-40 cursor-help" />
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap">
                            {t('checkout.paymentDetails.cvv.tooltip')}
                          </div>
                        </div>
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full px-4 py-3 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 ${
                          errors.cvv ? 'border-red-500' : 'border-[var(--color-base-300)]'
                        } focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                      />
                      {errors.cvv && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[var(--color-base-300)] pt-6 mb-6">
                    <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4">
                      {t('checkout.billing.title')}
                    </h3>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                        {t('checkout.billing.email.label')}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={cardData.email}
                          onChange={handleInputChange}
                          placeholder={t('checkout.billing.email.placeholder')}
                          className={`w-full px-4 py-3 pl-12 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 ${
                            errors.email ? 'border-red-500' : 'border-[var(--color-base-300)]'
                          } focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                          {t('checkout.billing.country.label')}
                        </label>
                        <div className="relative">
                          <select
                            name="country"
                            value={cardData.country}
                            onChange={(e) => setCardData('country', e.target.value)}
                            className="w-full px-4 py-3 pl-12 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors appearance-none"
                          >
                            {countries.map((country, idx) => (
                              <option key={idx}>{country}</option>
                            ))}
                          </select>
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                          {t('checkout.billing.zipCode.label')}
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={cardData.zipCode}
                          onChange={handleInputChange}
                          placeholder="12345"
                          className={`w-full px-4 py-3 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 ${
                            errors.zipCode ? 'border-red-500' : 'border-[var(--color-base-300)]'
                          } focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                        />
                        {errors.zipCode && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.zipCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('checkout.submit.processing')}
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        {t('checkout.submit.pay', { price: selectedPlan.price })}
                      </>
                    )}
                  </button>

                  <p className="text-xs text-[var(--color-base-content)] opacity-60 text-center mt-4">
                    {t('checkout.agreement')}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-[var(--color-base-200)] rounded-2xl p-6 border border-[var(--color-base-300)] shadow-xl sticky top-6">
                  <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-4">{t('checkout.orderSummary.title')}</h3>

                  <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-xl p-4 mb-4 border border-[var(--color-primary)]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                      <h4 className="font-bold text-[var(--color-base-content)]">{t('checkout.orderSummary.plan', { plan: selectedPlan.name })}</h4>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                      ${selectedPlan.price}
                      <span className="text-sm font-normal text-[var(--color-base-content)] opacity-60"> /{selectedPlan.period}</span>
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    {selectedPlan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--color-base-content)] opacity-80">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[var(--color-base-300)] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-base-content)] opacity-70">{t('checkout.orderSummary.subtotal')}</span>
                      <span className="font-semibold text-[var(--color-base-content)]">${selectedPlan.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-base-content)] opacity-70">{t('checkout.orderSummary.tax')}</span>
                      <span className="font-semibold text-[var(--color-base-content)]">$0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--color-base-300)]">
                      <span className="text-[var(--color-base-content)]">{t('checkout.orderSummary.total')}</span>
                      <span className="text-[var(--color-primary)]">${selectedPlan.price}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
                    <div className="flex items-start gap-2">
                      <Trophy className="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[var(--color-base-content)] mb-1">
                          {t('checkout.orderSummary.guarantee.title')}
                        </p>
                        <p className="text-xs text-[var(--color-base-content)] opacity-70">
                          {t('checkout.orderSummary.guarantee.description')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-[var(--color-base-100)]">
                    <div className="flex items-start gap-2">
                      <Zap className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[var(--color-base-content)] mb-1">
                          {t('checkout.orderSummary.instantAccess.title')}
                        </p>
                        <p className="text-xs text-[var(--color-base-content)] opacity-70">
                          {t('checkout.orderSummary.instantAccess.description')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[var(--color-base-200)] rounded-xl p-6 border border-[var(--color-base-300)] text-center">
                <Shield className="w-10 h-10 text-[var(--color-success)] mx-auto mb-3" />
                <h4 className="font-bold text-[var(--color-base-content)] mb-2">{t('checkout.highlights.securePayment.title')}</h4>
                <p className="text-sm text-[var(--color-base-content)] opacity-70">
                  {t('checkout.highlights.securePayment.description')}
                </p>
              </div>
              <div className="bg-[var(--color-base-200)] rounded-xl p-6 border border-[var(--color-base-300)] text-center">
                <Check className="w-10 h-10 text-[var(--color-success)] mx-auto mb-3" />
                <h4 className="font-bold text-[var(--color-base-content)] mb-2">{t('checkout.highlights.noHiddenFees.title')}</h4>
                <p className="text-sm text-[var(--color-base-content)] opacity-70">
                  {t('checkout.highlights.noHiddenFees.description')}
                </p>
              </div>
              <div className="bg-[var(--color-base-200)] rounded-xl p-6 border border-[var(--color-base-300)] text-center">
                <Trophy className="w-10 h-10 text-[var(--color-success)] mx-auto mb-3" />
                <h4 className="font-bold text-[var(--color-base-content)] mb-2">{t('checkout.highlights.support.title')}</h4>
                <p className="text-sm text-[var(--color-base-content)] opacity-70">
                  {t('checkout.highlights.support.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}