import { X, Play, Pause, Maximize, RotateCcw, Download } from 'lucide-react';
import { useDemoStore } from '../stores/DemoModalStore';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/AuthStore';
import { useTranslation } from '../../node_modules/react-i18next';

export default function DemoModal() {
  const { isOpen, setOpen: onClose, videoElement, isPlaying, setIsPlaying, setVideoElement } = useDemoStore()
  const { isAuthorized } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (!isOpen) return null;

  const togglePlay = () => {
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const restartVideo = () => {
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray/80 backdrop-blur-lg animate-fade-in">
      <div className="bg-[var(--color-base-200)] rounded-3xl w-full max-w-6xl shadow-2xl border border-[var(--color-base-300)] animate-scale-in overflow-hidden">
        
        <div className="relative border-b border-[var(--color-base-300)]">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
          
          <button
            onClick={() => {
                onClose(false)
                setIsPlaying(false)
            }}
            className="z-50 absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="relative bg-black h-[75vh]">
          <video
            ref={setVideoElement}
            className="w-full h-full"
            src="/surveyhub-demo.webm"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            preload='none'
          >
            {t('demoModal.videoNotSupported')}
          </video>

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={togglePlay}>
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                <Play className="w-10 h-10 text-[var(--color-primary)] ml-1 fill-[var(--color-primary)]" />
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>

                <button
                  onClick={restartVideo}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="surveyhub-demo.webm"
                  download
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  <Download className="w-5 h-5 text-white" />
                </a>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[var(--color-base-100)] border-t border-[var(--color-base-300)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-[var(--color-base-content)] mb-1">
                {t('demoModal.readyTitle')}
              </h3>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">
                {t('demoModal.readySubtitle')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                    onClose(false)
                    setIsPlaying(false)
                }}
                className="px-6 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] font-semibold hover:bg-[var(--color-base-300)]/80 transition-all"
              >
                {t('demoModal.close')}
              </button>
              <button onClick={() => {
                    navigate(isAuthorized ? '/dashboard' : '/auth')
                    onClose(false)
                    setIsPlaying(false)
                }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold hover:opacity-90 transition-all shadow-lg">
                {t('demoModal.getStarted')}
              </button>
            </div>
          </div>
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
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}