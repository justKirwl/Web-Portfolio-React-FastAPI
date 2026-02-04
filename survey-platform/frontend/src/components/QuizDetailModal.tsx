import { X, Play, Clock, Trophy, Users, BarChart3, Award, CheckCircle, Star, Target, Zap, Brain, Check, RotateCcw, LoaderCircle } from 'lucide-react';
import { useQuizDetailStore } from '../stores/QuizDetailStore';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { useQuizStore } from '../stores/QuizStore';

export default function QuizDetail() {
  const { quizData, isOpen, setOpen: setIsOpen, fetchQuiz, requestAgain, isRequestSending, isRequestSent } = useQuizDetailStore()
  const { addView } = useQuizStore()
  const isFetched = useRef<boolean>(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (isFetched.current) return

    fetchQuiz()
    addView(quizData.id)

    isFetched.current = true
  }, [])
  
  useEffect(() => {
    if (isRequestSent) setTimeout(() => useQuizDetailStore.setState(state => ({ ...state, isRequestSent: false })), 2000)
  }, [isRequestSent])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-[var(--color-base-100)] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative h-38 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <button
            onClick={() => setIsOpen(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                quizData.difficulty === 'Advanced' ? 'bg-red-500/30 text-red-200 border border-red-400/50' :
                quizData.difficulty === 'Intermediate' ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/50' :
                'bg-green-500/30 text-green-200 border border-green-400/50'
              }`}>
                {quizData.difficulty}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg">
              {quizData.title}
            </h2>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
            <img 
              src={quizData.author.avatar} 
              alt={quizData.author.name}
              className="w-16 h-16 rounded-full object-cover shadow-lg"
            />
            <div>
              <p className="font-bold text-lg text-[var(--color-base-content)]">{quizData.author.name}</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(quizData.stats.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">
                {quizData.stats.rating} ({quizData.stats.totalRatings} {t('quizDetail.ratings')})
              </p>
            </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-3 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              {t('quizDetail.about')}
            </h3>
            <p className="text-[var(--color-base-content)] leading-relaxed">
              {quizData.description}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/20 border border-purple-500/30 text-center">
              <BarChart3 className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-purple-600">{quizData.stats.questions}</p>
              <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('quizDetail.questions')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/20 border border-blue-500/30 text-center">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-blue-600">{quizData.stats.timeLimit}</p>
              <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('quizDetail.minutes')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/20 border border-yellow-500/30 text-center">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-yellow-600">{quizData.stats.totalPoints}</p>
              <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('quizDetail.points')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/20 border border-green-500/30 text-center">
              <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-green-600">{quizData.stats.passRate}%</p>
              <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('quizDetail.passRate')}</p>
            </div>
          </div>

          <div className="flex gap-6 mb-6 p-4 rounded-2xl bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-[var(--color-base-content)]">
                <span className="font-bold">{quizData.stats.attempts}</span> {t('quizDetail.attempts')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-[var(--color-base-content)]">
                {t('quizDetail.avgScore')}: <span className="font-bold">{quizData.stats.avgScore}%</span>
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-3">{t('quizDetail.topicsCovered')}</h3>
            <div className="flex flex-wrap gap-2">
              {quizData.topics.map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-2 rounded-full bg-[var(--color-base-200)] border border-[var(--color-base-300)] text-[var(--color-base-content)] font-semibold text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              {t('quizDetail.whatYouGet')}
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {quizData.learnings.map((learning, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--color-base-content)]">{learning}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
            <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-3">{t('quizDetail.requirements')}</h3>
            <ul className="space-y-2">
              {quizData.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[var(--color-base-content)]">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              disabled={quizData.isCompleted}
              onClick={() => navigate(`/start/quiz/${quizData.id}`)}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-black text-lg hover:opacity-80 transition-all shadow-2xl flex items-center justify-center gap-3"
            >
              {quizData.isCompleted ? (
                <>
                <Check className='w-6 h-6' />
                {t('quizDetail.completed')}
                </>
              ) : (
                <>
                <Play className="w-6 h-6" />
                {t('quizDetail.startQuiz')}
                </>
              )}
            </button>
            {quizData.isCompleted && <button onClick={() => requestAgain(quizData.id)} className='rounded-2xl bg-[var(--color-base-200)] px-6' title='Request to try again.'>{isRequestSending ? <LoaderCircle className='w-5 h-5 animate-spin'/> : isRequestSent ? <Check className='w-5 h-5'/> : <RotateCcw className='w-5 h-5'/>}</button>}
            <button
              onClick={() => setIsOpen(null)}
              className="px-6 py-4 rounded-2xl bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] text-[var(--color-base-content)] font-bold hover:opacity-90 transition-all"
            >
              {t('quizDetail.maybeLater')}
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <p className="text-sm text-[var(--color-base-content)] text-center">
              <strong>{t('quizDetail.proTipText')}</strong> {t('quizDetail.proTipDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}