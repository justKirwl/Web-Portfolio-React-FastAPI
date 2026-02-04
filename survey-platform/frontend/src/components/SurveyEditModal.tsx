import { X, Plus, Trash2, GripVertical, Edit3, Save, Check, AlertCircle, Target, Tag, Globe } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from '../../node_modules/react-i18next';
import { useSurveyEditStore } from '../stores/SurveyEditStore';
import { difficulties, languages, questionTypes } from '../utils/surveyCreateTypes';

interface EditSurveyProps {
  surveyId: string
}

export default function EditSurveyModal({ surveyId }: EditSurveyProps) {
  const { surveyData, setSurveyData, isLoading, fetchSurveyData, setOpen: setEditSurveyVisible, currentQuestion, editingQuestion, setCurrentQuestion, setEditingQuestion, updateSurvey, isSaved, resetData, setErrors, setTagInput, errors, tagInput } = useSurveyEditStore()
  const { t } = useTranslation()
  const isFetched = useRef<boolean>(false)
  const language = localStorage.getItem('prefered_language') || 'en'

  useEffect(() => {
    if (isFetched.current) return
    fetchSurveyData(surveyId)
    isFetched.current = true
  }, [])
  
  useEffect(() => {
    if (isSaved) {
      setTimeout(() => {
        useSurveyEditStore.setState(state => ({ ...state, isSaved: false }))
        setEditSurveyVisible(null)
        resetData()
      }, 2000)
    }
  }, [isSaved])

  const startEditingQuestion = (question: { id: number, type: string, question: string, required: boolean, options: string[] }) => {
    setEditingQuestion(question.id)
    setCurrentQuestion({
      type: question.type,
      question: question.question,
      required: question.required,
      options: [...question.options]
    })
  }

  const cancelEditing = () => {
    setEditingQuestion(null)
    setCurrentQuestion({
      type: 'text',
      question: '',
      required: false,
      options: []
    })
    setErrors({});
  }

  const saveEditedQuestion = () => {
    const newErrors: { currentQuestion?: string, currentOptions?: string } = {};

    if (!currentQuestion.question.trim()) {
      newErrors.currentQuestion = t('surveyEdit.errors.questionRequired');
    }

    if ((currentQuestion.type === 'multiple' || currentQuestion.type === 'checkbox') && currentQuestion.options.length === 0) {
      newErrors.currentOptions = t('surveyEdit.errors.optionRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSurveyData('questions', surveyData.questions.map(q => q.id === editingQuestion ? { ...currentQuestion, id: q.id } : q));
    cancelEditing()
  }

  const addNewQuestion = () => {
    const newErrors: { currentQuestion?: string, currentOptions?: string } = {};

    if (!currentQuestion.question.trim()) {
      newErrors.currentQuestion = t('surveyEdit.errors.questionRequired');
    }

    if ((currentQuestion.type === 'multiple' || currentQuestion.type === 'checkbox') && currentQuestion.options.length === 0) {
      newErrors.currentOptions = t('surveyEdit.errors.optionsRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSurveyData('questions', [...surveyData.questions, { ...currentQuestion, id: Date.now() }]);

    setCurrentQuestion({
      type: 'text',
      question: '',
      required: false,
      options: []
    });

    setErrors({});
  };

  const removeQuestion = (id: number) => {
    setSurveyData('questions', surveyData.questions.filter(q => q.id !== id));
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, '']
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

  const removeOption = (index: number) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.filter((_, i) => i !== index)
    });
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);

    if (value.endsWith('#') && value.length > 1) {
      const newTag = value.slice(0, -1).trim();
      if (newTag && !surveyData.tags?.includes(newTag) && (surveyData.tags?.length || 0) < 5) {
        setSurveyData('tags', [...(surveyData.tags || []), newTag]);
        setTagInput('');
      } else {
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSurveyData('tags', surveyData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const validateAndUpdate = () => {
    const newErrors: { title?: string, questions?: string, language?: string, difficulty?: string } = {};

    if (!surveyData.title.trim()) {
      newErrors.title = t('surveyEdit.errors.titleRequired');
    }

    if (surveyData.questions.length === 0) {
      newErrors.questions = t('surveyEdit.errors.questionsRequired');
    }

    if (!surveyData.language) {
      newErrors.language = t('surveyEdit.errors.languageRequired');
    }

    if (!surveyData.difficulty) {
      newErrors.difficulty = t('surveyEdit.errors.difficultyRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateSurvey(surveyId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray backdrop-blur-sm bg-opacity-50">
      <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between p-6 border-b border-[var(--color-base-300)]">
          <div className='flex items-center gap-4'>
            <div>
              <Edit3 className="w-10 h-10 text-[var(--color-warning)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-base-content)]">{t('surveyEdit.title')}</h2>
              <p className="text-sm text-[var(--color-base-content)] opacity-60 mt-1">{t('surveyEdit.desc')}</p>
            </div>  
          </div>
          <button
            onClick={() => {
              setEditSurveyVisible(null)
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
                {t('surveyEdit.surveyTitle')} *
              </label>
              <input
                type="text"
                value={surveyData.title}
                onChange={(e) => {
                  setSurveyData(e.target.name, e.target.value);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                name='title'
                placeholder={t('surveyEdit.surveyTitlePlaceholder')}
                className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 ${
                  errors.title ? 'border-red-500' : 'border-transparent'
                } focus:border-[var(--color-primary)] focus:outline-none`}
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
                {t('surveyEdit.surveyDesc')} ({t('surveyEdit.optional')})
              </label>
              <textarea
                value={surveyData.description}
                onChange={(e) => setSurveyData(e.target.name, e.target.value)}
                name='description'
                placeholder={t('surveyEdit.surveyDescPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--color-primary)]" />
                  {t('surveyEdit.language')} *
                </label>
                <div className="relative">
                  <select
                    value={surveyData.language || ''}
                    onChange={(e) => {
                      setSurveyData('language', e.target.value);
                      if (errors.language) setErrors({ ...errors, language: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 ${
                      errors.language ? 'border-red-500' : 'border-transparent'
                    } focus:border-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer`}
                  >
                    <option value="">{t('surveyEdit.selectLanguage')}</option>
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.flag} {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {t('surveyEdit.difficulty')} *
                </label>
                <div className="relative">
                  <select
                    value={surveyData.difficulty || ''}
                    onChange={(e) => {
                      setSurveyData('difficulty', e.target.value);
                      if (errors.difficulty) setErrors({ ...errors, difficulty: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 ${
                      errors.difficulty ? 'border-red-500' : 'border-transparent'
                    } focus:border-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer`}
                  >
                    <option value="">{t('surveyEdit.selectDifficulty')}</option>
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>
                        {diff.icon} {diff.label} - {diff.description}
                      </option>
                    ))}
                  </select>
                </div>
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
                <Tag className="w-4 h-4 text-[var(--color-primary)]" />
                {t('surveyEdit.tagsLabel')}
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInput}
                placeholder={t('surveyEdit.tagsPlaceholder')}
                disabled={(surveyData.tags?.length || 0) >= 5}
                className="w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {surveyData.tags && surveyData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {surveyData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-sm font-medium"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-[var(--color-primary)]/20 rounded-full p-0.5 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-[var(--color-base-content)] opacity-60 mt-2">
                {t('surveyEdit.tagsAdded', { count: surveyData.tags.length || 0 })}
              </p>
            </div>
          </div>

          {surveyData.questions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[var(--color-base-content)]">{t('surveyEdit.questions')} ({surveyData.questions.length})</h3>
              {surveyData.questions.map((q, index) => (
                <div key={q.id} className={`border-2 rounded-lg p-4 transition-all ${
                  editingQuestion === q.id 
                    ? 'bg-[var(--color-warning)]/5 border-[var(--color-warning)]' 
                    : 'bg-[var(--color-base-100)] border-[var(--color-base-300)]'
                }`}>
                  {editingQuestion === q.id ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-[var(--color-base-content)] opacity-60">
                          {t('surveyEdit.editing')} {t('surveyEdit.q')}{index + 1}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={cancelEditing}
                            className="cursor-pointer px-3 py-1.5 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-90 transition-all text-sm"
                          >
                            {t('surveyEdit.cancel')}
                          </button>
                          <button
                            onClick={saveEditedQuestion}
                            className="cursor-pointer px-3 py-1.5 rounded-lg bg-[var(--color-success)] text-white hover:scale-105 transition-all text-sm flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            {t('surveyEdit.save')}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                          {t('surveyEdit.questionType')} *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {questionTypes.map(type => (
                            <button
                              key={type.value}
                              onClick={() => setCurrentQuestion({ ...currentQuestion, type: type.value, options: type.value === 'multiple' || type.value === 'checkbox' ? currentQuestion.options : [] })}
                              className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                                currentQuestion.type === type.value
                                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]'
                                  : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-90'
                              }`}
                            >
                              {type.icon}
                              <span className="font-medium">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                          {t('surveyEdit.questionText')} *
                        </label>
                        <input
                          type="text"
                          value={currentQuestion.question}
                          onChange={(e) => {
                            setCurrentQuestion({ ...currentQuestion, question: e.target.value });
                            if (errors.currentQuestion) setErrors({ ...errors, currentQuestion: '' });
                          }}
                          placeholder={t('surveyEdit.questionTextPlaceholder')}
                          className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 ${
                            errors.currentQuestion ? 'border-red-500' : 'border-transparent'
                          } focus:border-[var(--color-primary)] focus:outline-none`}
                        />
                        {errors.currentQuestion && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.currentQuestion}
                          </p>
                        )}
                      </div>

                      {(currentQuestion.type === 'multiple' || currentQuestion.type === 'checkbox') && (
                        <div>
                          <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                            {t('surveyEdit.options')} *
                          </label>
                          <div className="space-y-2">
                            {currentQuestion.options.map((option, idx) => (
                              <div key={idx} className="flex gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(idx, e.target.value)}
                                  placeholder={`Option ${idx + 1}`}
                                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none"
                                />
                                <button
                                  onClick={() => removeOption(idx)}
                                  className="cursor-pointer px-3 py-2 rounded-lg bg-[var(--color-error)] text-[var(--color-error-content)] hover:scale-105 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={addOption}
                              className="cursor-pointer w-full px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              {t('surveyEdit.addOption')}
                            </button>
                          </div>
                          {errors.currentOptions && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.currentOptions}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="required-edit"
                          checked={currentQuestion.required}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, required: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <label htmlFor="required-edit" className="text-sm text-[var(--color-base-content)] cursor-pointer">
                          {t('surveyEdit.makeRequired')}
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <GripVertical className="w-5 h-5 text-[var(--color-base-content)] opacity-30 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-[var(--color-base-content)] opacity-60">{t('surveyEdit.q')}{index + 1}</span>
                            <span className="text-xs px-2 py-1 rounded bg-[var(--color-primary)] text-[var(--color-primary-content)]">
                              {questionTypes.find(t => t.value === q.type)?.label}
                            </span>
                            {q.required && (
                              <span className="text-xs px-2 py-1 rounded bg-[var(--color-error)] text-[var(--color-error-content)]">
                                {t('surveyEdit.required')}
                              </span>
                            )}
                          </div>
                          <p className="text-[var(--color-base-content)] font-medium mb-2">{q.question}</p>
                          {(q.type === 'multiple' || q.type === 'checkbox') && (
                            <ul className="space-y-1 ml-4">
                              {q.options.map((opt, i) => (
                                <li key={i} className="text-sm text-[var(--color-base-content)] opacity-70">
                                  • {opt}
                                </li>
                              ))}
                            </ul>
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

          {errors.questions && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-500 font-medium">{errors.questions}</p>
            </div>
          )}

          {editingQuestion === null && (
            <div className="space-y-4 border-2 border-dashed border-[var(--color-base-300)] rounded-lg p-6">
              <h3 className="text-lg font-bold text-[var(--color-base-content)]">{t('surveyEdit.addNewQuestion')}</h3>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                  {t('surveyEdit.questionType')} *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {questionTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setCurrentQuestion({ ...currentQuestion, type: type.value, options: [] })}
                      className={`cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        currentQuestion.type === type.value
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]'
                          : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-90'
                      }`}
                    >
                      {type.icon}
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                  {t('surveyEdit.questionText')} *
                </label>
                <input
                  type="text"
                  value={currentQuestion.question}
                  onChange={(e) => {
                    setCurrentQuestion({ ...currentQuestion, question: e.target.value });
                    if (errors.currentQuestion) setErrors({ ...errors, currentQuestion: '' });
                  }}
                  placeholder={t('surveyEdit.questionTextPlaceholder')}
                  className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 ${
                    errors.currentQuestion ? 'border-red-500' : 'border-transparent'
                  } focus:border-[var(--color-primary)] focus:outline-none`}
                />
                {errors.currentQuestion && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.currentQuestion}
                  </p>
                )}
              </div>

              {(currentQuestion.type === 'multiple' || currentQuestion.type === 'checkbox') && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                    {t('surveyEdit.options')} *
                  </label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none"
                        />
                        <button
                          onClick={() => removeOption(index)}
                          className="cursor-pointer px-3 py-2 rounded-lg bg-[var(--color-error)] text-[var(--color-error-content)] hover:scale-105 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addOption}
                      className="cursor-pointer w-full px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t('surveyEdit.addOption')}
                    </button>

                    {errors.currentOptions && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.currentOptions}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={currentQuestion.required}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, required: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="required" className="text-sm text-[var(--color-base-content)] cursor-pointer">
                  {t('surveyEdit.makeRequired')}
                </label>
              </div>

              <button
                onClick={addNewQuestion}
                className="cursor-pointer w-full px-6 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                {t('surveyEdit.addQuestion')}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-[var(--color-base-300)]">
          <p className="text-sm text-[var(--color-base-content)] opacity-60">
            {surveyData.questions.length} {surveyData.questions.length > 1 ? surveyData.questions.length > 2 && language === 'ru' ? t('surveyEdit.questionsAdded').toLowerCase() : t('surveyEdit.questions').toLowerCase() : t('surveyEdit.question').toLowerCase()} {t('surveyEdit.added')}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditSurveyVisible(null)
                resetData()
              }}
              className="cursor-pointer px-6 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-90 transition-all font-medium"
            >
              {t('surveyEdit.cancel')}
            </button>
            <button
              onClick={validateAndUpdate}
              disabled={editingQuestion !== null || isSaved || isLoading}
              className={`cursor-pointer px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                editingQuestion !== null
                  ? 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
                  : 'bg-[var(--color-success)] text-white hover:scale-105'
              }`}
            >
              {!isLoading ? isSaved ? (
                <>
                  <Check className='w-4 h-4' />
                  {t('surveyEdit.updated')}
                </>
              )  : (
                <>
                  <Save className="w-4 h-4" />
                  {t('surveyEdit.saveChanges')}
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