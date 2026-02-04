import { ArrowLeft, Eye, Users, Clock, Calendar, Share2, Copy, CheckCircle, BarChart3, ExternalLink, Mail, Check, Star, MessageSquare, TrendingUp } from 'lucide-react';
import { useSurveyStore } from '../stores/SurveyStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';
import { useSurveyAnalyticsStore } from '../stores/SurveyAnalyticsStore';
import SurveyAnalytics from '../components/SurveyAnalytics';
import { useSurveyEditStore } from '../stores/SurveyEditStore';
import EditSurveyModal from '../components/SurveyEditModal';

export default function Survey() {
  const { copied, setCopied, surveyData, surveyUrl, questionTypeIcons, responseRate, showEmailInput, setEmailAddress, emailAddress, setShowEmailInput, shareSurvey, isSent, isSending } = useSurveyStore()
  const { isOpen, setIsOpen } = useSurveyAnalyticsStore()
  const { isOpenId: isSurveyEditOpen, setOpen } = useSurveyEditStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (isSent) {
      setTimeout(() => {
        useSurveyStore.setState(state => ({ ...state, isSent: false }))
      }, 3000)
    }
  }, [isSent])

  return (
    <div className="min-h-screen bg-[var(--color-base-100)]">

      <header className="bg-[var(--color-base-200)] border-b border-[var(--color-base-300)] sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5 text-[var(--color-base-content)]" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--color-base-content)]">
                {surveyData.title}
              </h1>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">
                {t('survey.overview')}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-lg font-semibold text-sm shadow-lg ${
              surveyData.status === 'active'
                ? 'bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/30'
                : 'bg-[var(--color-warning)]/20 text-[var(--color-warning)] border border-[var(--color-warning)]/30'
            }`}>
              ● {t(`survey.status.${surveyData.status}`).toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {isOpen && <SurveyAnalytics />}
        {isSurveyEditOpen && <EditSurveyModal surveyId={isSurveyEditOpen}/>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] rounded-2xl p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold mb-4">
                  {t('survey.questionsResponses', { countQuestions: surveyData.questions.length, countResponses: surveyData.responses.length })}
                </div>
                <h2 className="text-3xl font-bold mb-3 text-white drop-shadow-lg">
                  {surveyData.title}
                </h2>
                <p className="text-lg text-white/90 mb-6 leading-relaxed max-w-2xl">
                  {surveyData.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => navigate(`/start/survey/${surveyData.id}`)} className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-all flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {t('survey.preview')}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[var(--color-accent)]/20 group-hover:scale-110 transition-transform">
                    <Eye className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                </div>
                <p className="text-xs text-[var(--color-base-content)] opacity-60 mb-1">{t('survey.stats.totalViews')}</p>
                <p className="text-3xl font-bold text-[var(--color-base-content)]">{surveyData.views}</p>
              </div>
              
              <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[var(--color-success)]/20 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-[var(--color-success)]" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                </div>
                <p className="text-xs text-[var(--color-base-content)] opacity-60 mb-1">{t('survey.stats.responses')}</p>
                <p className="text-3xl font-bold text-[var(--color-base-content)]">{surveyData.responses.length}</p>
              </div>
              
              <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[var(--color-primary)]/20 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                </div>
                <p className="text-xs text-[var(--color-base-content)] opacity-60 mb-1">{t('survey.stats.responseRate')}</p>
                <p className="text-3xl font-bold text-[var(--color-base-content)]">{responseRate}%</p>
              </div>
              
              <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[var(--color-secondary)]/20 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-[var(--color-secondary)]" />
                  </div>
                </div>
                <p className="text-xs text-[var(--color-base-content)] opacity-60 mb-1">{t('survey.stats.lastResponse')}</p>
                <p className="text-lg font-bold text-[var(--color-base-content)]">{surveyData.lastResponse && surveyData.lastResponse.replace(surveyData.lastResponse[0], surveyData.lastResponse[0].toUpperCase())}</p>
              </div>
            </div>

            <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-primary)]/20">
                    <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-base-content)]">{t('survey.questionsPreview.title')}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                  {t('survey.questionsPreview.count', { count: surveyData.questions.length })}
                </span>
              </div>
              
              <div className="space-y-4">
                {surveyData.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-[var(--color-base-100)] border border-[var(--color-base-300)] rounded-xl p-6 hover:border-[var(--color-primary)] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{questionTypeIcons[question.type]}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[var(--color-base-content)] opacity-60">
                              {t('survey.q')}{index + 1}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-semibold">
                              {t(`survey.questionTypes.${question.type}`)}
                            </span>
                            {question.required && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-error)]/20 text-[var(--color-error)] font-semibold">
                                {t('survey.questionsPreview.required')}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[var(--color-base-content)] font-semibold mb-4 text-lg">
                          {question.question}
                        </p>
                        {question.options.length > 0 && (
                          <div className="space-y-2.5">
                            {question.options.map((option, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 text-sm text-[var(--color-base-content)] opacity-80 bg-[var(--color-base-200)] px-4 py-2.5 rounded-lg"
                              >
                                <span className={`w-4 h-4 flex-shrink-0 ${
                                  question.type === 'multiple' ? 'rounded-full' : 'rounded'
                                } border-2 border-[var(--color-base-content)] opacity-40`}></span>
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'rating' && (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-7 h-7 text-[var(--color-warning)] opacity-30" />
                            ))}
                          </div>
                        )}
                        {question.type === 'text' && (
                          <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-lg p-3 text-sm text-[var(--color-base-content)] opacity-60 italic">
                            {t('survey.questionsPreview.textResponse')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">

            <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                {t('survey.details.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-base-100)]">
                  <Calendar className="w-5 h-5 text-[var(--color-base-content)] opacity-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--color-base-content)] opacity-60 mb-1">{t('survey.details.createdOn')}</p>
                    <p className="text-sm font-semibold text-[var(--color-base-content)]">
                      {new Date(parseInt(surveyData.createdAt) * 1000).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-base-100)]">
                  <Clock className="w-5 h-5 text-[var(--color-base-content)] opacity-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--color-base-content)] opacity-60 mb-1">{t('survey.details.lastResponse')}</p>
                    <p className="text-sm font-semibold text-[var(--color-base-content)]">{surveyData.lastResponse && surveyData.lastResponse.replace(surveyData.lastResponse[0], surveyData.lastResponse[0].toUpperCase())}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-base-100)]">
                  <CheckCircle className="w-5 h-5 text-[var(--color-base-content)] opacity-50 mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--color-base-content)] opacity-60 mb-1">{t('survey.details.totalQuestions')}</p>
                    <p className="text-sm font-semibold text-[var(--color-base-content)]">
                      {t('survey.details.questionsCount', { count: surveyData.questions.length })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[var(--color-primary)]" />
                {t('survey.share.title')}
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={surveyUrl}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] text-sm border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-3 rounded-lg transition-all flex items-center gap-2 font-semibold ${
                      copied
                        ? 'bg-[var(--color-success)] text-[var(--color-success-content)] scale-95'
                        : 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105 shadow-lg'
                    }`}
                  >
                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <a
                  href={surveyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] border border-[var(--color-base-300)] transition-all text-center font-medium no-underline"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t('survey.share.openInNewTab')}
                  </div>
                </a>

                <button
                  onClick={() => setShowEmailInput(!showEmailInput)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] border border-[var(--color-base-300)] transition-all font-medium"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('survey.share.shareViaEmail')}
                  </div>
                </button>

                {showEmailInput && (
                  <div className="pt-2 space-y-2 animate-fadeIn">
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e)}
                      placeholder={t('survey.share.emailPlaceholder')}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none"
                    />
                    <button
                      onClick={shareSurvey}
                      disabled={!emailAddress || isSending || isSent}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        isSent
                          ? 'bg-[var(--color-success)] text-[var(--color-success-content)]'
                          : 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
                      }`}
                    >
                      {isSending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[var(--color-primary-content)] border-t-transparent rounded-full animate-spin"></div>
                          {t('survey.share.sending')}
                        </>
                      ) : isSent ? (
                        <>
                          <Check className="w-5 h-5" />
                          {t('survey.share.sent')}
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          {t('survey.share.sendEmail')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-4">{t('survey.quickActions.title')}</h3>
              <div className="space-y-2">
                <button onClick={() => setIsOpen(true)} className="w-full px-4 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] border border-[var(--color-base-300)] transition-all font-medium text-left">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
                    {t('survey.quickActions.viewAnalytics')}
                  </div>
                </button>
                <button onClick={() => setOpen(surveyData.id)} className="w-full px-4 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-99 transition-all font-semibold shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    {t('survey.quickActions.editSurvey')}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}