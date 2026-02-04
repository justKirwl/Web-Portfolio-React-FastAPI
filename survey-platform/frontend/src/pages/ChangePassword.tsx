import React, { useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import { useChangePasswordPageStore } from '../stores/ChangePasswordPageStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NotFound from './NotFound';
import { useTranslation } from '../../node_modules/react-i18next';

export default function ChangePassword() {
  const { showPassword, error, formData, isLoading, showConfirmPassword, setError, setFormData, setShowConfirmPassword, setShowPassword, resetData, isSuccess, changePassword, setSuccess, isNotFound, fetchConfirmation } = useChangePasswordPageStore()
  const [ params, setParams ] = useSearchParams()
  const isConfirmation = useRef<boolean>(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async () => {
    setError('');
    
    if (formData.newPassword.length < 8) {
      setError(t('changePassword.atLeastError'));
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('changePassword.passwordsNotMatch'));
      return;
    }

    const res = await changePassword(params.get('token'))

    if (res) {
        setTimeout(() => {
            setSuccess(false)
            resetData()
            navigate('/auth')
        }, 3000)
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(e);
    setError('');
  };

  useEffect(() => {
    if (isConfirmation.current) return

    fetchConfirmation(params.get('token'))

    isConfirmation.current = true
  }, [])

  if (isNotFound) {
    return <NotFound />
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden flex items-center justify-center">

      <div className="absolute inset-0 overflow-hidden">

        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            animation: 'slideFromTopLeft 1.5s ease-out'
          }}
        ></div>

        <div 
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-20"
          style={{
            background: 'linear-gradient(225deg, #2563eb 0%, #1e40af 100%)',
            animation: 'slideFromTopRight 1.8s ease-out'
          }}
        ></div>

        <div 
          className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: 'linear-gradient(45deg, #1d4ed8 0%, #3b82f6 100%)',
            animation: 'slideFromBottomRight 2s ease-out'
          }}
        ></div>

        <div 
          className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full opacity-20"
          style={{
            background: 'linear-gradient(315deg, #1e40af 0%, #2563eb 100%)',
            animation: 'slideFromBottomLeft 1.6s ease-out'
          }}
        ></div>

        <div 
          className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite'
          }}
        ></div>

        <div 
          className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        ></div>
      </div>

      <div 
        className="relative z-10 w-full max-w-md px-6"
        style={{
          animation: 'fadeUp 1s ease-out'
        }}
      >
        <div className="bg-[#1a1f3a]/80 backdrop-blur-xl rounded-2xl p-8 border border-[#2a3f7f]/30 shadow-2xl">

          {!isSuccess ? <><div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1e40af] flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {t('changePassword.title')}
            </h2>
            <p className="text-gray-400 text-sm">
              {t('changePassword.subtitle')}
            </p>
          </div>

          <div className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {t('changePassword.newPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder={t('changePassword.newPasswordPlaceholder')}
                  className="w-full pl-12 pr-12 py-3.5 rounded-lg bg-[#0a0e27]/50 text-white border-2 border-[#2a3f7f]/50 focus:border-[#3b82f6] focus:outline-none transition-colors placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {t('changePassword.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('changePassword.czzonfirmPasswordPlaceholder')}
                  className="w-full pl-12 pr-12 py-3.5 rounded-lg bg-[#0a0e27]/50 text-white border-2 border-[#2a3f7f]/50 focus:border-[#3b82f6] focus:outline-none transition-colors placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {t('changePassword.confirmPasswordHint')}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
              className="w-full py-4 rounded-lg font-bold text-white bg-gradient-to-r from-[#3b82f6] to-[#1e40af] hover:from-[#2563eb] hover:to-[#1e3a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('changePassword.buttonChanging')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>{t('changePassword.buttonSubmit')}</span>
                </>
              )}
            </button>

            <div className="p-4 rounded-lg bg-[#0a0e27]/50 border border-[#2a3f7f]/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#3b82f6] mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-gray-300">{t('changePassword.securityTipTitle')}</strong>{t('changePassword.securityTipText')}
                </div>
              </div>
            </div>
          </div></> : (
            <div className="w-full max-w-md">
            <div className="bg-[var(--color-base-200)] rounded-2xl p-8 border border-[var(--color-base-300)] shadow-2xl text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-[var(--color-success)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-base-content)] mb-2">
                {t('changePassword.successTitle')}
                </h2>
                <p className="text-[var(--color-base-content)] opacity-70 mb-4">
                {t('changePassword.successSubtitle')}
                </p>
            </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideFromTopLeft {
          from {
            transform: translate(-100%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(0, 0);
            opacity: 0.3;
          }
        }

        @keyframes slideFromTopRight {
          from {
            transform: translate(100%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(0, 0);
            opacity: 0.2;
          }
        }

        @keyframes slideFromBottomRight {
          from {
            transform: translate(100%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(0, 0);
            opacity: 0.3;
          }
        }

        @keyframes slideFromBottomLeft {
          from {
            transform: translate(-100%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(0, 0);
            opacity: 0.2;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}