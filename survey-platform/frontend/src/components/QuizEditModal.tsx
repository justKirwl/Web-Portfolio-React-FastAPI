import { X, Plus, Trash2, GripVertical, CheckCircle, Trophy, Edit3, Save, Check, AlertCircle, Globe, Target, BookOpen, Lightbulb, Award } from 'lucide-react';
import { useTranslation } from '../../node_modules/react-i18next';
import { useQuizEditStore } from '../stores/QuizEditStore';
import { useEffect, useRef } from 'react';
import { difficulties, languages } from '../utils/surveyCreateTypes';

interface EditQuizProps {
    quizId: string
}

export default function EditQuizModal({ quizId }: EditQuizProps) {
  const { quizData, setQuizData, isLoading, editingQuestion, setCurrentQuestion, setEditingQuestion, currentQuestion, setOpen: setEditQuizVisible, fetchQuiz, updateQuiz, isSaved, resetData, errors, setErrors, topicInput, learningInput, requirementInput, setLearningInput, setRequirementInput, setTopicInput } = useQuizEditStore() 
  const { t } = useTranslation()
  const isFetched = useRef<boolean>(false)

  useEffect(() => {
    if (isFetched.current) return

    fetchQuiz(quizId)

    isFetched.current = true
  }, [])

  useEffect(() => {
    if (isSaved) {
        setTimeout(() => {
            useQuizEditStore.setState(state => ({ ...state, isSaved: false }))
            setEditQuizVisible(null)
            resetData()
        }, 2000)
    }
  }, [isSaved])

  const startEditingQuestion = (question: any) => {
    setEditingQuestion(question.id)
    setCurrentQuestion({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      points: question.points,
      explanation: question.explanation || ''
    })
  }

  const cancelEditing = () => {
    setEditingQuestion(null)
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
      explanation: ''
    })
  }

  const saveEditedQuestion = () => {
    const newErrors: { currentQuestion?: string, currentOptions?: string } = {};
    if (!currentQuestion.question.trim()) {
      newErrors.currentQuestion = t('quizEdit.addQuestionError.currentQuestion');
    }
    const filledOptions = currentQuestion.options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      newErrors.currentOptions = t('quizEdit.addQuestionError.currentOptions');
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setQuizData({
      ...quizData,
      questions: quizData.questions.map(q => 
        q.id === editingQuestion ? { ...currentQuestion, id: q.id } : q
      )
    });

    cancelEditing()
  }

  const addNewQuestion = () => {
    const newErrors: { currentQuestion?: string, currentOptions?: string } = {};

    if (!currentQuestion.question.trim()) {
      newErrors.currentQuestion = t('quizEdit.addQuestionError.currentQuestion');
    }

    const filledOptions = currentQuestion.options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      newErrors.currentOptions = t('quizEdit.addQuestionError.currentOptions');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return;
    }

    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { ...currentQuestion, id: Date.now() }]
    });

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
      explanation: ''
    });
  };

  const removeQuestion = (id: number) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter(q => q.id !== id)
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, '']
    });
  };

  const removeOption = (index: number) => {
    const newErrors: { currentOptions?: string } = {};

    if (currentQuestion.options.length <= 2) {
      newErrors.currentOptions = t('quizEdit.removeOptionError.currentOptions');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return;
    }

    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctAnswer: currentQuestion.correctAnswer >= newOptions.length ? 0 : currentQuestion.correctAnswer
    });
  };

  const addTopic = () => {
    if (topicInput.trim() && (quizData.topics?.length || 0) < 10) {
      setQuizData({
        ...quizData,
        topics: [...(quizData.topics || []), topicInput.trim()]
      });
      setTopicInput('');
    }
  };

  const removeTopic = (topic: string) => {
    setQuizData({
      ...quizData,
      topics: quizData.topics?.filter(t => t !== topic) || []
    });
  };

  const addLearning = () => {
    if (learningInput.trim() && (quizData.learnings?.length || 0) < 10) {
      setQuizData({
        ...quizData,
        learnings: [...(quizData.learnings || []), learningInput.trim()]
      });
      setLearningInput('');
    }
  };

  const removeLearning = (learning: string) => {
    setQuizData({
      ...quizData,
      learnings: quizData.learnings?.filter(l => l !== learning) || []
    });
  };

  const addRequirement = () => {
    if (requirementInput.trim() && (quizData.requirements?.length || 0) < 10) {
      setQuizData({
        ...quizData,
        requirements: [...(quizData.requirements || []), requirementInput.trim()]
      });
      setRequirementInput('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setQuizData({
      ...quizData,
      requirements: quizData.requirements?.filter(r => r !== requirement) || []
    });
  };

  const validateAndUpdate = () => {
    const newErrors: { title?: string, questions?: string, language?: string, difficulty?: string } = {};

    if (!quizData.title.trim()) newErrors.title = t('quizEdit.validateErrors.title');
    if (quizData.questions.length === 0) newErrors.questions = t('quizEdit.validateErrors.questions');
    if (!quizData.language) newErrors.language = t('quizEdit.validateErrors.language');
    if (!quizData.difficulty) newErrors.difficulty = t('quizEdit.validateErrors.difficulty');
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    updateQuiz(quizId);
  };

  const totalPoints = quizData.questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray backdrop-blur-sm bg-opacity-50">
      <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between p-6 border-b border-[var(--color-base-300)]">
          <div className='flex items-center gap-4'>
            <div>
              <Edit3 className="w-10 h-10 text-[var(--color-warning)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-base-content)]">{t('quizEdit.title')}</h2>
              <p className="text-sm text-[var(--color-base-content)] opacity-60 mt-1">{t('quizEdit.desc')}</p>
            </div>  
          </div>
          <button
            onClick={() => {
                setEditQuizVisible(null)
                resetData()
            }}
            className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all"
          >
            <X className="w-6 h-6 text-[var(--color-base-content)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                {t('quizCreate.quizTitle')} *
              </label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) => {
                  setQuizData({ ...quizData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder={t('quizCreate.quizTitlePlaceholder')}
                className={`${errors.title ? 'border-red-500' : 'border-transparent'} w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none`}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                {t('quizCreate.description')} ({t('quizCreate.optional')})
              </label>
              <textarea
                value={quizData.description}
                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                placeholder={t('quizCreate.descriptionPlaceholder')}
                rows={2}
                className="w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--color-primary)]" />
                  {t('quizEdit.language')} *
                </label>
                <select
                  value={quizData.language || ''}
                  onChange={(e) => {
                    setQuizData({ ...quizData, language: e.target.value });
                    if (errors.language) setErrors({ ...errors, language: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 ${
                    errors.language ? 'border-red-500' : 'border-transparent'
                  } focus:border-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer`}
                >
                  <option value="">{t('quizEdit.selectLanguage')}</option>
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
                {errors.language && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.language}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--color-primary)]" />
                  {t('quizEdit.difficulty')} *
                </label>
                <select
                  value={quizData.difficulty || ''}
                  onChange={(e) => {
                    setQuizData({ ...quizData, difficulty: e.target.value });
                    if (errors.difficulty) setErrors({ ...errors, difficulty: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 ${
                    errors.difficulty ? 'border-red-500' : 'border-transparent'
                  } focus:border-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer`}
                >
                  <option value="">{t('quizEdit.selectDifficulty')}</option>
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>
                      {diff.icon} {diff.label} - {diff.description}
                    </option>
                  ))}
                </select>
                {errors.difficulty && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.difficulty}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                {t('quizEdit.topicsCovered')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                  placeholder={t('quizEdit.topicsPlaceholder')}
                  disabled={(quizData.topics?.length || 0) >= 10}
                  className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={addTopic}
                  disabled={(quizData.topics?.length || 0) >= 10 || !topicInput.trim()}
                  className="px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {quizData.topics && quizData.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {quizData.topics.map((topic, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-info)]/10 border border-[var(--color-info)]/30 text-[var(--color-info)] text-sm font-medium">
                      {topic}
                      <button onClick={() => removeTopic(topic)} className="hover:bg-[var(--color-info)]/20 rounded-full p-0.5 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-[var(--color-base-content)] opacity-60 mt-2">
                {t('quizEdit.topicsAdded', { count: quizData.topics.length || 0 })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)] flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--color-primary)]" />
                {t('quizEdit.learningsCovered')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={learningInput}
                  onChange={(e) => setLearningInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearning())}
                  placeholder={t('quizEdit.learningsPlaceholder')}
                  disabled={(quizData.learnings?.length || 0) >= 10}
                  className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={addLearning}
                  disabled={(quizData.learnings?.length || 0) >= 10 || !learningInput.trim()}
                  className="px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {quizData.learnings && quizData.learnings.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {quizData.learnings.map((learning, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] text-sm font-medium">
                      ✓ {learning}
                      <button onClick={() => removeLearning(learning)} className="hover:bg-[var(--color-success)]/20 rounded-full p-0.5 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-[var(--color-base-content)] opacity-60 mt-2">
                {t('quizEdit.learningsAdded', { count: quizData.learnings.length || 0 })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)] flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[var(--color-primary)]" />
                {t('quizEdit.requirementsCovered')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  placeholder={t('quizEdit.requirementsPlaceholder')}
                  disabled={(quizData.requirements?.length || 0) >= 10}
                  className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={addRequirement}
                  disabled={(quizData.requirements?.length || 0) >= 10 || !requirementInput.trim()}
                  className="px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {quizData.requirements && quizData.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {quizData.requirements.map((req, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-[var(--color-warning)] text-sm font-medium">
                      ⚠ {req}
                      <button onClick={() => removeRequirement(req)} className="hover:bg-[var(--color-warning)]/20 rounded-full p-0.5 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-[var(--color-base-content)] opacity-60 mt-2">
                {t('quizEdit.requirementsAdded', { count: quizData.requirements.length || 0 })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                  {t('quizCreate.timeLimit')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                  {t('quizCreate.passingScore')} (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quizData.passingScore}
                  onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={quizData.shuffleQuestions}
                  onChange={(e) => setQuizData({ ...quizData, shuffleQuestions: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="shuffleQuestions" className="text-sm text-[var(--color-base-content)] cursor-pointer">
                  {t('quizCreate.shuffleQuestions')}
                </label>
              </div>
            </div>
          </div>

          {quizData.questions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--color-base-content)]">
                  {t('quizCreate.questions')} ({quizData.questions.length})
                </h3>
                <div className="flex items-center gap-2 text-sm text-[var(--color-base-content)] opacity-60">
                  <Trophy className="w-4 h-4" />
                  {t('quizCreate.total')} {totalPoints} {t('quizCreate.points')}
                </div>
              </div>
              {quizData.questions.map((q, index) => (
                <div key={q.id} className={`border-2 rounded-lg p-4 transition-all ${
                  editingQuestion === q.id 
                    ? 'bg-[var(--color-warning)]/5 border-[var(--color-warning)]' 
                    : 'bg-[var(--color-base-100)] border-[var(--color-base-300)]'
                }`}>
                  {editingQuestion === q.id ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-[var(--color-base-content)] opacity-60">
                          {t('quizEdit.editing')} {t('quizEdit.q')}{index + 1}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={cancelEditing}
                            className="cursor-pointer px-3 py-1.5 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all text-sm"
                          >
                            {t('quizCreate.cancel')}
                          </button>
                          <button
                            onClick={saveEditedQuestion}
                            className="cursor-pointer px-3 py-1.5 rounded-lg bg-[var(--color-success)] text-white hover:scale-105 transition-all text-sm flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            {t('quizEdit.save')}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                          {t('quizCreate.text')} *
                        </label>
                        <input
                          type="text"
                          value={currentQuestion.question}
                          onChange={(e) => {
                            setCurrentQuestion({ ...currentQuestion, question: e.target.value });
                            if (errors.currentQuestion) setErrors({ ...errors, currentQuestion: '' });
                          }}
                          placeholder="Enter your question"
                          className={`${errors.currentQuestion ? 'border-red-500' : 'border-transparent'} w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none`}
                        />

                        {errors.currentQuestion && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.currentQuestion}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                          {t('quizCreate.options')}
                        </label>
                        <div className="space-y-2">
                          {currentQuestion.options.map((option, idx) => (
                            <div key={idx} className="flex gap-2">
                              <label className="flex items-center gap-2 flex-1 px-4 py-2 rounded-lg bg-[var(--color-base-300)] cursor-pointer">
                                <input
                                  type="radio"
                                  name="correctAnswer-edit"
                                  checked={currentQuestion.correctAnswer === idx}
                                  onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                                  className="w-4 h-4"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(idx, e.target.value)}
                                  placeholder={`${t('quizCreate.option')} ${idx + 1}`}
                                  className="flex-1 bg-transparent text-[var(--color-base-content)] focus:outline-none"
                                />
                              </label>
                              {currentQuestion.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(idx)}
                                  className="cursor-pointer px-3 py-2 rounded-lg bg-[var(--color-error)] text-[var(--color-error-content)] hover:scale-105 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={addOption}
                            className="cursor-pointer w-full px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            {t('quizCreate.addOption')}
                          </button>
                        </div>

                        {errors.currentOptions && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.currentOptions}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                            {t('quizCreate.points').replace(t('quizCreate.points')[0], t('quizCreate.points')[0].toUpperCase())}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={currentQuestion.points}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                          {t('quizCreate.optionalExplanation')}
                        </label>
                        <textarea
                          value={currentQuestion.explanation}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                          placeholder={t('quizCreate.explanationPlaceholder')}
                          rows={2}
                          className="w-full px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <GripVertical className="w-5 h-5 text-[var(--color-base-content)] opacity-30 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-[var(--color-base-content)] opacity-60">{t('quizEdit.q')}{index + 1}</span>
                            <span className="text-xs px-2 py-1 rounded bg-[var(--color-secondary)] text-[var(--color-secondary-content)]">
                              {q.points} {q.points === 1 ? t('quizCreate.point') : t('quizCreate.points')}
                            </span>
                          </div>
                          <p className="text-[var(--color-base-content)] font-medium mb-3">{q.question}</p>
                          <div className="space-y-2">
                            {q.options.filter(opt => opt.trim()).map((opt, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                  i === q.correctAnswer
                                    ? 'bg-[var(--color-success)] bg-opacity-20 border border-[var(--color-success)]'
                                    : 'bg-[var(--color-base-200)]'
                                }`}
                              >
                                {i === q.correctAnswer && (
                                  <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
                                )}
                                <span className="text-sm text-[var(--color-base-content)]">{opt}</span>
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <p className="text-sm text-[var(--color-base-content)] opacity-70 mt-3 italic">
                              {t('quizCreate.explanation')} {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditingQuestion(q)}
                          className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-warning)] hover:text-white transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-error)] hover:text-[var(--color-error-content)] transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {editingQuestion === null && (
            <div className="space-y-4 border-2 border-dashed border-[var(--color-base-300)] rounded-lg p-6">
              <h3 className="text-lg font-bold text-[var(--color-base-content)]">{t('quizCreate.addNewQuestion')}</h3>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                  {t('quizCreate.text')} *
                </label>
                <input
                  type="text"
                  value={currentQuestion.question}
                  onChange={(e) => {
                    setCurrentQuestion({ ...currentQuestion, question: e.target.value });
                    if (errors.currentQuestion) setErrors({ ...errors, currentQuestion: '' });
                  }}
                  placeholder={t('quizEdit.textPlaceholder')}
                  className={`${errors.currentQuestion ? 'border-red-500' : 'border-transparent'} w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none`}
                />

                {errors.currentQuestion && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.currentQuestion}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                  {t('quizCreate.options')}
                </label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <label className="flex items-center gap-2 flex-1 px-4 py-2 rounded-lg bg-[var(--color-base-300)] cursor-pointer">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`${t('quizCreate.option')} ${index + 1}`}
                          className="flex-1 bg-transparent text-[var(--color-base-content)] focus:outline-none"
                        />
                      </label>
                      {currentQuestion.options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="cursor-pointer px-3 py-2 rounded-lg bg-[var(--color-error)] text-[var(--color-error-content)] hover:scale-105 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="cursor-pointer w-full px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('quizCreate.addOption')}
                  </button>
                </div>
              </div>

              {errors.questions && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500 font-medium">{errors.questions}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                    {t('quizCreate.points').replace(t('quizCreate.points')[0], t('quizCreate.points')[0].toUpperCase())}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                  {t('quizCreate.optionalExplanation')}
                </label>
                <textarea
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                  placeholder={t('quizCreate.explanationPlaceholder')}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={addNewQuestion}
                className="cursor-pointer w-full px-6 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                {t('quizCreate.addQuestion')}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-[var(--color-base-300)]">
          <div className="text-sm text-[var(--color-base-content)] opacity-60">
            <p>{quizData.questions.length} {quizData.questions.length > 1 ? t('quizEdit.questions') : t('quizEdit.question')} • {totalPoints} {t('quizCreate.totalPoints')}</p>
            {quizData.timeLimit > 0 && <p>{t('quizCreate.timeLimitText')} {quizData.timeLimit} {t('quizCreate.minutes')}</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditQuizVisible(null)
                resetData()
            }}
              className="cursor-pointer px-6 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all font-medium"
            >
              {t('quizCreate.cancel')}
            </button>
            <button
              onClick={validateAndUpdate}
              disabled={editingQuestion !== null || isLoading || isSaved}
              className={`cursor-pointer px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                editingQuestion !== null
                  ? 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
                  : 'bg-[var(--color-success)] text-white hover:scale-105'
              }`}
            >
              {!isLoading ? isSaved ? (
                <>
                <Check className='w-4 h-4' />
                {t('quizEdit.updated')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('quizEdit.saveChanges')}
                </>
              ) : (
                <div className='loading'></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}