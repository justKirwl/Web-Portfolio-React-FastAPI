import { CheckCircle, X, ArrowLeft, RefreshCw, Download, Star } from 'lucide-react';
import { useStartSurveyStore } from '../stores/StartSurveyStore';
import { useParams } from 'react-router-dom';
import { useSurveyResultStore } from '../stores/SurveyResultStore';
import { useEffect } from 'react';
import { useTranslation } from '../../node_modules/react-i18next';
import { useSurveyDetailStore } from '../stores/SurveyDetailStore';

export default function SurveyResult() {
    const { answers, surveyData, userId } = useStartSurveyStore()
    const { isOpen, setIsOpen: onClose, resetSurveyData, isRatingSubmitted, hoveredRating, setHoveredRating, selectedRating, setSelectedRating, submitRating } = useSurveyResultStore()
    const { requestAgain, isRequestSending, isRequestSent } = useSurveyDetailStore()
    const params = useParams()
    const { t } = useTranslation()

    if (!isOpen) return null;

    useEffect(() => {
        if (isRequestSent) {
            setTimeout(() => {
                useSurveyDetailStore.setState(state => ({ ...state, isRequestSent: false }))
            }, 3000)
        }
    }, [isRequestSent])

    const handleRatingClick = (rating: number) => {
        setSelectedRating(rating);
        submitRating(params.id!, rating);
    }

    const getAnswerDisplay = (question: Object) => {
        const answer = answers[question.id];
        
        if (!answer) return <span className="text-[var(--color-base-content)] opacity-50 italic">{t('surveyResult.notAnswered')}</span>;

        switch (question.type) {
        case 'text':
        case 'textarea':
        case 'date':
            return <p className="text-[var(--color-base-content)] font-medium">{answer}</p>;
        
        case 'multiple':
            return <p className="text-[var(--color-base-content)] font-medium">{answer}</p>;
        
        case 'checkbox':
            return (
            <div className="flex flex-wrap gap-2">
                {answer.map((item: string, idx: number) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] text-sm font-medium">
                    {item}
                </span>
                ))}
            </div>
            );
        
        case 'rating':
            return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-6 h-6 ${
                    star <= answer
                        ? 'fill-[var(--color-warning)] text-[var(--color-warning)]'
                        : 'text-[var(--color-base-content)] opacity-20'
                    }`}
                />
                ))}
            </div>
            );
        
        default:
            return <p className="text-[var(--color-base-content)] font-medium">{String(answer)}</p>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

            <div className="relative bg-[var(--color-primary)] p-8 text-white">
            <button
                onClick={() => onClose(false)}
                className="cursor-pointer absolute top-4 right-4 p-2 rounded-lg hover:opacity-85 hover:bg-opacity-20 transition-all"
            >
                <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-[var(--color-success)]" />
                </div>
                <div>
                <h2 className="text-3xl font-bold">{t('surveyResult.title')}</h2>
                <p className="text-lg opacity-90">{t('surveyResult.desc')}</p>
                </div>
            </div>
            
            <div className="bg-[var(--color-primary)] bg-opacity-20 rounded-lg p-4 backdrop-blur">
                <p className="text-sm opacity-90 mb-1">{t('surveyResult.survey')}</p>
                <p className="text-xl font-bold">{surveyData.title}</p>
            </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
            <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-6">{t('surveyResult.responses')}</h3>
            
            <div className="space-y-6">
                {surveyData.questions.map((question, index) => (
                <div
                    key={question.id}
                    className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-all"
                >
                    <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-content)] flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-[var(--color-base-content)] mb-3">
                        {question.question}
                        </h4>
                        <div className="pl-4 border-l-4 border-[var(--color-primary)]">
                        {getAnswerDisplay(question)}
                        </div>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[var(--color-primary)]">{surveyData.questions.length}</p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyResult.totalQuestions')}</p>
                </div>
                <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[var(--color-success)]">
                    {Object.keys(answers).length}
                </p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyResult.answered')}</p>
                </div>
                <div className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-[var(--color-secondary)]">{Math.round((Object.keys(answers).length / surveyData.questions.length) * 100)}%</p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('surveyResult.completion')}</p>
                </div>
            </div>

            {surveyData.authorId !== userId && (
                <div className="mt-8 bg-gradient-to-br from-[var(--color-warning)]/10 to-[var(--color-warning)]/5 border-2 border-[var(--color-warning)]/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-[var(--color-base-content)] mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                    {t('surveyResult.rateSurveyTitle')}
                </h4>
                <p className="text-sm text-[var(--color-base-content)] opacity-70 mb-4">
                    {t('surveyResult.rateSurveySubtitle')}
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
                    <span>{t('surveyResult.thanksForFeedback')}</span>
                    </div>
                )}
                </div>
            )}
            </div>

            <div className="border-t border-[var(--color-base-300)] p-6 bg-[var(--color-base-100)]">
            <div className="flex flex-wrap gap-3 justify-between">
                <div className="flex gap-3">
                <button
                    onClick={() => {
                        window.history.back()
                        resetSurveyData()
                    }}
                    className="cursor-pointer px-6 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all font-medium flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('surveyResult.buttonBack')}
                </button>
                
                <button
                    onClick={() => window.print()}
                    className="cursor-pointer px-6 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all font-medium flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    {t('surveyResult.downloadResults')}
                </button>
                </div>

                {surveyData.authorId !== userId && <button
                disabled={isRequestSent}
                onClick={() => requestAgain(params.id!)}
                className={`cursor-pointer px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    isRequestSent
                    ? 'bg-[var(--color-success)] text-[var(--color-success-content)]'
                    : 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105'
                }`}
                >
                {isRequestSent ? (
                    <>
                    <CheckCircle className="w-5 h-5" />
                    {t('surveyResult.requestSent')}
                    </>
                ) : isRequestSending ? <RefreshCw className='w-5 h-5 animate-spin'/> : (
                    <>
                    <RefreshCw className="w-5 h-5" />
                    {t('surveyResult.retake')}
                    </>
                )}
                </button>}
            </div>

            <p className="text-center text-sm text-[var(--color-base-content)] opacity-60 mt-4">
                {t('surveyResult.tip')}
            </p>
            </div>
        </div>
        </div>
    );
    }