import { Shield, Eye, EyeOff, X, Lock, AlertTriangle, Check } from 'lucide-react';
import { useConfirmPasswordStore } from '../stores/ConfirmPasswordStore';
import { useEffect } from 'react';
import { useEmailVerifyStore } from '../stores/EmailVerifyStore';
import { useTranslation } from '../../node_modules/react-i18next';

export default function ConfirmPassword() {
  const { setOpen: onClose, setAction, error, setError, password, showPassword, setPassword, setShowPassword, isLoading, isConfirmed, emailChanged, verifyPassword } = useConfirmPasswordStore()
  const { setOpen } = useEmailVerifyStore()
  const { i18n, t } = useTranslation()

  const handleClose = () => {
    setPassword('');
    setError('');
    setShowPassword(false);
    setAction('')
    onClose(false);
  };

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        useConfirmPasswordStore.setState(state => ({ ...state, isConfirmed: false }))
        handleClose()
        
        if (emailChanged) {
          setOpen(true)
        }
      }, 2000)
    }
  }, [isConfirmed])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">

        <div className="flex items-center justify-between p-6 border-b border-[var(--color-base-300)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-primary)] bg-opacity-10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-[var(--color-base-content)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-base-content)]">{t('confirmPassword.title')}</h2>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('confirmPassword.desc')}</p>
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

          <div className="bg-[var(--color-primary)] bg-opacity-10 border-l-4 border-[var(--color-primary-content)] rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--color-base-content)] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[var(--color-base-content)]">
                <p className="font-bold mb-1">{t('confirmPassword.security')}</p>
                <p className="opacity-80">{t('confirmPassword.enterPassword')}.</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
              {t('confirmPassword.currentPassword')} <span className="text-[var(--color-error)]">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder={t('confirmPassword.passwordPlaceholder')}
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && verifyPassword(i18n)}
                className={`w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 transition-all focus:outline-none ${
                  error 
                    ? 'border-[var(--color-error)]' 
                    : 'border-transparent focus:border-[var(--color-primary)]'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                autoFocus
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-[var(--color-base-content)] opacity-50 hover:opacity-100 transition-opacity" />
                ) : (
                  <Eye className="w-5 h-5 text-[var(--color-base-content)] opacity-50 hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-sm text-[var(--color-error)] mt-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
            <p className="text-xs text-[var(--color-base-content)] opacity-50 mt-2">
              {t('confirmPassword.tip')}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`cursor-pointer flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                isLoading 
                  ? 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
                  : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)]'
              }`}
            >
              {t('confirmPassword.cancel')}
            </button>
            <button
              onClick={() => verifyPassword(i18n)}
              disabled={isLoading || !password}
              className={`cursor-pointer flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isLoading || !password
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] opacity-50 cursor-not-allowed'
                  : 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('confirmPassword.verifying')}
                </>
              ) : isConfirmed ? (<><Check className='w-5 h-5'/> {t('confirmPassword.verified')}</>) : (
                <>
                  <Shield className="w-5 h-5" />
                  {t('confirmPassword.confirmPassword')}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--color-base-100)] border-t border-[var(--color-base-300)] rounded-b-2xl">
          <p className="text-xs text-center text-[var(--color-base-content)] opacity-50">
            🔒 {t('confirmPassword.tip2')}
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

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}