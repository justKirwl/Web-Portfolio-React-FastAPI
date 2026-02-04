import { useEffect, useRef } from 'react';
import { Search, Filter, BarChart3, FileText, Users, Eye, ArrowLeft, Clock, Sparkles, MessageCircleQuestion, Zap, Star, Globe, CheckCircle2, Circle } from 'lucide-react';
import { useItemsStore } from '../stores/ItemsStore';
import { useSurveyDetailStore } from '../stores/SurveyDetailStore';
import SurveyDetailModal from '../components/SurveyDetail';
import { useQuizDetailStore } from '../stores/QuizDetailStore';
import QuizDetail from '../components/QuizDetailModal';
import { useTranslation } from '../../node_modules/react-i18next';
import { useSearchParams } from 'react-router-dom';

export default function PublicItems() {
  const { items, activeFilter, searchQuery, animatedCounts, setActiveFilter, setAnimatedCounts, setSearchQuery, fetchItems, completionFilter, setCompletionFilter } = useItemsStore()
  const { isOpen, setOpen } = useSurveyDetailStore()
  const { isOpen: isQuizDetailOpen, setOpen: setQuizDetailOpen } = useQuizDetailStore()
  const isFetched = useRef<boolean>(false)
  const { t } = useTranslation()
  const [ params ] = useSearchParams()

  const completionCounts = items ? items.reduce((acum, item) => {
    if (item.isCompleted) {
      acum.completed += 1
    }
    else {
      acum.uncompleted += 1
    }

    return acum
  }, { completed: 0, uncompleted: 0 }) : { completed: 0, uncompleted: 0 }

  const filteredItems = items ? items.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompletion = completionFilter === 'all' ? true : completionFilter === 'completed' ? item.isCompleted : !item.isCompleted
    return matchesFilter && matchesSearch && matchesCompletion;
  }) : []

  const counts = items ? {
    all: items.length,
    surveys: items.filter(i => i.type === 'surveys' && completionFilter === 'completed' ? i.isCompleted : i.type === 'surveys' && completionFilter === 'uncompleted' ? !i.isCompleted : completionFilter === 'all' && i.type === 'surveys').length,
    quizes: items.filter(i => i.type === 'quizes' && completionFilter === 'completed' ? i.isCompleted : i.type === 'quizes' && completionFilter === 'uncompleted' ? !i.isCompleted : completionFilter === 'all' && i.type === 'quizes').length
  } : {
    all: 0,
    surveys: 0,
    quizes: 0
  };

  useEffect(() => {
    if (items.length > 0 && animatedCounts.all === 0) {
      setAnimatedCounts('all', counts.all);
      setAnimatedCounts('surveys', counts.surveys);
      setAnimatedCounts('quizes', counts.quizes);
    }
  }, [items]);

  useEffect(() => {
    if (isFetched.current) return

    fetchItems()

    isFetched.current = true
  }, [])

  useEffect(() => {
    if (params.get('surveyId')) {
      setOpen(params.get('surveyId'))
    }
    else if (params.get('quizId')) {
      setQuizDetailOpen(params.get('quizId'))
    }
  }, [params, items])

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-40 h-40 rounded-full bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] flex items-center justify-center mb-6">
        <Sparkles className="w-20 h-20 text-[var(--color-base-content)] opacity-30" />
      </div>
      <h3 className="text-3xl font-bold text-[var(--color-base-content)] mb-3">
        {searchQuery ? t('items.emptyState.noResults') : t('items.emptyState.noFilter', { filter: activeFilter === 'all' ? t('items.emptyState.all') : t(`items.emptyState.${activeFilter}`) })}
      </h3>
      <p className="text-[var(--color-base-content)] opacity-60 max-w-md text-center">
        {searchQuery ? t('items.emptyState.tryAdjust') : t('items.emptyState.checkBack')}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-base-100)]">

      <div className="bg-[var(--color-base-200)] border-b border-[var(--color-base-300)]">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-lg bg-[var(--color-base-300)] hover:bg-[var(--color-base-300)]/80 text-[var(--color-base-content)] transition-all flex items-center gap-2 border border-[var(--color-base-300)]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{t('items.header.back')}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
                <span className="text-sm font-semibold text-[var(--color-success)]">
                  <span className="inline-block w-2 h-2 bg-[var(--color-success)] rounded-full mr-2 animate-pulse"></span>
                  {t('items.header.live', { count: items.length })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
            <div className="flex-1">
              <h1 className="text-5xl font-black text-[var(--color-base-content)] mb-4">
                {t('items.explore.title')}
              </h1>
              <p className="text-xl text-[var(--color-base-content)] opacity-70 mb-6">
                {t('items.explore.subtitle')}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
                  <Users className="w-5 h-5 text-[var(--color-primary)]" />
                  <span className="text-sm font-semibold text-[var(--color-base-content)]">{t('items.explore.users')}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
                  <Star className="w-5 h-5 text-[var(--color-warning)] fill-[var(--color-warning)]" />
                  <span className="text-sm font-semibold text-[var(--color-base-content)]">{t('items.explore.rating')}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
                  <Globe className="w-5 h-5 text-[var(--color-info)]" />
                  <span className="text-sm font-semibold text-[var(--color-base-content)]">{t('items.explore.worldwide')}</span>
                </div>
              </div>
            </div>

            <div className="text-center p-8 rounded-2xl bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] shadow-xl min-w-[280px]">
              <div className="text-8xl font-black text-[var(--color-primary)] mb-2">
                {animatedCounts[activeFilter]}
              </div>
              <p className="text-lg font-bold text-[var(--color-base-content)] capitalize">
                {activeFilter === 'all' ? t('items.explore.totalAvailable') : t('items.explore.ready', { filter: t(`items.filters.${activeFilter}`) })}
              </p>
            </div>
          </div>
        </div>

        {isOpen && <SurveyDetailModal />}
        {isQuizDetailOpen && <QuizDetail />}

        <div className="bg-[var(--color-base-200)] rounded-xl border border-[var(--color-base-300)] p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: t('items.filters.allContent'), icon: <Filter className="w-4 h-4" /> },
                { id: 'surveys', label: t('items.filters.surveys'), icon: <FileText className="w-4 h-4" />, count: counts.surveys },
                { id: 'quizes', label: t('items.filters.quizes'), icon: <BarChart3 className="w-4 h-4" />, count: counts.quizes }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    activeFilter === filter.id
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg'
                      : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)]/70 border border-[var(--color-base-300)]'
                  }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                  {filter.count !== undefined && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeFilter === filter.id
                        ? 'bg-[var(--color-primary-content)]/20'
                        : 'bg-[var(--color-base-200)]'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative flex-1 lg:max-w-md ml-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('items.filters.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-semibold text-[var(--color-base-content)] opacity-70">{t('items.status.label')}</span>
              {[
                { id: 'all', label: t('items.status.all'), icon: <Filter className="w-3.5 h-3.5" /> },
                { id: 'completed', label: t('items.status.completed'), icon: <CheckCircle2 className="w-3.5 h-3.5" />, count: completionCounts.completed },
                { id: 'uncompleted', label: t('items.status.notCompleted'), icon: <Circle className="w-3.5 h-3.5" />, count: completionCounts.uncompleted }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setCompletionFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${
                    completionFilter === filter.id
                      ? 'bg-[var(--color-success)] text-white shadow-lg'
                      : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)]/70 border border-[var(--color-base-300)]'
                  }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                  {filter.count !== undefined && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      completionFilter === filter.id
                        ? 'bg-white/20'
                        : 'bg-[var(--color-base-200)]'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredItems.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-[var(--color-base-content)] opacity-70">
              <span className="font-bold text-[var(--color-primary)]">{filteredItems.length}</span> {filteredItems.length === 1 ? t('items.results.single') : t('items.results.multiple')}
            </p>
            <div className="flex items-center gap-2 text-sm text-[var(--color-base-content)] opacity-60">
              <Clock className="w-4 h-4" />
              <span>{t('items.results.updatedDaily')}</span>
            </div>
          </div>
        )}

        {filteredItems.length > 0 ? (
          <>
            {filteredItems.some(item => item.featured) && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-[var(--color-warning)]" />
                  <h2 className="text-2xl font-bold text-[var(--color-base-content)]">{t('items.featured')}</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                  {filteredItems.filter(item => item.featured).map(item => (
                    <div
                      key={item.id}
                      className="bg-[var(--color-base-200)] rounded-xl border-2 border-[var(--color-primary)]/30 p-6 hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[var(--color-warning)] text-white text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-4 rounded-xl ${
                          item.type === 'surveys' ? 'bg-[var(--color-info)]/10' : 'bg-[var(--color-secondary)]/10'
                        }`}>
                          {item.type === 'surveys' ? (
                            <FileText className="w-8 h-8 text-[var(--color-info)]" />
                          ) : (
                            <BarChart3 className="w-8 h-8 text-[var(--color-secondary)]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-[var(--color-base-content)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-[var(--color-base-content)] opacity-60">
                            {t('items.labels.by')} <span className="font-semibold text-[var(--color-primary)]">{item.author}</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 rounded-lg bg-[var(--color-base-100)]">
                          <Eye className="w-5 h-5 text-[var(--color-base-content)] opacity-50 mx-auto mb-1" />
                          <p className="text-xl font-bold text-[var(--color-base-content)]">{item.views}</p>
                          <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('items.labels.views')}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-[var(--color-base-100)]">
                          <Users className="w-5 h-5 text-[var(--color-base-content)] opacity-50 mx-auto mb-1" />
                          <p className="text-xl font-bold text-[var(--color-base-content)]">{item.responses}</p>
                          <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('items.labels.responses')}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-[var(--color-base-100)]">
                          <MessageCircleQuestion className="w-5 h-5 text-[var(--color-base-content)] opacity-50 mx-auto mb-1" />
                          <p className="text-xl font-bold text-[var(--color-base-content)]">{item.questions}</p>
                          <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('items.labels.questions')}</p>
                        </div>
                      </div>

                      <button onClick={() => item.type === 'surveys' ? setOpen(item.id) : setQuizDetailOpen(item.id)} className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] font-bold hover:opacity-90 transition-all">
                        {item.type === 'surveys' ? t('items.actions.startSurvey') : t('items.actions.takeQuiz')} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.filter(item => !item.featured).map(item => (
                <div
                  key={item.id}
                  className="bg-[var(--color-base-200)] rounded-xl border border-[var(--color-base-300)] p-6 hover:border-[var(--color-primary)] hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      item.type === 'surveys' ? 'bg-[var(--color-info)]/10' : 'bg-[var(--color-secondary)]/10'
                    }`}>
                      {item.type === 'surveys' ? (
                        <FileText className="w-6 h-6 text-[var(--color-info)]" />
                      ) : (
                        <BarChart3 className="w-6 h-6 text-[var(--color-secondary)]" />
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.type === 'surveys'
                        ? 'bg-[var(--color-info)]/20 text-[var(--color-info)]'
                        : 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]'
                    }`}>
                      {item.type === 'surveys' ? t('items.labels.survey') : t('items.labels.quiz')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-4">
                    {t('items.labels.by')} {item.author}
                  </p>

                  <div className="flex items-center justify-between text-sm text-[var(--color-base-content)] opacity-70 mb-4 pb-4 border-b border-[var(--color-base-300)]">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold">{item.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{item.responses}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircleQuestion className="w-4 h-4" />
                      <span className="font-semibold">{item.questions}</span>
                    </div>
                  </div>

                  <button onClick={() => item.type === 'surveys' ? setOpen(item.id) : setQuizDetailOpen(item.id)} className="w-full py-2.5 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] font-semibold hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-content)] transition-all">
                    {t('items.actions.viewDetails')}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}

        {filteredItems.length > 0 && (
          <div className="mt-16 p-8 rounded-xl bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
            <h3 className="text-2xl font-bold text-[var(--color-base-content)] mb-6 text-center">{t('items.statistics.title')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-[var(--color-info)] mb-2">{counts.surveys}</div>
                <p className="text-sm font-semibold text-[var(--color-base-content)] opacity-70">{t('items.statistics.totalSurveys')}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-[var(--color-secondary)] mb-2">{counts.quizes}</div>
                <p className="text-sm font-semibold text-[var(--color-base-content)] opacity-70">{t('items.statistics.totalQuizzes')}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-[var(--color-success)] mb-2">
                  {items.reduce((sum, i) => sum + i.responses, 0).toLocaleString()}
                </div>
                <p className="text-sm font-semibold text-[var(--color-base-content)] opacity-70">{t('items.statistics.totalResponses')}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-[var(--color-warning)] mb-2">
                  {items.reduce((sum, i) => sum + i.views, 0).toLocaleString()}
                </div>
                <p className="text-sm font-semibold text-[var(--color-base-content)] opacity-70">{t('items.statistics.totalViews')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}