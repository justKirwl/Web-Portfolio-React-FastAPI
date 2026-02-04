import { useEffect, useRef } from 'react';
import { ChevronRight, Trophy, Clock, AlertCircle, Zap, ArrowLeft } from 'lucide-react';
import { useStartQuizStore } from '../stores/StartQuizStore';
import { useParams } from 'react-router-dom';
import { useQuizResultStore } from '../stores/QuizResultStore';
import QuizResultModal from '../components/QuizResultModal';
import { useTranslation } from '../../node_modules/react-i18next';

export default function StartQuiz() {
    const { quizData, currentQuestionIndex, setCurrentQuestionIndex, quizCompleted, quizStarted, fetchQuiz, setQuizCompleted, setQuizStarted, setSelectedAnswers, setTimeRemaining, selectedAnswers, timeRemaining, currentQuestion, progress, totalPoints, addResponse, userId, resetQuiz } = useStartQuizStore()
    const { isOpen, setIsOpen } = useQuizResultStore()
    const isFetched = useRef<boolean>(false)
    const params = useParams()
    const { t } = useTranslation()

    useEffect(() => {
        if (quizStarted && timeRemaining > 0 && !quizCompleted) {
        const timer = setInterval(() => {
            if (timeRemaining <= 1) {
                setIsOpen(true)
                addResponse(params.id)
                setTimeRemaining(0)
                return
            }
            
            setTimeRemaining(timeRemaining - 1)
        }, 1000);

        return () => clearInterval(timer);
        }
    }, [quizStarted, timeRemaining, quizCompleted]);

    useEffect(() => {
        if (isFetched.current) return

        fetchQuiz(params.id!)

        isFetched.current = true
    }, [])

    useEffect(() => {
        useStartQuizStore.setState(state => ({ ...state, currentQuestion: quizData.questions[currentQuestionIndex] }))
      }, [currentQuestionIndex])
    
      useEffect(() => {
        useStartQuizStore.setState(state => ({ ...state, progress: (state.currentQuestionIndex / quizData.questions.length) * 100 }))
      }, [currentQuestionIndex])

    const handleStartQuiz = () => {
        setQuizStarted(true);
        if (quizData.timeLimit > 0) {
        setTimeRemaining(quizData.timeLimit * 60);
        }
    };

    const handleSelectAnswer = (optionIndex: number) => {
        setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion.id]: optionIndex
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizData.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setIsOpen(true)
            setQuizCompleted(true)
            if (userId !== quizData.authorId) {
                addResponse(params.id!)    
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isAnswerSelected = selectedAnswers[currentQuestion?.id] !== undefined;

    if (!quizStarted) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-base-100)] to-[var(--color-base-200)] flex items-center justify-center p-6 relative overflow-hidden">

            <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-secondary)] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-accent)] opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-2xl w-full bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl p-8 shadow-2xl relative z-10">

            <button
                onClick={() => {
                    window.history.back()
                    resetQuiz()
                }}
                className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all"
            >
                <ArrowLeft className="w-5 h-5 text-[var(--color-base-content)]" />
            </button>

            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-[var(--color-base-content)] mb-2">{quizData.title}</h1>
                <p className="text-lg text-[var(--color-base-content)] opacity-70">{quizData.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[var(--color-secondary)]">{quizData.questions.length}</p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('startQuiz.questions')}</p>
                </div>
                <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[var(--color-warning)]">{totalPoints}</p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('startQuiz.points')}</p>
                </div>
                <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[var(--color-info)]">
                    {quizData.timeLimit > 0 ? `${quizData.timeLimit}m` : '∞'}
                </p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('startQuiz.timeLimit')}</p>
                </div>
                <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[var(--color-success)]">{quizData.passingScore}%</p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('startQuiz.passScore')}</p>
                </div>
            </div>

            <div className="bg-[var(--color-base-200)] bg-opacity-10 border-l-4 border-[var(--color-primary)] rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-info)] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[var(--color-base-content)]">
                    <p className="font-bold mb-1">{t('startQuiz.instructions')}</p>
                    <ul className="list-disc list-inside space-y-1 opacity-80">
                    <li>{t('startQuiz.instruction1')}</li>
                    <li>{t('startQuiz.instruction3')}</li>
                    {quizData.timeLimit > 0 && <li>{t('startQuiz.instruction3')} {quizData.timeLimit} {t('startQuiz.minutes')}</li>}
                    <li>{t('startQuiz.instruction5')} {quizData.passingScore}% {t('startQuiz.instruction6')}</li>
                    {quizData.showResults && <li>{t('startQuiz.instruction7')}</li>}
                    </ul>
                </div>
                </div>
            </div>

            <button
                onClick={handleStartQuiz}
                className="cursor-pointer w-full py-4 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] text-white font-bold text-lg hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-3"
            >
                <Zap className="w-6 h-6" />
                {t('startQuiz.startQuiz')}
            </button>
            </div>
        </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-base-100)] to-[var(--color-base-200)] relative overflow-hidden">

        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-secondary)] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-accent)] opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 container mx-auto px-6 py-6">

            <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
                <button
                    onClick={() => {
                        window.history.back()
                        resetQuiz()
                    }}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all mb-2"
                >
                    <ArrowLeft className="w-5 h-5 text-[var(--color-base-content)]" />
                    Exit
                </button>
                <h1 className="text-2xl font-bold text-[var(--color-base-content)]">{quizData.title}</h1>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">
                {t('startQuiz.question')} {currentQuestionIndex + 1} {t('startQuiz.of')} {quizData.questions.length}
                </p>
            </div>

            {quizData.timeLimit > 0 && timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg ${
                timeRemaining < 60
                    ? 'bg-[var(--color-error)] text-[var(--color-error-content)] animate-pulse'
                    : 'bg-[var(--color-secondary)] text-[var(--color-secondary-content)]'
                }`}>
                <Clock className="w-6 h-6" />
                {formatTime(timeRemaining)}
                </div>
            )}
            </div>

            <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--color-base-content)]">
                {t('startQuiz.progress')} {Math.round(progress)}%
                </span>
                <span className="text-sm font-medium text-[var(--color-base-content)]">
                {currentQuestion?.points} {t('startQuiz.points').toLowerCase()}
                </span>
            </div>
            <div className="w-full h-3 bg-[var(--color-base-300)] rounded-full overflow-hidden">
                <div
                className="h-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] transition-all duration-500"
                style={{ width: `${progress}%` }}
                ></div>
            </div>
            </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 pb-12">
            {isOpen && <QuizResultModal />}

            <div className="max-w-3xl mx-auto">
            <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl p-8 shadow-xl">

                <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-accent)] text-white flex items-center justify-center font-bold text-lg">
                    {currentQuestionIndex + 1}
                    </div>
                    <span className="px-4 py-2 rounded-full bg-[var(--color-warning)] text-[var(--color-warning-content)] text-sm font-bold">
                    {currentQuestion?.points} {t('startQuiz.points')}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-base-content)]">
                    {currentQuestion?.question}
                </h2>
                </div>

                <div className="space-y-3 mb-8">
                {currentQuestion?.options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === index;
                    return (
                    <button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        className={`cursor-pointer w-full px-6 py-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                        isSelected
                            ? 'bg-[var(--color-secondary)] text-[var(--color-secondary-content)] border-2 border-[var(--color-secondary)] shadow-lg scale-105'
                            : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent hover:border-[var(--color-secondary)] hover:scale-102'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold ${
                        isSelected
                            ? 'border-[var(--color-secondary-content)] bg-[var(--color-secondary-content)] text-[var(--color-secondary)]'
                            : 'border-[var(--color-base-content)] border-opacity-30 text-[var(--color-base-content)]'
                        }`}>
                        {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg font-medium">{option}</span>
                    </button>
                    );
                })}
                </div>

                <div className="flex justify-between items-center">
                <div className="text-sm text-[var(--color-base-content)] opacity-60">
                    {Object.keys(selectedAnswers).length} {t('startQuiz.of')} {quizData.questions.length} {t('startQuiz.answered')}
                </div>

                <button
                    onClick={handleNext}
                    disabled={!isAnswerSelected}
                    className={`cursor-pointer px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    isAnswerSelected
                        ? 'bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] text-white hover:scale-105 shadow-lg'
                        : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
                    }`}
                >
                    {currentQuestionIndex === quizData.questions.length - 1 ? t('startQuiz.submit') : t('startQuiz.next')}
                    <ChevronRight className="w-5 h-5" />
                </button>
                </div>
            </div>

            {!isAnswerSelected && (
                <p className="text-center mt-4 text-sm text-[var(--color-base-content)] opacity-60">
                {t('startQuiz.tip')}
                </p>
            )}
            </div>
        </div>
        </div>
    );
}