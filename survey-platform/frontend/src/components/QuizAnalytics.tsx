import { useRef, useEffect } from 'react';
import { X, TrendingUp, Eye, Users, BarChart3, LineChart, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import Chart, { type ChartConfiguration } from 'chart.js/auto';
import { useTranslation } from '../../node_modules/react-i18next';
import { useQuizStore } from '../stores/QuizStore';
import { useQuizAnalyticsStore } from '../stores/QuizAnalyticsStore';

export default function QuizAnalytics() {
  const { quizData } = useQuizStore()
  const { isOpen, setIsOpen, period, setChartType, setPeriod, chartType, allTimeData, dayData, getAllTimeData, getDayData } = useQuizAnalyticsStore()
  const { t } = useTranslation()
  
  const responsesChartRef = useRef<HTMLCanvasElement | null>(null);
  const viewsChartRef = useRef<HTMLCanvasElement | null>(null);
  const conversionChartRef = useRef<HTMLCanvasElement | null>(null);

  const responsesChartInstance = useRef<Chart | null>(null);
  const viewsChartInstance = useRef<Chart | null>(null);
  const conversionChartInstance = useRef<Chart<'line' | 'bar', number[], string> | null>(null);


  const currentData = period === 'day' ? dayData : allTimeData;

  const totalResponses = currentData.responses.reduce((a, b) => a + b, 0);
  const totalViews = currentData.views.reduce((a, b) => a + b, 0);
  const conversionRate = ((totalResponses / totalViews) * 100).toFixed(1);
  
  const prevResponses = period === 'day' ? quizData.responses.length : quizData.responses.length * 7;
  const prevViews = period === 'day' ? quizData.views : quizData.views * 8;
  const responsesGrowth = totalResponses && prevResponses ?(((totalResponses - prevResponses) / prevResponses) * 100).toFixed(1) : 0;
  const viewsGrowth = totalViews && prevViews ? (((totalViews - prevViews) / prevViews) * 100).toFixed(1) : 0;

  const chartConfig = {
    type: chartType,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(33, 37, 41, 0.95)',
          titleColor: 'rgb(250, 250, 250)',
          bodyColor: 'rgb(250, 250, 250)',
          borderColor: 'rgba(186, 104, 200, 0.5)',
          borderWidth: 1,
          padding: 12,
          displayColors: false
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

  useEffect(() => {
    if (!isOpen) return;

    if (responsesChartRef.current) {
      if (responsesChartInstance.current) {
        responsesChartInstance.current.destroy();
      }
      const ctx = responsesChartRef.current.getContext('2d');
      if (!ctx) return

      responsesChartInstance.current = new Chart(ctx, {
        ...chartConfig,
        data: {
          labels: currentData.labels,
          datasets: [{
            label: t('quizAnalytics.responses'),
            data: currentData.responses,
            backgroundColor: chartType === 'line' ? 'rgba(129, 199, 132, 0.2)' : 'rgba(129, 199, 132, 0.8)',
            borderColor: 'rgb(129, 199, 132)',
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }]
        }
      } as ChartConfiguration);
    }

    if (viewsChartRef.current) {
      if (viewsChartInstance.current) {
        viewsChartInstance.current.destroy();
      }
      const ctx = viewsChartRef.current.getContext('2d');
      if (!ctx) return

      viewsChartInstance.current = new Chart(ctx, {
        ...chartConfig,
        data: {
          labels: currentData.labels,
          datasets: [{
            label: t('quizAnalytics.views'),
            data: currentData.views,
            backgroundColor: chartType === 'line' ? 'rgba(186, 104, 200, 0.2)' : 'rgba(186, 104, 200, 0.8)',
            borderColor: 'rgb(186, 104, 200)',
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }]
        }
      } as ChartConfiguration);
    }

    if (conversionChartRef.current) {
      if (conversionChartInstance.current) {
        conversionChartInstance.current.destroy();
      }
      const ctx = conversionChartRef.current.getContext('2d');
      if (!ctx) return

      const conversionData = currentData.responses.map((resp, idx) => 
        ((resp / currentData.views[idx]) * 100).toFixed(1)
      );
      
      conversionChartInstance.current = new Chart<'line' | 'bar', number[], string>(ctx, {
        ...chartConfig,
        type: chartType as 'line' | 'bar',
        data: {
          labels: currentData.labels,
          datasets: [{
            label: `${t('quizAnalytics.conversionRate')} %`,
            data: conversionData.map(Number),
            backgroundColor: chartType === 'line' ? 'rgba(129, 212, 250, 0.2)' : 'rgba(129, 212, 250, 0.8)',
            borderColor: 'rgb(129, 212, 250)',
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }]
        }
      });
    }

    return () => {
      if (responsesChartInstance.current) responsesChartInstance.current.destroy();
      if (viewsChartInstance.current) viewsChartInstance.current.destroy();
      if (conversionChartInstance.current) conversionChartInstance.current.destroy();
    };
  }, [period, chartType, isOpen, currentData]);

  useEffect(() => {
    getDayData()
  }, [])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl bg-[var(--color-base-100)] rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '95vh', overflowY: 'auto' }}>

        <div className="sticky top-0 z-10 bg-[var(--color-base-200)] border-b border-[var(--color-base-300)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-primary)]/20">
                <BarChart3 className="w-6 h-6 text-[var(--color-secondary)]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-base-content)]">{t('quizAnalytics.title')}</h2>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('quizAnalytics.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg bg-[var(--color-base-300)] hover:bg-[var(--color-base-300)]/80 text-[var(--color-base-content)] transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">

            <div className="flex gap-2 bg-[var(--color-base-300)] p-1 rounded-lg">
              <button
                onClick={() => {
                    setPeriod('day')
                    getDayData()
                }}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  period === 'day'
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg'
                    : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-200)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('quizAnalytics.today')}
                </div>
              </button>
              <button
                onClick={() => {
                    setPeriod('all')
                    getAllTimeData()
                }}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  period === 'all'
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg'
                    : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-200)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('quizAnalytics.allTime')}
                </div>
              </button>
            </div>

            <div className="flex gap-2 bg-[var(--color-base-300)] p-1 rounded-lg">
              <button
                onClick={() => setChartType('line')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  chartType === 'line'
                    ? 'bg-[var(--color-secondary)] text-[var(--color-secondary-content)] shadow-lg'
                    : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-200)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4" />
                  {t('quizAnalytics.line')}
                </div>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  chartType === 'bar'
                    ? 'bg-[var(--color-secondary)] text-[var(--color-secondary-content)] shadow-lg'
                    : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-200)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('quizAnalytics.bar')}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="p-6 rounded-xl bg-[var(--color-base-200)] border border-[var(--color-base-300)] hover:border-[var(--color-success)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-[var(--color-success)]/20">
                  <Users className="w-6 h-6 text-[var(--color-success)]" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  parseFloat(responsesGrowth) > 0 
                    ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' 
                    : parseFloat(responsesGrowth) !== 0 ? 'bg-[var(--color-error)]/20 text-[var(--color-error)]' 
                    : 'bg-[var(--color-neutral)]/20 text-[var(--color-primary)]'
                }`}>
                  {parseFloat(responsesGrowth) > 0 ? <ArrowUp className="w-3 h-3" /> : parseFloat(responsesGrowth) !== 0 && <ArrowDown className="w-3 h-3" />}
                  {Math.abs(parseFloat(responsesGrowth))}%
                </div>
              </div>
              <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-1">{t('quizAnalytics.totalResponses')}</p>
              <p className="text-4xl font-bold text-[var(--color-base-content)]">{totalResponses}</p>
            </div>

            <div className="p-6 rounded-xl bg-[var(--color-base-200)] border border-[var(--color-base-300)] hover:border-[var(--color-primary)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-[var(--color-primary)]/20">
                  <Eye className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  parseFloat(viewsGrowth) > 0 
                    ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' 
                    : parseFloat(viewsGrowth) !== 0 ? 'bg-[var(--color-error)]/20 text-[var(--color-error)]'
                    : 'bg-[var(--color-neutral)]/20 text-[var(--color-primary)]'
                }`}>
                  {parseFloat(viewsGrowth) > 0 ? <ArrowUp className="w-3 h-3" /> : parseFloat(viewsGrowth) !== 0 && <ArrowDown className="w-3 h-3" />}
                  {Math.abs(parseFloat(viewsGrowth))}%
                </div>
              </div>
              <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-1">{t('quizAnalytics.totalViews')}</p>
              <p className="text-4xl font-bold text-[var(--color-base-content)]">{totalViews}</p>
            </div>

            <div className="p-6 rounded-xl bg-[var(--color-base-200)] border border-[var(--color-base-300)] hover:border-[var(--color-secondary)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-[var(--color-secondary)]/20">
                  <TrendingUp className="w-6 h-6 text-[var(--color-secondary)]" />
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-semibold bg-[var(--color-info)]/20 text-[var(--color-info)]">
                  {period === 'day' ? t('quizAnalytics.today') : t('quizAnalytics.overall')}
                </div>
              </div>
              <p className="text-sm text-[var(--color-base-content)] opacity-60 mb-1">{t('quizAnalytics.conversionRate')}</p>
              <p className="text-4xl font-bold text-[var(--color-base-content)]">{conversionRate}%</p>
            </div>
          </div>

          <div className="space-y-6">

            <div className="p-6 rounded-xl bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--color-success)]/20">
                  <Users className="w-5 h-5 text-[var(--color-success)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-base-content)]">{t('quizAnalytics.growth.responses')}</h3>
                  <p className="text-xs text-[var(--color-base-content)] opacity-60">
                    {period === 'day' ? t('quizAnalytics.charts.hourlyBreakdown') : t('quizAnalytics.charts.monthlyBreakdown')}
                  </p>
                </div>
              </div>
              <div className="h-64">
                <canvas ref={responsesChartRef}></canvas>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--color-primary)]/20">
                  <Eye className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-base-content)]">{t('quizAnalytics.growth.views')}</h3>
                  <p className="text-xs text-[var(--color-base-content)] opacity-60">
                    {period === 'day' ? t('quizAnalytics.charts.hourlyBreakdown') : t('quizAnalytics.charts.monthlyBreakdown')}
                  </p>
                </div>
              </div>
              <div className="h-64">
                <canvas ref={viewsChartRef}></canvas>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--color-secondary)]/20">
                  <TrendingUp className="w-5 h-5 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-base-content)]">{t('quizAnalytics.charts.conversionRateTrend')}</h3>
                  <p className="text-xs text-[var(--color-base-content)] opacity-60">
                    {t('quizAnalytics.charts.conversionRatio')}
                  </p>
                </div>
              </div>
              <div className="h-64">
                <canvas ref={conversionChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}