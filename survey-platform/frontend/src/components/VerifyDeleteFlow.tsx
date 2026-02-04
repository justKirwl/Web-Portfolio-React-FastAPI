import { useState, useEffect, useRef } from 'react';
import { Mail, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { useVerifyFlowStore } from '../stores/VerifyDeleteFlow';
import { useSettingStore } from '../stores/SettingStore';
import { useDeleteStore } from '../stores/DeleteModalStore';
import { useTranslation } from '../../node_modules/react-i18next';

export default function VerifyDeleteFlow() {
  const { step, countdown, code, error, setCanResend, setCode, setCountdown, setError, setStep, isLoading, canResend, isOpen, setOpen: onClose, isResending, sendCode, initialCode } = useVerifyFlowStore()
  const { initialData } = useSettingStore()
  const { setOpen } = useDeleteStore()
  const inputRefs = useRef([]);
  const isSent = useRef<boolean>(false)
  const { t } = useTranslation()

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || step !== 1) return;

    const timer = setInterval(() => {
      if (countdown <= 1) {
          setCanResend(true);
          setCountdown(0)
          return;
        }
        
        setCountdown(countdown - 1)
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, step, countdown]);

  useEffect(() => {
    if (isSent.current) return

    sendCode(false)

    isSent.current = true
  }, [])

  const handleCodeChange = (index: number, value: string) => {
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

    if (verificationCode === initialCode) {
    setOpen(true)
    setStep(2);
    onClose(false)
    } else {
    setError(t('verifyFlow.invalidCode'));
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    
    sendCode(true)
    setCountdown(30);
    setCanResend(false);
    setCode(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const handleClose = () => {
    if (isDeleting) return;

    setStep(1);
    setCode(['', '', '', '', '', '']);
    setError('');
    setCountdown(30);
    setCanResend(false);
    setIsDeleting(false);
    onClose(false);
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
            <h2 className="text-xl font-bold text-[var(--color-base-content)]">{t('verifyFlow.title')}</h2>
            <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('verifyFlow.desc')}</p>
            </div>
        </div>
        <button onClick={handleClose} className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all">
            <X className="w-5 h-5 text-[var(--color-base-content)]" />
        </button>
        </div>

        <div className="p-6">
        <div className="bg-[var(--color-primary)] bg-opacity-10 border-l-4 border-[var(--color-base)] rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--color-base-content)] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[var(--color-base-content)]">
                <p className="font-bold mb-1">{t('verifyFlow.importantStep')}</p>
                <p className="opacity-80">
                {t('verifyFlow.beforeDeleting')} <span className="font-bold">{initialData.email}</span>
                </p>
            </div>
            </div>
        </div>

        <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-center text-[var(--color-base-content)]">
            {t('verifyFlow.enterCode')}
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
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 transition-all focus:outline-none ${
                    error ? 'border-[var(--color-error)] shake' : digit ? 'border-[var(--color-success)]' : 'border-transparent focus:border-[var(--color-primary)]'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                autoFocus={index === 0}
                />
            ))}
            </div>

            {error && (
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-error)] mb-3">
                <AlertTriangle className="w-4 h-4" />
                {error}
            </div>
            )}
        </div>

        <div className="text-center mb-4">
            <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-2">{t('verifyFlow.notReceive')}</p>
            <button
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                canResend && !isLoading ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105' : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
            }`}
            >
            <RotateCcw className={`w-4 h-4 ${isResending && 'animate-spin'}`} />
            {!isResending ? canResend ? t('verifyFlow.resendCode') : `${t('verifyFlow.resendIn')} ${countdown}${t('verifyFlow.s')}` : t('verifyFlow.resending')}
            </button>
        </div>

        {isLoading && (
            <div className="flex items-center justify-center gap-3 text-[var(--color-primary)]">
            <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">{t('verifyFlow.verifying')}</span>
            </div>
        )}
        </div>

        <div className="px-6 py-4 bg-[var(--color-base-100)] border-t border-[var(--color-base-300)] rounded-b-2xl">
        <p className="text-xs text-center text-[var(--color-base-content)] opacity-50">🔒 {t('verifyFlow.codeExpire')}</p>
        </div>
    </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .shake { animation: shake 0.3s ease-out; }
      `}</style>
    </div>
  );
}