import { useEffect, useRef } from 'react';
import { Trophy, CheckCircle, XCircle, ArrowLeft, RefreshCw, Target, Award, Star } from 'lucide-react';
import { Chart } from 'chart.js/auto';
import { useStartQuizStore } from '../stores/StartQuizStore';
import { useQuizResultStore } from '../stores/QuizResultStore';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '../stores/QuizStore';
import { useTranslation } from '../../node_modules/react-i18next';

export default function QuizResultModal() {
    const { quizData: displayQuiz, selectedAnswers: displayAnswers, totalPoints, resetQuiz, userId } = useStartQuizStore()
    const { isOpen, setIsOpen: onClose, results: displayResults, setResults, isRetakeLoading, setRetakeLoading, getResults, hoveredRating, setHoveredRating, isRatingSubmitted, selectedRating, setSelectedRating, submitRating } = useQuizResultStore()
    const { requestAgain } = useQuizStore()
    const pieChartRef = useRef<HTMLCanvasElement | null>(null);
    const barChartRef = useRef<HTMLCanvasElement | null>(null);
    const pieChartInstance = useRef<Chart | null>(null);
    const barChartInstance = useRef<Chart | null>(null);
    const isResultsSet = useRef<boolean>(false)
    const navigate = useNavigate()
    const params = useParams()
    const { t } = useTranslation()

    useEffect(() => {
        if (isOpen && pieChartRef.current && barChartRef.current) {

        if (pieChartInstance.current) pieChartInstance.current.destroy();
        if (barChartInstance.current) barChartInstance.current.destroy();

        const pieCtx = pieChartRef.current.getContext('2d');
        if (!pieCtx) return
        
        pieChartInstance.current = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
            labels: [t('quizResult.correct'), t('quizResult.incorrect')],
            datasets: [{
                data: [
                displayResults.correctAnswers,
                displayResults.totalQuestions - displayResults.correctAnswers
                ],
                backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 0
            }]
            },
            options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                position: 'bottom',
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: { size: 14 }
                }
                }
            }
            }
        });

        const pointsData = displayQuiz.questions.map((q, idx) => ({
            earned: displayAnswers[q.id] === q.correctAnswer ? q.points : 0,
            possible: q.points
        }));

        const barCtx = barChartRef.current.getContext('2d');
        if (!barCtx) return

        barChartInstance.current = new Chart(barCtx, {
            type: 'bar',
            data: {
            labels: displayQuiz.questions.map((_, i) => `Q${i + 1}`),
            datasets: [
                {
                label: t('quizResult.pointsEarned'),
                data: pointsData.map(p => p.earned),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderRadius: 8
                },
                {
                label: t('quizResult.pointsPossible'),
                data: pointsData.map(p => p.possible),
                backgroundColor: 'rgba(100, 116, 139, 0.3)',
                borderRadius: 8
                }
            ]
            },
            options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.8)' }
                },
                y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.8)' }
                }
            },
            plugins: {
                legend: {
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: { size: 12 }
                }
                }
            }
            }
        });
        }

        return () => {
        if (pieChartInstance.current) pieChartInstance.current.destroy();
        if (barChartInstance.current) barChartInstance.current.destroy();
        };
    }, [isOpen, displayQuiz, displayAnswers, displayResults]);

    useEffect(() => {
        if (isResultsSet.current) return

        const res = getResults(displayQuiz, displayAnswers, totalPoints)

        setResults({ ...res, totalPoints: totalPoints })

        isResultsSet.current = true;
    }, [])

    const handleRatingClick = (rating: number) => {
        setSelectedRating(rating);
        submitRating(params.id!, rating);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray bg-opacity-60 backdrop-blur-sm">
        <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

            <div className={`relative p-8 text-white ${
            displayResults.passed
                ? 'bg-gradient-to-br from-[var(--color-success)] to-[var(--color-primary)]'
                : 'bg-gradient-to-br from-[var(--color-error)] to-[var(--color-warning)]'
            }`}>

            <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                {displayResults.passed ? (
                    <Trophy className="w-12 h-12 text-[var(--color-success)]" />
                ) : (
                    <Target className="w-12 h-12 text-[var(--color-error)]" />
                )}
                </div>
                <div>
                <h2 className="text-4xl font-bold mb-2">
                    {displayResults.passed ? `${t('quizResult.congratulations')} 🎉` : t('quizResult.quizCompleted')}
                </h2>
                <p className="text-lg opacity-90">
                    {displayResults.passed
                    ? t('quizResult.passed')
                    : `${t('quizResult.youNeed')} ${displayQuiz.passingScore}% ${t('quizResult.toPass')}`}
                </p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-transparent bg-opacity-20 rounded-xl p-4 backdrop-blur text-center border-1">
                <p className="text-3xl font-bold">{displayResults.percentage}%</p>
                <p className="text-sm opacity-80">{t('quizResult.score')}</p>
                </div>
                <div className="bg-transparent bg-opacity-20 rounded-xl p-4 backdrop-blur text-center border-1">
                <p className="text-3xl font-bold">{displayResults.score}/{displayResults.totalPoints}</p>
                <p className="text-sm opacity-80">{t('quizResult.points')}</p>
                </div>
                <div className="bg-transparent bg-opacity-20 rounded-xl p-4 backdrop-blur text-center border-1">
                <p className="text-3xl font-bold">{displayResults.correctAnswers}/{displayResults.totalQuestions}</p>
                <p className="text-sm opacity-80">{t('quizResult.correct')}</p>
                </div>
                <div className="bg-transparent bg-opacity-20 rounded-xl p-4 backdrop-blur text-center border-1">
                <p className="text-3xl font-bold">{displayQuiz.passingScore}%</p>
                <p className="text-sm opacity-80">{t('quizResult.required')}</p>
                </div>
            </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-6">
                <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4 text-center">
                    {t('quizResult.answerDistribution')}
                </h3>
                <div className="max-w-xs mx-auto">
                    <canvas ref={pieChartRef}></canvas>
                </div>
                </div>

                <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-6">
                <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4 text-center">
                    {t('quizResult.pointsPerQuestion')}
                </h3>
                <canvas ref={barChartRef}></canvas>
                </div>
            </div>

            <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-6">{t('quizResult.review')}</h3>
            <div className="space-y-4">
                {displayQuiz.questions.map((question, index) => {
                const isCorrect = displayAnswers[question.id] === question.correctAnswer;
                const userAnswer = displayAnswers[question.id];

                return (
                    <div
                    key={question.id}
                    className={`border-2 rounded-xl p-6 ${
                        isCorrect
                        ? 'bg-[var(--color-success)] bg-opacity-10 border-[var(--color-success)]'
                        : 'bg-[var(--color-error)] bg-opacity-10 border-[var(--color-error)]'
                    }`}
                    >
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCorrect ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'
                        }`}>
                        {isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                            <XCircle className="w-6 h-6 text-white" />
                        )}
                        </div>
                        <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-[var(--color-base-content)]">{t('quizResult.question')} {index + 1}</span>
                            <span className="px-2 py-1 rounded bg-[var(--color-warning)] text-[var(--color-warning-content)] text-xs font-bold">
                            {question.points} {t('quizResult.pts')}
                            </span>
                            {isCorrect && (
                            <span className="px-2 py-1 rounded bg-[var(--color-success)] text-[var(--color-success-content)] text-xs font-bold">
                                +{question.points} {t('quizResult.earned')}
                            </span>
                            )}
                        </div>
                        <p className="text-[var(--color-base-content)] font-medium mb-3">{question.question}</p>

                        <div className="space-y-2">
                            {question.options.map((option, optIdx) => {
                            const isUserAnswer = userAnswer === optIdx;
                            const isCorrectAnswer = question.correctAnswer === optIdx;

                            return (
                                <div
                                key={optIdx}
                                className={`px-4 py-2 rounded-lg ${
                                    isCorrectAnswer
                                    ? 'bg-[var(--color-success)] bg-opacity-20 border-2 border-[var(--color-success)]'
                                    : isUserAnswer
                                    ? 'bg-[var(--color-error)] bg-opacity-20 border-2 border-[var(--color-error)]'
                                    : 'bg-[var(--color-base-300)]'
                                }`}
                                >
                                <span className="text-[var(--color-base-content)]">
                                    {isCorrectAnswer && '✓ '}
                                    {isUserAnswer && !isCorrectAnswer && '✗ '}
                                    {option}
                                </span>
                                </div>
                            );
                            })}
                        </div>

                        {question.explanation && (
                            <div className="mt-3 p-3 bg-[var(--color-info)] bg-opacity-10 border-l-4 border-[var(--color-info)] rounded">
                            <p className="text-sm text-[var(--color-base-content)]">
                                <span className="font-bold">💡 {t('quizResult.explanation')}</span> {question.explanation}
                            </p>
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>

            <div className="mt-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                <Award className="w-10 h-10" />
                <h3 className="text-2xl font-bold">{t('quizResult.summary')}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <p className="text-3xl font-bold">{displayResults.percentage}%</p>
                    <p className="text-sm opacity-80">{t('quizResult.accuracy')}</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold">{Math.round((displayResults.correctAnswers / displayResults.totalQuestions) * 100)}%</p>
                    <p className="text-sm opacity-80">{t('quizResult.completion')}</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold">{displayResults.score}</p>
                    <p className="text-sm opacity-80">{t('quizResult.pointsEarned')}</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold">
                    {displayResults.passed ? '✓' : '✗'}
                    </p>
                    <p className="text-sm opacity-80">{t('quizResult.status')}</p>
                </div>
                </div>
            </div>

            {displayQuiz.authorId !== userId && (
                <div className="mt-8 bg-gradient-to-br from-[var(--color-warning)]/10 to-[var(--color-warning)]/5 border-2 border-[var(--color-warning)]/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-[var(--color-base-content)] mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                    {t('quizResult.rateQuiz')}
                </h4>
                <p className="text-sm text-[var(--color-base-content)] opacity-70 mb-4">
                    {t('quizResult.rateSubtitle')}
                </p>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                        key={rating}
                        onClick={() => handleRatingClick(rating)}
                        onMouseEnter={() => setHoveredRating(rating)}
                        onMouseLeave={() => setHoveredRating(0)}
                        disabled={isRatingSubmitted}
                        className="transition-all hover:scale-110 disabled:cursor-not-allowed"
                    >
                        <Star
                        className={`w-10 h-10 transition-all ${
                            rating <= (hoveredRating || selectedRating)
                            ? 'fill-[var(--color-warning)] text-[var(--color-warning)] scale-110'
                            : 'text-[var(--color-base-content)] opacity-30'
                        }`}
                        />
                    </button>
                    ))}
                    {selectedRating > 0 && (
                    <span className="ml-3 text-sm font-semibold text-[var(--color-base-content)]">
                        {selectedRating} / 5
                    </span>
                    )}
                </div>
                {isRatingSubmitted && (
                    <div className="mt-4 flex items-center gap-2 text-[var(--color-success)] font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>{t('quizResult.thanksForFeedback')}</span>
                    </div>
                )}
                </div>
            )}
            </div>

            <div className="border-t border-[var(--color-base-300)] p-6 bg-[var(--color-base-100)] flex flex-wrap gap-3 justify-between">
            <button
                onClick={() => {
                    onClose(false)
                    navigate(displayQuiz.authorId === userId ? `/dashboard/quiz/${params.id}` : `/items?quizId=${params.id}`)
                    resetQuiz()
                }}
                className="cursor-pointer px-6 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all font-medium flex items-center gap-2"
            >
                <ArrowLeft className="w-5 h-5" />
                {t('quizResult.backButton')}
            </button>

            <div className="flex gap-3">
                <button
                onClick={() => window.print()}
                className="cursor-pointer px-6 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all font-medium"
                >
                {t('quizResult.downloadResults')}
                </button>
                
                {userId !== displayQuiz.authorId && <button
                onClick={async () => {
                    setRetakeLoading(true)
                    await requestAgain(params.id!)
                    setRetakeLoading(false)
                }}
                className="cursor-pointer px-6 py-3 rounded-xl bg-[var(--color-secondary)] text-[var(--color-secondary-content)] hover:scale-105 transition-all font-bold flex items-center gap-2"
                >
                <RefreshCw className={`w-5 h-5 ${isRetakeLoading && 'animate-spin'}`} />
                {!isRetakeLoading && t('quizResult.retakeQuiz')}
                </button>}
            </div>
            </div>
        </div>
        </div>
    );
}