import { X, Play, Eye, Users, Award, Calendar, FileText, TrendingUp, Star, CheckCircle, BarChart3, MessageCircle, Check, RotateCcw, LoaderCircle } from 'lucide-react';
import { useSurveyDetailStore } from '../stores/SurveyDetailStore';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../stores/SurveyStore';
import { useTranslation } from '../../node_modules/react-i18next';

export default function SurveyDetailModal() {
  const { isOpen, setOpen: setIsOpen, surveyData, fetchSurvey, requestAgain, isRequestSending, isRequestSent } = useSurveyDetailStore()
  const { addView } = useSurveyStore()
  const isFetched = useRef<boolean>(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (isFetched.current) return

    fetchSurvey()
    addView(surveyData.id)

    isFetched.current = true
  }, [])

  useEffect(() => {
    if (isRequestSent) {
        setTimeout(() => {
            useSurveyDetailStore.setState(state => ({ ...state, isRequestSent: false }))
        }, 2000)
    }
  }, [isRequestSent])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[var(--color-base-100)] rounded-3xl shadow-2xl overflow-hidden" style={{ maxHeight: '95vh', overflowY: 'auto' }}>
        
        <div className="relative h-40 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <button
            onClick={() => setIsOpen(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-4 left-4">
            <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t('surveyDetail.survey')}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl font-black text-white drop-shadow-lg">
              {surveyData.title}
            </h2>
          </div>
        </div>

        <div className="p-8">
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--color-base-300)]">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[var(--color-base-200)] shadow-lg">
              <img src={surveyData.authorAvatar} alt={surveyData.author} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-1">{t('surveyDetail.createdBy')}</p>
              <p className="text-lg font-bold text-[var(--color-base-content)]">{surveyData.author}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(surveyData.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">
                {surveyData.rating} ({surveyData.totalRatings} {t('surveyDetail.ratings')})
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-500" />
              {t('surveyDetail.about')}
            </h3>
            <p className="text-[var(--color-base-content)] opacity-80 leading-relaxed">
              {surveyData.description}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--color-base-200)] rounded-2xl p-4 border border-[var(--color-base-300)]">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-black text-[var(--color-base-content)] mb-1">{surveyData.views.length}</p>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyDetail.views')}</p>
            </div>

            <div className="bg-[var(--color-base-200)] rounded-2xl p-4 border border-[var(--color-base-300)]">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-black text-[var(--color-base-content)] mb-1">{surveyData.responses}</p>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyDetail.responses')}</p>
            </div>

            <div className="bg-[var(--color-base-200)] rounded-2xl p-4 border border-[var(--color-base-300)]">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-3xl font-black text-[var(--color-base-content)] mb-1">{surveyData.questions}</p>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyDetail.questions')}</p>
            </div>
          </div>

          <div className="bg-[var(--color-base-200)] rounded-2xl p-6 border border-[var(--color-base-300)] mb-8">
            <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              {t('surveyDetail.surveyDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyDetail.difficulty')}</p>
                  <p className="font-bold text-[var(--color-base-content)]">{surveyData.difficulty}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyDetail.created')}</p>
                  <p className="font-bold text-[var(--color-base-content)]">{new Date(surveyData.createdAt * 1000).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyDetail.lastUpdated')}</p>
                  <p className="font-bold text-[var(--color-base-content)]">{surveyData.lastUpdated}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyDetail.language')}</p>
                  <p className="font-bold text-[var(--color-base-content)]">{surveyData.language}</p>
                </div>
              </div>
            </div>
          </div>

          {surveyData.tags.length > 0 && <div className="mb-8">
            <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-3">{t('surveyDetail.tags')}</h3>
            <div className="flex flex-wrap gap-2">
              {surveyData.tags.map((tag, idx) => (
                <span key={idx} className="px-4 py-2 rounded-xl bg-[var(--color-base-200)] border border-[var(--color-base-300)] text-[var(--color-base-content)] font-semibold text-sm hover:border-purple-500 transition-all">
                  #{tag}
                </span>
              ))}
            </div>
          </div>}

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[var(--color-base-content)] mb-2">{t('surveyDetail.beforeYouStart')}</h4>
                <ul className="space-y-2 text-sm text-[var(--color-base-content)] opacity-80">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{t('surveyDetail.beforeYouStartTips.anonymous')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{t('surveyDetail.beforeYouStartTips.saveProgress')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{t('surveyDetail.beforeYouStartTips.stableConnection')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              disabled={surveyData.isCompleted}
              onClick={() => navigate(`/start/survey/${surveyData.id}`)}
              className={`flex-1 px-${surveyData.isCompleted ? '4' : '8'} py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg hover:opacity-80 transition-all shadow-2xl flex items-center justify-center gap-3`}
            >
              {surveyData.isCompleted ? (
                <>
                <Check className='w-6 h-6' />
                {t('surveyDetail.completed')}
                </>
              ) : (
                <>
                <Play className="w-6 h-6" />
                {t('surveyDetail.startSurvey')}
                </>
              )}
            </button>
            {surveyData.isCompleted && <button onClick={() => requestAgain(surveyData.id)} className='rounded-2xl bg-[var(--color-base-200)] px-6' title={t('surveyDetail.requestAgain')}>{isRequestSending ? <LoaderCircle className='w-5 h-5 animate-spin'/> : isRequestSent ? <Check className='w-5 h-5'/> : <RotateCcw className='w-5 h-5'/>}</button>}
            <button
              onClick={() => setIsOpen(null)}
              className="px-8 py-4 rounded-2xl bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] text-[var(--color-base-content)] font-bold hover:bg-[var(--color-base-300)] transition-all"
            >
              {t('surveyDetail.maybeLater')}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}