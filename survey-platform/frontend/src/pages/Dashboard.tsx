import { useEffect, useRef } from 'react';
import { Plus, BarChart3, Users, Eye, Edit, Trash2, Copy, FileText, Clock, TrendingUp, Search, LineChart, Activity, BarChart2 } from 'lucide-react';
import Chart from 'chart.js/auto';
import Navbar from '../components/Navbar';
import { useDashboardStore } from '../stores/DashboardStore';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../stores/SurveyStore';
import { useQuizStore } from '../stores/QuizStore';
import CreateSurveyModal from '../components/SurveyCreateModal';
import CreateQuizModal from '../components/QuizCreateModal';
import { useSurveyEditStore } from '../stores/SurveyEditStore';
import EditSurveyModal from '../components/SurveyEditModal';
import { useQuizEditStore } from '../stores/QuizEditStore';
import EditQuizModal from '../components/QuizEditModal';
import { useTranslation } from '../../node_modules/react-i18next';

export default function Dashboard() {
  const { items, activeTab, setActiveTab, searchQuery, setSearchQuery, showCreateMenu, setShowCreateMenu, chartType, setChartType, chartData, fetchData, createQuizCopy, createSurveyCopy, surveyCreateVisible, quizCreateVisible, setQuizVisible, setSurveyVisible } = useDashboardStore()
  const { deleteSurvey } = useSurveyStore()
  const { deleteQuiz } = useQuizStore()
  const { isOpenId, setOpen } = useSurveyEditStore()
  const { isOpenId: isQuizEditOpen, setOpen: setQuizEditOpen } = useQuizEditStore()
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const isDataFetch = useRef<boolean>(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const stats = {
    totalSurveys: items.filter(i => i.type === 'survey').length,
    totalQuizzes: items.filter(i => i.type === 'quiz').length,
    totalResponses: items.reduce((sum, i) => sum + i.responses, 0),
    totalViews: items.reduce((sum, i) => sum + i.views, 0)
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  useEffect(() => {
    if (chartRef.current) {

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      const config = {
        type: chartType,
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: t('dashboard.item.views'),
              data: chartData.views,
              backgroundColor: chartType === 'line' ? 'rgba(186, 104, 200, 0.1)' : 'rgba(186, 104, 200, 0.8)',
              borderColor: 'rgb(186, 104, 200)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            },
            {
              label: t('dashboard.item.responses'),
              data: chartData.responses,
              backgroundColor: chartType === 'line' ? 'rgba(129, 199, 132, 0.1)' : 'rgba(129, 199, 132, 0.8)',
              borderColor: 'rgb(129, 199, 132)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: 'rgb(250, 250, 250)',
                font: { size: 12 },
                padding: 15,
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: 'rgba(33, 37, 41, 0.95)',
              titleColor: 'rgb(250, 250, 250)',
              bodyColor: 'rgb(250, 250, 250)',
              borderColor: 'rgba(186, 104, 200, 0.5)',
              borderWidth: 1,
              padding: 12,
              displayColors: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgb(250, 250, 250)'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'rgb(250, 250, 250)'
              }
            }
          }
        }
      };

      chartInstance.current = new Chart(ctx, config);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartType, chartData]);

  useEffect(() => {
    if (isDataFetch.current) return

    fetchData()

    isDataFetch.current = true
  }, [])

  const conversionRate = stats.totalResponses && stats.totalViews ? ((stats.totalResponses / stats.totalViews) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[var(--color-base-100)]">

      <Navbar />

      {surveyCreateVisible && <CreateSurveyModal />}
      {quizCreateVisible && <CreateQuizModal />}

      {isOpenId && <EditSurveyModal surveyId={isOpenId}/>}
      {isQuizEditOpen && <EditQuizModal quizId={isQuizEditOpen}/>}

      <div className="flex">

        <div className="w-64 min-h-screen bg-[var(--color-base-200)] border-r border-[var(--color-base-300)] p-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[var(--color-base-content)] opacity-60 uppercase tracking-wider mb-4">
              {t('dashboard.filtersTitle')}
            </h3>
            
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                activeTab === 'all'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg'
                  : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-300)]'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">{t('dashboard.allItems')}</span>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                activeTab === 'all' 
                  ? 'bg-[var(--color-primary-content)]/20' 
                  : 'bg-[var(--color-base-300)]'
              }`}>
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('survey')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                activeTab === 'survey'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg'
                  : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-300)]'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">{t('dashboard.surveys')}</span>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                activeTab === 'survey' 
                  ? 'bg-[var(--color-primary-content)]/20' 
                  : 'bg-[var(--color-base-300)]'
              }`}>
                {stats.totalSurveys}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                activeTab === 'quiz'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg'
                  : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-300)]'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">{t('dashboard.quizzes')}</span>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                activeTab === 'quiz' 
                  ? 'bg-[var(--color-primary-content)]/20' 
                  : 'bg-[var(--color-base-300)]'
              }`}>
                {stats.totalQuizzes}
              </span>
            </button>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-[var(--color-base-100)] border border-[var(--color-base-300)]">
            <h4 className="text-sm font-semibold text-[var(--color-base-content)] mb-2">
              {t('dashboard.quickTipTitle')}
            </h4>
            <p className="text-xs text-[var(--color-base-content)] opacity-70 leading-relaxed">
              {t('dashboard.quickTipText')}
            </p>
          </div>
        </div>

        <div className="flex-1 p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { 
                label: t('dashboard.stats.totalSurveys'), 
                value: stats.totalSurveys, 
                icon: <FileText className="w-6 h-6" />, 
                color: 'var(--color-primary)',
                bgColor: 'rgba(186, 104, 200, 0.1)'
              },
              { 
                label: t('dashboard.stats.totalQuizzes'), 
                value: stats.totalQuizzes, 
                icon: <BarChart3 className="w-6 h-6" />, 
                color: 'var(--color-secondary)',
                bgColor: 'rgba(129, 212, 250, 0.1)'
              },
              { 
                label: t('dashboard.stats.totalViews'), 
                value: stats.totalViews, 
                icon: <Eye className="w-6 h-6" />, 
                color: 'var(--color-accent)',
                bgColor: 'rgba(149, 117, 205, 0.1)'
              },
              { 
                label: t('dashboard.stats.totalResponses'), 
                value: stats.totalResponses, 
                icon: <Users className="w-6 h-6" />, 
                color: 'var(--color-success)',
                bgColor: 'rgba(129, 199, 132, 0.1)'
              }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <div style={{ color: stat.color }}>{stat.icon}</div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[var(--color-success)]" />
                </div>
                <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[var(--color-base-content)]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-1">
                  {t('dashboard.stats.analyticsOverview')}
                </h3>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">
                  {t('dashboard.stats.last7Days')} <span className="text-[var(--color-success)] font-semibold">{conversionRate}%</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded-lg transition-all ${
                    chartType === 'line'
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]'
                      : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-80'
                  }`}
                  title={t('dashboard.chart.lineChart')}
                >
                  <LineChart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg transition-all ${
                    chartType === 'bar'
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]'
                      : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-80'
                  }`}
                  title={t('dashboard.chart.barChart')}
                >
                  <BarChart2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="h-80">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e)}
                placeholder={t('dashboard.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--color-base-200)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="px-6 py-3 rounded-lg font-medium bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:opacity-80 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                {t('dashboard.createNew')}
              </button>

              {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-lg shadow-2xl overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setShowCreateMenu(false);
                      setSurveyVisible(true)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--color-base-300)] transition-all text-[var(--color-base-content)] flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                    <div>
                      <div className="font-medium">{t('dashboard.createSurvey.title')}</div>
                      <div className="text-xs opacity-60">{t('dashboard.createSurvey.subtitle')}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateMenu(false);
                      setQuizVisible(true)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--color-base-300)] transition-all text-[var(--color-base-content)] flex items-center gap-3"
                  >
                    <BarChart3 className="w-5 h-5 text-[var(--color-secondary)]" />
                    <div>
                      <div className="font-medium">{t('dashboard.createQuiz.title')}</div>
                      <div className="text-xs opacity-60">{t('dashboard.createQuiz.subtitle')}</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2.5 rounded-lg ${
                      item.type === 'survey' 
                        ? 'bg-[var(--color-primary)]/20' 
                        : 'bg-[var(--color-secondary)]/20'
                    }`}>
                      {item.type === 'survey' ? (
                        <FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                      ) : (
                        <BarChart3 className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-2 truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-[var(--color-base-content)] opacity-60 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(parseInt(item.createdAt) * 1000).toLocaleString('en-ZA', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            hour12: false 
                          }).replace(/,/g, '')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active'
                            ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                            : 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'
                        }`}>
                          {t(`dashboard.status.${item.status}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-[var(--color-base-300)]">
                  <div>
                    <p className="text-2xl font-bold text-[var(--color-base-content)]">{item.responses}</p>
                    <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('dashboard.item.responses')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--color-base-content)]">{item.views}</p>
                    <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('dashboard.item.views')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-base-content)]">{item.lastResponse && item.lastResponse.replace(item.lastResponse[0], item.lastResponse[0].toUpperCase())}</p>
                    <p className="text-xs text-[var(--color-base-content)] opacity-60">{t('dashboard.item.lastResponse')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => item.type === 'survey' ? navigate(`/dashboard/survey/${item.id}`) : navigate(`/dashboard/quiz/${item.id}`)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-80 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    {t('dashboard.item.buttons.view')}
                  </button>
                  <button
                    onClick={() => item.type === 'survey' ? setOpen(item.id) : setQuizEditOpen(item.id)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:opacity-85 transition-all flex items-center justify-center gap-2 font-medium shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                    {t('dashboard.item.buttons.edit')}
                  </button>
                  <button
                    onClick={() => item.type === 'survey' ? createSurveyCopy(item.id) : createQuizCopy(item.id)}
                    className="px-4 py-2.5 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:scale-96 transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => item.type === 'survey' ? deleteSurvey(item.id) : deleteQuiz(item.id)}
                    className="px-4 py-2.5 rounded-lg bg-[var(--color-error)]/20 text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-[var(--color-error-content)] transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-32 h-32 bg-[var(--color-base-300)] rounded-full flex items-center justify-center mb-6">
                <FileText className="w-16 h-16 text-[var(--color-base-content)] opacity-30" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--color-base-content)]">
                {t('dashboard.empty.title')}
              </h3>
              <p className="text-[var(--color-base-content)] opacity-60 mb-6">
                {searchQuery ? t('dashboard.empty.searchAdjust') : t('dashboard.empty.createFirst')}
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowCreateMenu(false)}
        ></div>
      )}
    </div>
  );
}