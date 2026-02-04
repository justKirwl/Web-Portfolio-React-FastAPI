import { useEffect } from 'react';
import { ArrowLeft, Eye, Users, Clock, Calendar, Share2, Copy, CheckCircle, BarChart3, ExternalLink, Mail, Trophy, Zap, Target, Timer, Shuffle, Award, Check } from 'lucide-react';
import { useQuizStore } from '../stores/QuizStore';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { useQuizEditStore } from '../stores/QuizEditStore';
import EditQuizModal from '../components/QuizEditModal';
import { useQuizAnalyticsStore } from '../stores/QuizAnalyticsStore';
import QuizAnalytics from '../components/QuizAnalytics';

export default function Quiz() {
    const { copied, setCopied, averageScore, responseRate, totalPoints, quizUrl, quizData, setEmailAddress, setShowEmailInput, emailAddress, showEmailInput, shareQuiz, isSending, isSent, isRequestSent, isLoading } = useQuizStore()
    const { isOpenId, setOpen } = useQuizEditStore()
    const { setIsOpen, isOpen } = useQuizAnalyticsStore()
    const params = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(quizUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    useEffect(() => {
        if (isSent) {
          setTimeout(() => {
            useQuizStore.setState(state => ({ ...state, isSent: false }))
          }, 3000)
        }
      }, [isSent])

    useEffect(() => {
        if (isRequestSent) {
          setTimeout(() => {
            useQuizStore.setState(state => ({ ...state, isRequestSent: false }))
          }, 3000)
        }
      }, [isRequestSent])

    return (
        <div className="min-h-screen bg-[var(--color-base-100)]">

        <header className="bg-[var(--color-base-200)] border-b border-[var(--color-base-300)] sticky top-0 z-10">
            <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
                <button 
                onClick={() => navigate('/dashboard')}
                className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all"
                >
                <ArrowLeft className="w-5 h-5 text-[var(--color-base-content)]" />
                </button>
                <div className="flex-1">
                {!isLoading ? <h1 className="text-2xl font-bold text-[var(--color-base-content)]">{quizData.title}</h1> : <div className='skeleton w-1/4 h-10'></div>}
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('quiz.title')}</p>
                </div>
                {!isLoading ? <span className={`px-4 py-2 rounded-lg font-semibold text-sm shadow-lg ${
                quizData.status === 'active'
                    ? 'bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/30'
                    : 'bg-[var(--color-warning)]/20 text-[var(--color-warning)] border border-[var(--color-warning)]/30'
                }`}>
                ● {t(`quiz.status.${quizData.status}`).toUpperCase()}
                </span> : <div className='skeleton w-1/8 h-10'></div>}
            </div>
            </div>
        </header>

        <div className="container mx-auto px-6 py-8">
            {isOpenId && <EditQuizModal quizId={isOpenId}/>}
            {isOpen && <QuizAnalytics />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-6">

                {!isLoading ? <div className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-accent)] rounded-lg p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-9">
                    <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-6 h-6" />
                    <span className="text-sm font-bold opacity-90">{t('quiz.bigTitle')}</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-3">{quizData.title}</h2>
                    <p className="text-lg opacity-90 mb-6">{quizData.description}</p>
                    <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => navigate(`/start/quiz/${params.id}`)}
                        className="cursor-pointer px-6 py-3 rounded-lg bg-[var(--color-secondary)] bg-opacity-20 backdrop-blur text-white font-medium hover:opacity-80 flex items-center gap-2"
                    >
                        <Eye className="w-5 h-5" />
                        {t('quiz.preview')}
                    </button>
                    </div>
                </div>
                </div> : <div className='skeleton w-full h-60'></div>}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {!isLoading ? <><div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-[var(--color-accent)]" />
                    <span className="text-sm text-[var(--color-base-content)] opacity-60">{t('quiz.views')}</span>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-base-content)]">{quizData.views}</p>
                </div>
                
                <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-[var(--color-success)]" />
                    <span className="text-sm text-[var(--color-base-content)] opacity-60">{t('quiz.attempts')}</span>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-base-content)]">{quizData.responses.length}</p>
                </div>
                
                <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-[var(--color-warning)]" />
                    <span className="text-sm text-[var(--color-base-content)] opacity-60">{t('quiz.avgScore')}</span>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-base-content)]">{averageScore}%</p>
                </div>
                
                <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-[var(--color-secondary)]" />
                    <span className="text-sm text-[var(--color-base-content)] opacity-60">{t('quiz.passRate')}</span>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-base-content)]">{responseRate}%</p>
                </div></> : [1, 2, 3, 4].map(num => (
                    <div key={num} className='skeleton w-full h-20'></div>
                ))}
                </div>

                {!isLoading ? <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg p-6">
                <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[var(--color-primary)]" />
                    {t('quiz.quizConfiguration')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Timer className="w-5 h-5 text-[var(--color-info)]" />
                        <span className="text-sm text-[var(--color-base-content)] opacity-60">{t('quiz.timeLimit')}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-base-content)]">
                        {quizData.timeLimit > 0 ? `${quizData.timeLimit} ${t('quiz.min')}` : t('quiz.unlimited')}
                    </p>
                    </div>

                    <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-[var(--color-success)]" />
                        <span className="text-sm text-[var(--color-base-content)] opacity-60">{t('quiz.passingScore')}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-base-content)]">{quizData.passingScore}%</p>
                    </div>

                    <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-5 h-5 text-[var(--color-warning)]" />
                        <span className="text-sm text-[var(--color-base-content)] opacity-60">{t('quiz.totalPoints')}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-base-content)]">{totalPoints}</p>
                    </div>

                    <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
                        <span className="text-sm text-[var(--color-base-content)] opacity-60">{t('quiz.questions')}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-base-content)]">{quizData.questions.length}</p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    {quizData.shuffleQuestions && (
                    <span className="px-3 py-2 rounded-lg bg-[var(--color-secondary)] text-[var(--color-secondary-content)] text-sm font-medium flex items-center gap-2">
                        <Shuffle className="w-4 h-4" />
                        {t('quiz.shuffleQuestions')}
                    </span>
                    )}
                </div>
                </div> : <div className='skeleton w-full h-90'></div>}

                {!isLoading ? <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[var(--color-base-content)]">{t('quiz.questionsPreview')}</h3>
                    <span className="text-sm text-[var(--color-base-content)] opacity-60">
                    {quizData.questions.length} {t('quiz.questions').toLowerCase()} • {totalPoints} {t('quiz.points')}
                    </span>
                </div>
                
                <div className="space-y-4">
                    {quizData.questions.map((question, index) => (
                    <div
                        key={question.id}
                        className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-lg p-5 hover:border-[var(--color-secondary)] transition-all"
                    >
                        <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] text-[var(--color-secondary-content)] flex items-center justify-center font-bold flex-shrink-0">
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-3 mb-3">
                            <p className="text-[var(--color-base-content)] font-bold text-lg flex-1">
                                {question.question}
                            </p>
                            <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-warning)] text-[var(--color-warning-content)] font-bold flex-shrink-0">
                                {question.points} {t('quiz.pts')}
                            </span>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                            {question.options.map((option, i) => (
                                <div
                                key={i}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                    i === question.correctAnswer
                                    ? 'bg-[var(--color-success)] bg-opacity-20 border-2 border-[var(--color-success)]'
                                    : 'bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)]'
                                }`}
                                >
                                {i === question.correctAnswer && (
                                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary)] flex-shrink-0" />
                                )}
                                <span className={`text-sm ${
                                    i === question.correctAnswer
                                    ? 'text-[var(--color-base-content)] font-medium' 
                                    : 'text-[var(--color-base-content)] opacity-70'
                                }`}>
                                    {option}
                                </span>
                                </div>
                            ))}
                            </div>

                            {question.explanation && (
                            <div className="bg-[var(--color-info)] bg-opacity-10 border-l-4 border-[var(--color-info)] px-4 py-3 rounded">
                                <p className="text-sm text-[var(--color-base-content)] opacity-80">
                                <span className="font-bold">{t('quiz.explanation')}</span> {question.explanation}
                                </p>
                            </div>
                            )}
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div> : <div className='skeleton w-full h-200'></div>}
            </div>

            <div className="space-y-6">

                {!isLoading ? <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg p-6">
                <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4">{t('quiz.details')}</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[var(--color-base-content)] opacity-50" />
                    <div>
                        <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('quiz.created')}</p>
                        <p className="text-sm font-medium text-[var(--color-base-content)]">{new Date(parseInt(quizData.createdAt) * 1000).toLocaleDateString('en-CA')}</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[var(--color-base-content)] opacity-50" />
                    <div>
                        <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('quiz.lastAttempt')}</p>
                        <p className="text-sm font-medium text-[var(--color-base-content)]">{quizData.lastResponse && quizData.lastResponse.replace(quizData.lastResponse[0], quizData.lastResponse[0].toUpperCase())}</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-[var(--color-base-content)] opacity-50" />
                    <div>
                        <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('quiz.maxScore')}</p>
                        <p className="text-sm font-medium text-[var(--color-base-content)]">{totalPoints} {t('quiz.points')}</p>
                    </div>
                    </div>
                </div>
                </div> : <div className='skeleton w-full h-60'></div>}

                {!isLoading ? <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg p-6">
                <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4 flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    {t('quiz.share')}
                </h3>
                
                <div className="space-y-3">
                    <div className="flex gap-2">
                    <input
                        type="text"
                        value={quizUrl}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] text-sm border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none"
                    />
                    <button
                        onClick={handleCopyLink}
                        className={`cursor-pointer px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        copied
                            ? 'bg-[var(--color-success)] text-[var(--color-success-content)]'
                            : 'bg-[var(--color-secondary)] text-[var(--color-secondary-content)] hover:scale-105'
                        }`}
                    >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    </div>

                    <a
                    href={quizUrl}
                    target='_blank'
                    className="no-underline cursor-pointer w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-80 transition-all flex items-center justify-center gap-2"
                    >
                    <ExternalLink className="w-4 h-4" />
                    {t('quiz.openInNewTab')}
                    </a>

                    <button
                    onClick={() => setShowEmailInput(!showEmailInput)}
                    className="cursor-pointer w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-80 transition-all flex items-center justify-center gap-2"
                    >
                    <Mail className="w-4 h-4" />
                    {t('quiz.shareViaEmail')}
                    </button>

                    <div className={`transition-all duration-300 ease-in-out ${
                showEmailInput ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="flex gap-2 pt-2">
                    <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e)}
                    onKeyDown={(e) => e.key === 'Enter' && shareQuiz()}
                    placeholder={t('quiz.emailPlaceholder')}
                    className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-secondary)] focus:outline-none"
                    />
                    <button
                    onClick={shareQuiz}
                    disabled={isSent || !emailAddress}
                    className={`cursor-pointer w-12 h-12 rounded-full bg-[var(--color-secondary)] text-[var(--color-primary-content)] hover:opacity-90 transition-all flex items-center justify-center shadow-lg ${isSent && 'scale-97'}`}
                    >
                    {!isSent ? !isSending ? <Mail className="w-5 h-5" /> : <div className='loading w-5 h-5'></div> : <Check className='w-5 h-5'/>}
                    </button>
                </div>
                </div>
                </div>
                </div> : <div className='skeleton w-full h-70'></div>}

                {!isLoading ? <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg p-6">
                <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4">{t('quiz.quickActions')}</h3>
                <div className="space-y-2">
                    <button
                    onClick={() => navigate(`/quiz/leaderboard/${params.id}`)}
                    className="cursor-pointer w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-80 transition-all flex items-center gap-3"
                    >
                    <Trophy className="w-5 h-5" />
                    {t('quiz.viewLeaderboard')}
                    </button>
                    <button
                    onClick={() => setIsOpen(true)}
                    className="cursor-pointer w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-80 transition-all flex items-center gap-3"
                    >
                    <BarChart3 className="w-5 h-5" />
                    {t('quiz.viewAnalytics')}
                    </button>
                    <button
                    onClick={() => setOpen(params.id!)}
                    className="cursor-pointer w-full px-4 py-3 rounded-lg bg-[var(--color-secondary)] text-[var(--color-secondary-content)] hover:scale-99 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                    {t('quiz.editQuiz')}
                    </button>
                </div>
                </div> : <div className='skeleton w-full h-50'></div>}
            </div>
            </div>
        </div>
        </div>
    );
}