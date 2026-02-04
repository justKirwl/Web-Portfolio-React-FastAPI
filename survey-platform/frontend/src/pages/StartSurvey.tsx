import { ChevronRight, SkipForward, CheckCircle, Star, Calendar, ArrowLeft } from 'lucide-react';
import { useStartSurveyStore } from '../stores/StartSurveyStore';
import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSurveyResultStore } from '../stores/SurveyResultStore';
import SurveyResult from '../components/SurveyResult';
import { useTranslation } from '../../node_modules/react-i18next';

export default function StartSurvey() {
  const { surveyData, currentQuestionIndex, answers, setAnswers, setCurrentQuestionIndex, fetchSurvey, currentQuestion, progress, addResponse, userId } = useStartSurveyStore()
  const { isOpen, setIsOpen } = useSurveyResultStore()
  const isFetched = useRef<boolean>(false)
  const params = useParams()
  const { t } = useTranslation()
  
  const isAnswered = () => {
    const answer = answers[currentQuestion?.id];
    if (!answer) return false;
    
    if (currentQuestion?.type === 'checkbox') {
      return answer.length > 0;
    }
    if (currentQuestion?.type === 'text' || currentQuestion?.type === 'textarea') {
      return answer.trim().length > 0;
    }
    return true;
  };

  const canContinue = isAnswered();

  const handleAnswer = (value: string | number | Array<string>) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleCheckboxChange = (option) => {
    const currentAnswers = answers[currentQuestion.id] || [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(a => a !== option)
      : [...currentAnswers, option];
    handleAnswer(newAnswers);
  };

  const handleContinue = async () => {
    if (currentQuestionIndex < surveyData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (surveyData.authorId !== userId) {
        await addResponse(params.id)  
      }
      setIsOpen(true)
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < surveyData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getTodayDateString = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (isFetched.current) return

    fetchSurvey(params.id)

    isFetched.current = true
  }, [])

  useEffect(() => {
    useStartSurveyStore.setState(state => ({ ...state, currentQuestion: surveyData.questions[currentQuestionIndex] }))
  }, [currentQuestionIndex])

  useEffect(() => {
    useStartSurveyStore.setState(state => ({ ...state, progress: (state.currentQuestionIndex / surveyData.questions.length) * 100 }))
  }, [currentQuestionIndex])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-base-100)] to-[var(--color-base-200)] relative overflow-hidden">

      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)] opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[var(--color-accent)] opacity-3 rounded-full blur-2xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--color-base-content)]" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-[var(--color-base-content)]">{surveyData.title}</h1>
            <p className="text-sm text-[var(--color-base-content)] opacity-60">{surveyData.description}</p>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-base-content)]">
              {t('startSurvey.question')} {currentQuestionIndex + 1} {t('startSurvey.of')} {surveyData.questions.length}
            </span>
            <span className="text-sm font-medium text-[var(--color-base-content)]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-3 bg-[var(--color-base-300)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pb-12">
        {isOpen && <SurveyResult />}

        <div className="max-w-3xl mx-auto">

          <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl p-8 shadow-xl">

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-content)] flex items-center justify-center font-bold text-lg">
                  {currentQuestionIndex + 1}
                </div>
                {currentQuestion?.required && (
                  <span className="px-3 py-1 rounded-full bg-[var(--color-error)] text-[var(--color-error-content)] text-xs font-bold">
                    {t('startSurvey.required')}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-base-content)] mb-2">
                {currentQuestion?.question}
              </h2>
            </div>

            <div className="mb-8">

              {currentQuestion?.type === 'text' && (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canContinue && handleContinue()}
                  placeholder={t('startSurvey.textPlaceholder')}
                  className="w-full px-6 py-4 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] text-lg border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none transition-all"
                />
              )}

              {currentQuestion?.type === 'textarea' && (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canContinue && handleContinue()}
                  placeholder={t('startSurvey.textPlaceholder')}
                  rows={6}
                  className="w-full px-6 py-4 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] text-lg border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none resize-none transition-all"
                />
              )}

              {currentQuestion?.type === 'multiple' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      className={`cursor-pointer w-full px-6 py-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                        answers[currentQuestion.id] === option
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] border-2 border-[var(--color-primary)] shadow-lg scale-105'
                          : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent hover:border-[var(--color-primary)] hover:scale-102'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        answers[currentQuestion.id] === option
                          ? 'border-[var(--color-primary-content)] bg-[var(--color-primary-content)]'
                          : 'border-[var(--color-base-content)] border-opacity-30'
                      }`}>
                        {answers[currentQuestion.id] === option && (
                          <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></div>
                        )}
                      </div>
                      <span className="text-lg font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion?.type === 'checkbox' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isChecked = (answers[currentQuestion.id] || []).includes(option);
                    return (
                      <button
                        key={index}
                        onClick={() => handleCheckboxChange(option)}
                        className={`cursor-pointer w-full px-6 py-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                          isChecked
                            ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] border-2 border-[var(--color-primary)] shadow-lg'
                            : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent hover:border-[var(--color-primary)]'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isChecked
                            ? 'border-[var(--color-primary-content)] bg-[var(--color-primary-content)]'
                            : 'border-[var(--color-base-content)] border-opacity-30'
                        }`}>
                          {isChecked && (
                            <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
                          )}
                        </div>
                        <span className="text-lg font-medium">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion?.type === 'rating' && (
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleAnswer(rating)}
                      className="cursor-pointer transition-all hover:scale-125"
                    >
                      <Star
                        className={`w-16 h-16 ${
                          answers[currentQuestion.id] >= rating
                            ? 'fill-[var(--color-warning)] text-[var(--color-warning)]'
                            : 'text-[var(--color-base-content)] opacity-20'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion?.type === 'date' && (
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--color-base-content)] opacity-30" />
                  <input
                    type="date"
                    value={answers[currentQuestion.id] || ''}
                    max={getTodayDateString}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] text-lg border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                disabled={currentQuestionIndex === 0}
                className={`cursor-pointer px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  currentQuestionIndex === 0
                    ? 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
                    : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)]'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                {t('startSurvey.back')}
              </button>

              <div className="flex gap-3">
                {!currentQuestion?.required && (
                  <button
                    onClick={handleSkip}
                    className="cursor-pointer px-6 py-3 rounded-xl font-medium bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all flex items-center gap-2"
                  >
                    <SkipForward className="w-5 h-5" />
                    {t('startSurvey.skip')}
                  </button>
                )}

                <button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className={`cursor-pointer px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    canContinue
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105 shadow-lg'
                      : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
                  }`}
                >
                  {currentQuestionIndex === surveyData.questions.length - 1 ? t('startSurvey.submit') : t('startSurvey.continue')}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {currentQuestion?.required && !isAnswered() && (
            <p className="text-center mt-4 text-sm text-[var(--color-base-content)] opacity-60">
              {t('startSurvey.tip')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}