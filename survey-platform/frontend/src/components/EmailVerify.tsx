import { useEffect, useRef } from 'react';
import { Mail, X, AlertCircle, RotateCcw, Check, LoaderCircle } from 'lucide-react';
import { useEmailVerifyStore } from '../stores/EmailVerifyStore';
import { useSettingStore } from '../stores/SettingStore';
import { useTranslation } from '../../node_modules/react-i18next';

export default function VerifyEmail({ email = 'user@example.com' }) {
  const { code, setCode, canResend, countDown: countdown, setError, setCountdown, setCanResend, setOpen: onClose, isOpen, isLoading, error, sendCode, isResend, setResend, initialCode, isResending, setInitialCode } = useEmailVerifyStore()
  const { changeEmail, setInitialData, userData } = useSettingStore()
  const inputRefs = useRef<never[]>([]);
  const isSent = useRef<boolean>(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      if (countdown <= 1) {
        setCanResend(true)
        setCountdown(0)
        return
      }

      setCountdown(countdown - 1)
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  useEffect(() => {
    if (isSent.current) return

    sendCode()

    isSent.current = true
  }, [])

  useEffect(() => {
    if (isResend) {
      setTimeout(() => {
        setResend(false)
      }, 2000)
    }
  }, [isResend])

  const handleChange = (index: number, value: string) => {

    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {

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

    if (verificationCode === initialCode) {
      await changeEmail()
      setInitialData('email', userData.email)
      handleClose();
    } else {
      setError(t('emailVerify.invalidCode'));
      setCode(['', '', '', '', '', '']);
      setInitialCode(null);
      inputRefs.current[0]?.focus();
    };
  };

  const handleResend = async () => {
    if (!canResend) return;

    await sendCode()
    setResend(true)
    setCountdown(30);
    setCanResend(false);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    
  };

  const handleClose = () => {
    setCode(['', '', '', '', '', '']);
    setCountdown(30);
    setCanResend(false);
    onClose(false);
    setInitialCode(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">

        <div className="flex items-center justify-between p-6 border-b border-[var(--color-base-300)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-primary)] bg-opacity-10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-[var(--color-base-content)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-base-content)]">{t('emailVerify.title')}</h2>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('emailVerify.desc')}</p>
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

          <div className="bg-[var(--color-info)] bg-opacity-10 border-l-4 border-[var(--color-info)] rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[var(--color-info)] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[var(--color-base-content)]">
                <p className="font-bold mb-1">{t('emailVerify.inbox')}</p>
                <p className="opacity-80">
                  {t('emailVerify.sentVerificationTo')} <span className="font-bold">{email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-center text-[var(--color-base-content)]">
              {t('emailVerify.enterCode')}
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
                      ? 'border-[var(--color-error)] shake'
                      : digit
                      ? 'border-[var(--color-success)]'
                      : 'border-transparent focus:border-[var(--color-primary)]'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-error)] mb-3">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <p className="text-xs text-center text-[var(--color-base-content)] opacity-50">
              💡 {t('emailVerify.tip')}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-2">
              {t('emailVerify.notReceive')}
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend || isLoading || isResending || isResend}
              className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                canResend && !isLoading
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105'
                  : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
              }`}
            >
              {!isResend && !isResending && <RotateCcw className="w-4 h-4" />}
              {isResend ? (<><Check className='w-4 h-4'/> {t('emailVerify.resent')}</>) : isResending ? (<><LoaderCircle className='w-4 h-4 animate-spin'/> {t('emailVerify.resending')}</>) : canResend ? t('emailVerify.resend') : `${t('emailVerify.resendIn')} ${countdown}s`}
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 flex items-center justify-center gap-3 text-[var(--color-primary)]">
              <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">{t('emailVerify.verifying')}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[var(--color-base-100)] border-t border-[var(--color-base-300)] rounded-b-2xl">
          <p className="text-xs text-center text-[var(--color-base-content)] opacity-50">
            🔒 {t('emailVerify.codeWillExpire')}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}