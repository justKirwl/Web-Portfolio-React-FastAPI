import React, { useEffect, useRef } from 'react';
import { Shield, Mail, X, CheckCircle, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useSettingStore } from '../stores/SettingStore';
import { useTwoFactorStore } from '../stores/TwoFactorStore';
import { methods } from '../utils/twoFactorTypes';
import { useTranslation } from '../../node_modules/react-i18next';

export default function TwoFactorAuth() {
  const { initialData, userData } = useSettingStore()
  const { step, selectedMethod, error, code, isLoading, setCode, setError, setSelectedMethod, setStep, isOpen, setOpen: onClose, onSelect, initialCode, isConnected, isSending, connectEmail, resetTwoFactor } = useTwoFactorStore()
  const inputRefs = useRef<HTMLInputElement | null | []>([]);
  const { t } = useTranslation()

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit;
        });
        setCode(newCode);
        if (digits.length === 6) {
          handleVerify(newCode.join(''));
        }
      });
    }
  };

  const handleVerify = async (verificationCode: string) => {
    setError('');

    setTimeout(async () => {
      if (verificationCode === initialCode) {

        if (userData.twoStepVerification) {
          await resetTwoFactor()
          return
        }

        await connectEmail()
      } else {
        setError(t('twoFactor.invalidCode'));
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }, 1000);
  };

  const handleSendCode = async (method: string) => {
    await onSelect(method)
    setStep(2)
  }

  const handleBack = () => {
    setStep(1);
    setCode(['', '', '', '', '', '']);
    setError('');
  };

  const handleClose = () => {
    setStep(1);
    setSelectedMethod('');
    setCode(['', '', '', '', '', '']);
    setError('');
    onClose(false);
  };

  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        useTwoFactorStore.setState(state => ({ ...state, isConnected: false }))
        handleClose()
      }, 2300)
    }
  }, [isConnected])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray bg-opacity-60 backdrop-blur-sm">
      <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl w-full max-w-lg shadow-2xl">

        <div className="flex items-center justify-between p-6 border-b border-[var(--color-base-300)]">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all -ml-2"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--color-base-content)]" />
              </button>
            )}
            <div className="w-12 h-12 bg-[var(--color-success)] bg-opacity-10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-[var(--color-base-content)]]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-base-content)]">{t('twoFactor.title')}</h2>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">
                {step === 1 ? t('twoFactor.addExtra') : t('twoFactor.verifyIdentity')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all"
          >
            <X className="w-5 h-5 text-[var(--color-base-content)]" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-2">
                  {t('twoFactor.chooseMethod')}
                </h3>
                <p className="text-sm text-[var(--color-base-content)] opacity-70">
                  {t('twoFactor.desc')}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {methods.map((method) => {
                  if (method.id === 'reset' && !userData.twoStepVerification) return

                  return (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      disabled={!method.active}
                      className={`cursor-pointer w-full p-5 rounded-xl border-2 transition-all text-left ${
                        selectedMethod === method.id
                          ? 'border-[var(--color-primary)] bg-[var(--color-base-content)]] bg-opacity-10'
                          : method.active
                          ? 'border-[var(--color-base-300)] hover:border-[var(--color-success)] bg-[var(--color-base-100)]'
                          : 'border-[var(--color-base-300)] bg-[var(--color-base-100)] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedMethod === method.id
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-base-300)] text-[var(--color-base-content)]'
                        }`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[var(--color-base-content)] mb-1">
                            {method.name}
                          </h4>
                          <p className="text-sm text-[var(--color-base-content)] opacity-70">
                            {method.description}
                          </p>
                          {!method.active && (
                            <span className="text-xs text-[var(--color-warning)] font-medium mt-1 inline-block">
                              {t('twoFactor.comingSoon')}
                            </span>
                          )}
                        </div>
                        {selectedMethod === method.id && (
                          <CheckCircle className="w-6 h-6 text-[var(--color-base-content)]] flex-shrink-0" />
                        )}
                      </div>
                    </button>  
                  )
                })}
              </div>

              <div className="bg-[var(--color-info)] bg-opacity-10 border-l-4 border-[var(--color-info)] rounded p-4 mb-6">
                <p className="text-sm text-[var(--color-base-content)] opacity-80">
                  💡 {t('twoFactor.tip')}
                </p>
              </div>

              <button
                onClick={() => handleSendCode(selectedMethod)}
                disabled={!selectedMethod || isSending}
                className={`cursor-pointer w-full px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  !selectedMethod || isSending
                    ? 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
                    : 'bg-[var(--color-success)] text-[var(--color-success-content)] hover:scale-105'
                }`}
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('twoFactor.sending')}
                  </>
                ) : (
                  <>
                    {t('twoFactor.continue')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="bg-[var(--color-success)] bg-opacity-10 border-l-4 border-[var(--color-success)] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[var(--color-base-content)]">
                    <p className="font-bold mb-1">{t('twoFactor.sent')}</p>
                    <p className="opacity-80">
                      {t('twoFactor.sentTo')} <span className="font-bold">{initialData.email}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-center text-[var(--color-base-content)]">
                  {t('twoFactor.enterCode')}
                </label>
                <div className="flex gap-2 justify-center mb-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading}
                      className={`w-12 h-14 text-center text-2xl font-bold rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 transition-all focus:outline-none ${
                        error
                          ? 'border-[var(--color-error)]'
                          : digit
                          ? 'border-[var(--color-success)]'
                          : 'border-transparent focus:border-[var(--color-success)]'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-[var(--color-error)] text-center mb-3">
                    {error}
                  </p>
                )}

                <p className="text-xs text-center text-[var(--color-base-content)] opacity-50">
                  {t('twoFactor.checkFolder')}
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center gap-3 text-[var(--color-success)] mb-4">
                  <div className="w-5 h-5 border-2 border-[var(--color-success)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">{t('twoFactor.verifying')}</span>
                </div>
              ) : isConnected && (
                <div className="flex items-center justify-center gap-3 text-[var(--color-success)] mb-4">
                  <Check className='w-5 h-5'/>
                  <span className="font-medium">{t('twoFactor.verified')}</span>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-2">
                  {t('twoFactor.notReceive')}
                </p>
                <button
                  onClick={() => handleSendCode(selectedMethod)}
                  className="cursor-pointer text-[var(--color-success)] font-medium hover:underline"
                >
                  {isSending ? <Check className='w-5 h-5'/> : t('twoFactor.resendCode')}
                </button>
              </div>
            </>
          )}
        </div>

        {step === 1 && (
          <div className="px-6 py-4 bg-[var(--color-base-100)] border-t border-[var(--color-base-300)] rounded-b-2xl">
            <p className="text-xs text-center text-[var(--color-base-content)] opacity-50">
              🔒 {t('twoFactor.emailHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}