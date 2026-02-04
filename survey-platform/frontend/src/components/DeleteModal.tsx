import { useEffect } from 'react';
import { Trash2, X, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import { useDeleteStore } from '../stores/DeleteModalStore';
import { useSettingStore } from '../stores/SettingStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';

export default function DeleteModal() {
  const { isOpen, setOpen: onClose, canDelete, countDown: countdown, setCanDelete, setCountdown } = useDeleteStore()
  const { isDeleting, deleteAccount } = useSettingStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setCanDelete(false);
      return;
    }

    const timer = setInterval(() => {
        if (countdown <= 1) {
            setCanDelete(true);
            setCountdown(0)
            return;
        }

        setCountdown(countdown - 1)
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;
    const res = await deleteAccount()
    if (res) navigate('/auth')
  };

  const handleClose = () => {
    if (isDeleting) return;
    setCountdown(10);
    setCanDelete(false);
    onClose(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-51 flex items-center justify-center p-6 bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-[var(--color-base-200)] to-[var(--color-base-100)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--color-base-300)] animate-scale-in overflow-hidden">

        <div className="relative p-4 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-600/10 border-b border-red-500/20">
          <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{
            backgroundImage: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
          
          <button onClick={handleClose} disabled={isDeleting} className={`absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <X className="w-5 h-5 text-[var(--color-base-content)]" />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg rotate-3 transition-transform">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-[var(--color-base-content)] mb-2">{t('deleteModal.title')}</h2>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div className="relative overflow-hidden bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-6 border-2 border-red-200/50 dark:border-red-800/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-lg text-[var(--color-base-content)] mb-2">{t('deleteModal.sure')}</p>
                  <p className="text-[var(--color-base-content)] opacity-70 mb-4">{t('deleteModal.tip1')}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                {[t('deleteModal.tip2'), t('deleteModal.tip3'), t('deleteModal.tip4')].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[var(--color-base-content)] opacity-70">{tip}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 text-sm pt-2 border-t border-red-200/50 dark:border-red-800/30 mt-3">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-[var(--color-base-content)] opacity-70">
                    {t('deleteModal.tip5')} <span className="font-bold text-red-600">{t('deleteModal.tip6')}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {canDelete && !isDeleting && (
            <div className="relative overflow-hidden bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-950/30 dark:to-pink-950/30 rounded-2xl p-6 border-2 border-red-300/50 dark:border-red-700/40 animate-pulse-soft">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-shimmer"></div>
              <p className="relative z-10 text-center font-bold text-[var(--color-base-content)] flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {t('deleteModal.canConfirm')}
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button onClick={handleClose} disabled={isDeleting} className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${isDeleting ? 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed' : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)]/80 hover:opacity-90 active:scale-95'}`}>
              {t('deleteModal.cancel')}
            </button>
            <button onClick={handleDelete} disabled={!canDelete || isDeleting} className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${canDelete && !isDeleting ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:opacity-90 active:scale-95 shadow-lg hover:shadow-xl' : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'}`}>
              {isDeleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('deleteModal.deleting')}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>{canDelete ? t('deleteModal.deleteAccount') : `${t('deleteModal.waitText')} ${countdown}s`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-shimmer { animation: shimmer 3s infinite; }
        .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}