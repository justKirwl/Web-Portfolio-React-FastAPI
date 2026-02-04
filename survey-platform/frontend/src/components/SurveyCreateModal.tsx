import { X, Plus, Trash2, GripVertical, FileText, AlertCircle, Globe, Target, Tag } from 'lucide-react';
import React from 'react';
import { useSurveyCreateStore } from '../stores/SurveyCreateStore';
import { useDashboardStore } from '../stores/DashboardStore';
import { useTranslation } from '../../node_modules/react-i18next';
import { difficulties, languages, questionTypes } from '../utils/surveyCreateTypes';

export default function CreateSurveyModal() {
  const { surveyData, currentQuestion, setSurveyData, setCurrentQuestion, createSurvey, isLoading, tagInput, setTagInput, errors, setErrors } = useSurveyCreateStore()
  const { setSurveyVisible } = useDashboardStore()
  const { t } = useTranslation()
  const language = localStorage.getItem('prefered_language') || 'en'

  const addQuestion = () => {
    const newErrors: { currentQuestion?: string, currentOptions?: string } = {};

    if (!currentQuestion.question.trim()) {
      newErrors.currentQuestion = t('surveyCreate.errors.questionRequired');
    }

    if ((currentQuestion.type === 'multiple' || currentQuestion.type === 'checkbox') && currentQuestion.options.length === 0) {
      newErrors.currentOptions = t('surveyCreate.errors.optionRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSurveyData({
      ...surveyData,
      questions: [...surveyData.questions, { ...currentQuestion, id: Date.now() }]
    });

    setCurrentQuestion({
      type: 'text',
      question: '',
      required: false,
      options: []
    });

    setErrors({});
  };

  const removeQuestion = (id: number) => {
    setSurveyData({
      ...surveyData,
      questions: surveyData.questions.filter(q => q.id !== id)
    });
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
        setSurveyData({
          ...surveyData,
          tags: [...(surveyData.tags || []), newTag]
        });
        setTagInput('');
      } else {
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSurveyData({
      ...surveyData,
      tags: surveyData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const validateAndCreate = () => {
    const newErrors: { title?: string, description?: string, language?: string, difficulty?: string, questions?: string } = {};

    if (!surveyData.title.trim()) {
      newErrors.title = t('surveyCreate.errors.titleRequired');
    }

    if (surveyData.questions.length === 0) {
      newErrors.questions = t('surveyCreate.errors.questionsRequired');
    }

    if (!surveyData.language) {
      newErrors.language = t('surveyCreate.errors.languageRequired');
    }

    if (!surveyData.difficulty) {
      newErrors.difficulty = t('surveyCreate.errors.difficultyRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    createSurvey();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray backdrop-blur-sm bg-opacity-50">
      <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between p-6 border-b border-[var(--color-base-300)]">
          <div className='flex items-center gap-4'>
            <div>
              <FileText className="w-10 h-10 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-base-content)]">{t('surveyCreate.title')}</h2>
              <p className="text-sm text-[var(--color-base-content)] opacity-60 mt-1">{t('surveyCreate.desc')}</p>
            </div>  
          </div>
          <button
            onClick={() => setSurveyVisible(false)}
            className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all"
          >
            <X className="w-6 h-6 text-[var(--color-base-content)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                {t('surveyCreate.surveyTitle')} *
              </label>
              <input
                type="text"
                value={surveyData.title}
                onChange={(e) => {
                  setSurveyData({ ...surveyData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder={t('surveyCreate.surveyTitlePlaceholder')}
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
                {t('surveyCreate.surveyDesc')} ({t('surveyCreate.optional')})
              </label>
              <textarea
                value={surveyData.description}
                onChange={(e) => setSurveyData({ ...surveyData, description: e.target.value })}
                placeholder={t('surveyCreate.surveyDescPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--color-primary)]" />
                  {t('surveyCreate.language')} *
                </label>
                <div className="relative">
                  <select
                    value={surveyData.language || ''}
                    onChange={(e) => {
                      setSurveyData({ ...surveyData, language: e.target.value });
                      if (errors.language) setErrors({ ...errors, language: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 ${
                      errors.language ? 'border-red-500' : 'border-transparent'
                    } focus:border-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer`}
                  >
                    <option value="">{t('surveyCreate.selectLanguage')}</option>
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
                  {t('surveyCreate.difficulty')} *
                </label>
                <div className="relative">
                  <select
                    value={surveyData.difficulty || ''}
                    onChange={(e) => {
                      setSurveyData({ ...surveyData, difficulty: e.target.value });
                      if (errors.difficulty) setErrors({ ...errors, difficulty: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 ${
                      errors.difficulty ? 'border-red-500' : 'border-transparent'
                    } focus:border-[var(--color-primary)] focus:outline-none appearance-none cursor-pointer`}
                  >
                    <option value="">{t('surveyCreate.selectDifficulty')}</option>
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
                {t('surveyCreate.tagsLabel')}
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInput}
                placeholder={t('surveyCreate.tagsPlaceholder')}
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
                {t('surveyCreate.tagsAdded', { count: surveyData.tags.length || 0 })}
              </p>
            </div>
          </div>

          {surveyData.questions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[var(--color-base-content)]">{t('surveyCreate.questions')} ({surveyData.questions.length})</h3>
              {surveyData.questions.map((q, index) => (
                <div key={q.id} className="bg-[var(--color-base-100)] border-2 border-[var(--color-base-300)] rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <GripVertical className="w-5 h-5 text-[var(--color-base-content)] opacity-30 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-[var(--color-base-content)] opacity-60">{t('surveyCreate.q')}{index + 1}</span>
                          <span className="text-xs px-2 py-1 rounded bg-[var(--color-primary)] text-[var(--color-primary-content)]">
                            {questionTypes.find(t => t.value === q.type)?.label}
                          </span>
                          {q.required && (
                            <span className="text-xs px-2 py-1 rounded bg-[var(--color-error)] text-[var(--color-error-content)]">
                              {t('surveyCreate.required')}
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
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-error)] hover:text-[var(--color-error-content)] transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

          <div className="space-y-4 border-2 border-dashed border-[var(--color-base-300)] rounded-lg p-6">
            <h3 className="text-lg font-bold text-[var(--color-base-content)]">{t('surveyCreate.addNewQuestion')}</h3>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                {t('surveyCreate.questionType')} *
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
                {t('surveyCreate.questionText')} *
              </label>
              <input
                type="text"
                value={currentQuestion.question}
                onChange={(e) => {
                  setCurrentQuestion({ ...currentQuestion, question: e.target.value });
                  if (errors.currentQuestion) setErrors({ ...errors, currentQuestion: '' });
                }}
                placeholder={t('surveyCreate.questionTextPlaceholder')}
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
                  {t('surveyCreate.options')} *
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
                    className="cursor-pointer w-full px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('surveyCreate.addOption')}
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
                id="required"
                checked={currentQuestion.required}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, required: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="required" className="text-sm text-[var(--color-base-content)] cursor-pointer">
                {t('surveyCreate.makeRequired')}
              </label>
            </div>

            <button
              onClick={addQuestion}
              className="cursor-pointer w-full px-6 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-102 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              {t('surveyCreate.addQuestion')}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-[var(--color-base-300)]">
          <p className="text-sm text-[var(--color-base-content)] opacity-60">
            {surveyData.questions.length} {surveyData.questions.length > 1 ? surveyData.questions.length > 2 && language === 'ru' ? t('surveyCreate.questionsAdded') : `${t('surveyCreate.questions').toLowerCase()} ${t('surveyCreate.added')}` : `${t('surveyCreate.question').toLowerCase()} ${t('surveyCreate.added')}`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setSurveyVisible(false)}
              className="cursor-pointer px-6 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-90 transition-all font-medium"
            >
              {t('surveyCreate.cancel')}
            </button>
            <button
              onClick={validateAndCreate}
              disabled={isLoading}
              className="cursor-pointer px-6 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isLoading ? t('surveyCreate.createSurvey') : <div className='loading'></div>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}