import { Lock, Eye, EyeOff, X, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useChangePasswordStore } from '../stores/ChangePasswordStore';
import { useTranslation } from '../../node_modules/react-i18next';

export default function ChangePassword() {
  const { passwords, showPasswords, setErrors, setPasswords, setShowPasswords: togglePassword, errors, resetChanges, isLoading, isOpen, setOpen: onClose, updatePassword, isUpdated } = useChangePasswordStore()
  const { t } = useTranslation()

  const validatePasswords = () => {
    const newErrors: { current?: string, confirm?: string, new?: string } = {};

    if (!passwords.current) {
      newErrors.current = t('changePassword.currentRequired');
    }

    if (!passwords.confirm) {
      newErrors.confirm = t('changePassword.confirmCurrent');
    } else if (passwords.current !== passwords.confirm) {
      newErrors.confirm = t('changePassword.notMatch');
    }

    if (!passwords.new) {
      newErrors.new = t('changePassword.newPasswordRequired');
    } else if (passwords.new.length < 8) {
      newErrors.new = t('changePassword.passwordMustBeAtLeast');
    } else if (passwords.new === passwords.current) {
      newErrors.new = t('changePassword.passwordMustBeDifferent');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;

    await updatePassword()

    setTimeout(() => {
        useChangePasswordStore.setState(state => ({ ...state, isUpdated: false }))
        handleClose()
    }, 2000)
  };

  const handleClose = () => {
    resetChanges()
    onClose(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords(e);
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  if (!isOpen) return null;

  const passwordStrength = (password: string) => {
    if (password.length === 0) return { level: 0, text: '', color: '' };
    if (password.length < 8) return { level: 1, text: t('changePassword.weak'), color: 'text-[var(--color-error)]' };
    if (password.length < 12) return { level: 2, text: t('changePassword.medium'), color: 'text-[var(--color-warning)]' };
    return { level: 3, text: t('changePassword.strong'), color: 'text-[var(--color-success)]' };
  };

  const strength = passwordStrength(passwords.new);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray bg-opacity-60 backdrop-blur-sm">
      <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl w-full max-w-md shadow-2xl">

        <div className="flex items-center justify-between p-6 border-b border-[var(--color-base-300)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-primary)] bg-opacity-10 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-[var(--color-base-content)]]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-base-content)]">{t('changePassword.title')}</h2>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('changePassword.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all"
          >
            <X className="w-5 h-5 text-[var(--color-base-content)]" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
              {t('changePassword.currentPassword')} <span className="text-[var(--color-error)]">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-30" />
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwords.current}
                onChange={handleChange}
                placeholder={t('changePassword.currentPlaceholder')}
                name='current'
                disabled={isLoading}
                className={`w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 transition-all focus:outline-none ${
                  errors.current ? 'border-[var(--color-error)]' : 'border-transparent focus:border-[var(--color-primary)]'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => togglePassword('current')}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5 text-[var(--color-base-content)] opacity-50" />
                ) : (
                  <Eye className="w-5 h-5 text-[var(--color-base-content)] opacity-50" />
                )}
              </button>
            </div>
            {errors.current && (
              <p className="text-sm text-[var(--color-error)] mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.current}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
              {t('changePassword.confirmPassword')} <span className="text-[var(--color-error)]">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-30" />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={handleChange}
                placeholder={t('changePassword.confirmPlaceholder')}
                disabled={isLoading}
                name='confirm'
                className={`w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 transition-all focus:outline-none ${
                  errors.confirm ? 'border-[var(--color-error)]' : 'border-transparent focus:border-[var(--color-primary)]'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => togglePassword('confirm')}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5 text-[var(--color-base-content)] opacity-50" />
                ) : (
                  <Eye className="w-5 h-5 text-[var(--color-base-content)] opacity-50" />
                )}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-sm text-[var(--color-error)] mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.confirm}
              </p>
            )}
          </div>

          <div className="border-t border-[var(--color-base-300)] pt-5"></div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
              {t('changePassword.newPassword')} <span className="text-[var(--color-error)]">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-30" />
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwords.new}
                onChange={handleChange}
                placeholder={t('changePassword.confirmPlaceholder')}
                disabled={isLoading}
                name='new'
                className={`w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 transition-all focus:outline-none ${
                  errors.new ? 'border-[var(--color-error)]' : 'border-transparent focus:border-[var(--color-primary)]'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => togglePassword('new')}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5 text-[var(--color-base-content)] opacity-50" />
                ) : (
                  <Eye className="w-5 h-5 text-[var(--color-base-content)] opacity-50" />
                )}
              </button>
            </div>
            {errors.new && (
              <p className="text-sm text-[var(--color-error)] mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.new}
              </p>
            )}
            
            {passwords.new && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--color-base-content)] opacity-60">{t('changePassword.passwordStrength')}</span>
                  <span className={`text-xs font-bold ${strength.color}`}>{strength.text}</span>
                </div>
                <div className="w-full h-2 bg-[var(--color-base-300)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      strength.level === 1 ? 'bg-[var(--color-error)] w-1/3' :
                      strength.level === 2 ? 'bg-[var(--color-warning)] w-2/3' :
                      strength.level === 3 ? 'bg-[var(--color-success)] w-full' : 'w-0'
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[var(--color-info)] bg-opacity-10 border-l-4 border-[var(--color-info)] rounded p-3">
            <p className="text-xs text-[var(--color-base-content)] opacity-80">
              💡 {t('changePassword.hint')}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`cursor-pointer flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                isLoading 
                  ? 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
                  : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)]'
              }`}
            >
              {t('changePassword.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`cursor-pointer flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] opacity-50 cursor-not-allowed'
                  : 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:opacity-80'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('changePassword.updating')}
                </>
              ) : isUpdated ? (<><Check className='w-5 h-5'/> {t('changePassword.updated')}</>) : (
                <>
                  {t('changePassword.update')}
                  <ArrowRight className='w-5 h-5'/>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}