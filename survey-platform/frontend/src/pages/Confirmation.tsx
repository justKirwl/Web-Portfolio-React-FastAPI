import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader, UserCheck, Shield } from 'lucide-react';
import { useConfirmationStore } from '../stores/ConfirmationStore';
import { useSearchParams } from 'react-router-dom';
import NotFound from './NotFound';
import { useTranslation } from '../../node_modules/react-i18next';

export default function Confirmation() {
  const { confirmationData, setExpired, setTimeRemaining, isLoading, isExpired, timeRemaining, fetchConfirmation, handleConfirm, isError } = useConfirmationStore()
  const [ params, setParams ] = useSearchParams()
  const isFetched = useRef<boolean>(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (isFetched.current) return

    fetchConfirmation(params.get('token'))

    isFetched.current = true
  }, [])

  useEffect(() => {
    if (confirmationData.expiresAt > 0) {
      const updateTimer = () => {
        const remaining = confirmationData.expiresAt - Date.now();
        if (remaining <= 0) {
          setExpired(true);
          setTimeRemaining(0);
        } else {
          setTimeRemaining(remaining);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [confirmationData.expiresAt]);

  const formatTime = (ms: number) => {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getIcon = () => {
    switch (confirmationData.type) {
      case 'invite_accept':
        return <UserCheck className="w-16 h-16" />;
      default:
        return <Shield className="w-16 h-16" />;
    }
  };

  const getColor = () => {
    switch (confirmationData.type) {
      case 'quiz_accept':
        return 'from-[var(--color-primary)] to-[var(--color-secondary)]';
      case 'survey_accept':
        return 'from-[var(--color-warning)] to-[var(--color-error)]';
      default:
        return 'from-[var(--color-info)] to-[var(--color-accent)]';
    }
  };

  if (isError) {
    return <NotFound />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-base-100)] to-[var(--color-base-200)] flex items-center justify-center p-6 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)] opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[var(--color-accent)] opacity-3 rounded-full blur-2xl"></div>

      <div className="relative z-10 max-w-2xl w-full bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl overflow-hidden shadow-2xl">

        <div className={`bg-gradient-to-r ${getColor()} p-8 text-white text-center`}>
          <div className={`w-24 h-24 ${getColor()} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <div>
              {getIcon()}
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{confirmationData.title}</h1>
          <p className="text-lg opacity-90">{confirmationData.description}</p>
        </div>

        <div className="p-8">

          <div className={`border-2 rounded-xl p-4 mb-6 flex items-center gap-4 ${
            isExpired
              ? 'bg-[var(--color-error)] bg-opacity-10 border-[var(--color-error)]'
              : timeRemaining < 300000
              ? 'bg-[var(--color-warning)] bg-opacity-10 border-[var(--color-warning)]'
              : 'bg-[var(--color-info)] bg-opacity-10 border-[var(--color-info)]'
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isExpired
                ? 'bg-[var(--color-error)]'
                : timeRemaining < 300000
                ? 'bg-[var(--color-warning)]'
                : 'bg-transparent'
            }`}>
              {isExpired ? (
                <XCircle className="w-6 h-6 text-white" />
              ) : (
                <Clock className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--color-base-content)] opacity-60">
                {isExpired ? t('confirmation.linkExpired') : t('confirmation.timeRemaining')}
              </p>
              <p className={`text-2xl font-bold ${
                isExpired
                  ? 'text-[var(--color-base-info)]'
                  : timeRemaining < 300000
                  ? 'text-[var(--color-base-info)]'
                  : 'text-[var(--color-base-info)]'
              }`}>
                {isExpired ? t('confirmation.expired') : formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          {!isExpired && timeRemaining < 300000 && (
            <div className="bg-[var(--color-warning)] bg-opacity-10 border-l-4 border-[var(--color-warning)] rounded p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[var(--color-base-content)]">
                  <p className="font-bold mb-1">{t('confirmation.timeRunningOut')}</p>
                  <p className="opacity-80">{t('confirmation.timeRunningOutSub')}</p>
                </div>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="bg-[var(--color-error)] bg-opacity-10 border-l-4 border-[var(--color-error)] rounded p-4 mb-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[var(--color-base-content)]">
                  <p className="font-bold mb-1">{t('confirmation.linkExpired')}</p>
                  <p className="opacity-80">{t('confirmation.linkExpiredSub')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[var(--color-base-100)] rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[var(--color-base-content)] opacity-50 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[var(--color-base-content)] opacity-70">
                <p className="font-bold mb-1">{t('confirmation.securityNotice')}</p>
                <p>{t('confirmation.notice')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {!isExpired ? (
              <button
                onClick={() => handleConfirm(params.get('token'))}
                disabled={isLoading}
                className={`cursor-pointer w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  isLoading
                    ? 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
                    : `bg-gradient-to-r ${getColor()} text-[var(--color-base-content)] hover:scale-105 shadow-lg`
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    {t('confirmation.processing')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    {t('confirmation.buttonConfirm')}
                  </>
                )}
              </button>
            ) : (
              <button
                className="cursor-pointer w-full py-4 rounded-xl font-bold text-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105 transition-all shadow-lg"
              >
                {t('confirmation.requestNewLink')}
              </button>
            )}

            <button
              onClick={() => window.history.back()}
              className="cursor-pointer w-full py-3 rounded-xl font-medium bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all"
            >
              {t('confirmation.cancel')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-base-content)] opacity-60">
              {t('confirmation.needHelp')} <button onClick={() => alert('Support contact')} className="cursor-pointer text-[var(--color-primary)] hover:underline font-medium">{t('confirmation.contactSupport')}</button>
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--color-base-300)] bg-[var(--color-base-100)] p-4 text-center">
          <p className="text-xs text-[var(--color-base-content)] opacity-50">
            {t('confirmation.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}