import { Trophy, Medal, Crown, User, TrendingUp, Calendar, Award, Zap, Users, ArrowLeft } from 'lucide-react';
import { useQuizLeaderboardStore } from '../stores/QuizLeaderboardStore';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';

export default function QuizLeaderboard() {
  const { leaderboardData, setTimeFilter, timeFilter, fetchLeaderboard, quizName } = useQuizLeaderboardStore()
  const isFetched = useRef<boolean>(false)
  const params = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-[var(--color-warning)]" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-[var(--color-base-content)] opacity-60">#{index + 1}</span>;
    }
  };

  const stats = {
    totalParticipants: leaderboardData.length,
    averageScore: leaderboardData.length >= 1 ? Math.round(leaderboardData.reduce((sum, p) => sum + p.score, 0) / leaderboardData.length) : 0,
    topScore: leaderboardData[0]?.score || 0,
    passRate: leaderboardData.length >= 1 ? Math.round((leaderboardData.filter(p => p.score >= 70).length / leaderboardData.length) * 100) : 0
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-32 h-32 bg-[var(--color-base-300)] rounded-full flex items-center justify-center mb-6">
        <Trophy className="w-16 h-16 text-[var(--color-base-content)] opacity-30" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-[var(--color-base-content)]">
        {t('quizLeaderBoard.noParticipants')}
      </h3>
      <p className="text-[var(--color-base-content)] opacity-60 mb-6 text-center max-w-md">
        {t('quizLeaderBoard.noParticipantsDesc')}
      </p>
      <button
        onClick={() => navigate(`/start/quiz/${params.id}`)}
        className="cursor-pointer px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold hover:scale-105 transition-all flex items-center gap-2"
      >
        <Trophy className="w-5 h-5" />
        {t('quizLeaderBoard.noParticipantsButton')}
      </button>
    </div>
  );

  useEffect(() => {
    if (isFetched.current) return

    fetchLeaderboard(params.id)

    isFetched.current = true
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-base-100)] to-[var(--color-base-200)] p-6">

      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-warning)] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      <div className="container mx-auto max-w-6xl relative z-10">

        <button
          onClick={() => window.history.back()}
          className="cursor-pointer mb-6 px-4 py-2 rounded-xl bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('quizLeaderBoard.buttonBack')}
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-base-content)] mb-2">{t('quizLeaderBoard.title')}</h1>
          <p className="text-lg text-[var(--color-base-content)] opacity-70">
            {quizName}
          </p>
        </div>

        {leaderboardData.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[var(--color-base-content)]">{stats.totalParticipants}</p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('quizLeaderBoard.participants')}</p>
              </div>
              <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-[var(--color-success)] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[var(--color-base-content)]">{stats.averageScore}%</p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('quizLeaderBoard.avgScore')}</p>
              </div>
              <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-xl p-6 text-center">
                <Trophy className="w-8 h-8 text-[var(--color-warning)] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[var(--color-base-content)]">{stats.topScore}%</p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('quizLeaderBoard.topScore')}</p>
              </div>
              <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-xl p-6 text-center">
                <Award className="w-8 h-8 text-[var(--color-info)] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[var(--color-base-content)]">{stats.passRate}%</p>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('quizLeaderBoard.passRate')}</p>
              </div>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {['all', t('quizLeaderBoard.today'), t('quizLeaderBoard.week'), t('quizLeaderBoard.month')].map(filter => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`cursor-pointer px-6 py-2 rounded-xl font-medium capitalize transition-all ${
                    timeFilter === filter
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]'
                      : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-90'
                  }`}
                >
                  {filter === 'all' ? t('quizLeaderBoard.allTime') : `${t('quizLeaderBoard.thisText')} ${filter}`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">

              {leaderboardData[1] && (
                <div className="mt-8">
                  <div className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-t-2xl p-6 text-center text-white">
                    <Medal className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{t('quizLeaderBoard.second')}</p>
                  </div>
                  <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-b-2xl p-4">
                    <p className="font-bold text-lg text-[var(--color-base-content)] text-center mb-2">
                      {leaderboardData[1].name}
                    </p>
                    <p className="text-3xl font-bold text-center text-[var(--color-secondary)]">
                      {leaderboardData[1].score}%
                    </p>
                    <p className="text-sm text-center text-[var(--color-base-content)] opacity-60">
                      {leaderboardData[1].totalPoints}/{leaderboardData[1].maxPoints} {t('quizLeaderBoard.pts')}
                    </p>
                  </div>
                </div>
              )}

              {leaderboardData[0] && (
                <div>
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-2xl p-8 text-center text-white shadow-2xl">
                    <Crown className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{t('quizLeaderBoard.first')}</p>
                  </div>
                  <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-warning)] rounded-b-2xl p-6 shadow-xl">
                    <p className="font-bold text-xl text-[var(--color-base-content)] text-center mb-2">
                      {leaderboardData[0].name}
                    </p>
                    <p className="text-4xl font-bold text-center text-[var(--color-warning)]">
                      {leaderboardData[0].score}%
                    </p>
                    <p className="text-sm text-center text-[var(--color-base-content)] opacity-60">
                      {leaderboardData[0].totalPoints}/{leaderboardData[0].maxPoints} {t('quizLeaderBoard.pts')}
                    </p>
                  </div>
                </div>
              )}

              {leaderboardData[2] && (
                <div className="mt-8">
                  <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-t-2xl p-6 text-center text-white">
                    <Medal className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{t('quizLeaderBoard.third')}</p>
                  </div>
                  <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-b-2xl p-4">
                    <p className="font-bold text-lg text-[var(--color-base-content)] text-center mb-2">
                      {leaderboardData[2].name}
                    </p>
                    <p className="text-3xl font-bold text-center text-[var(--color-accent)]">
                      {leaderboardData[2].score}%
                    </p>
                    <p className="text-sm text-center text-[var(--color-base-content)] opacity-60">
                      {leaderboardData[2].totalPoints}/{leaderboardData[2].maxPoints} {t('quizLeaderBoard.pts')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-base-300)]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[var(--color-base-content)] font-bold">{t('quizLeaderBoard.rank')}</th>
                      <th className="px-6 py-4 text-left text-[var(--color-base-content)] font-bold">{t('quizLeaderBoard.participant')}</th>
                      <th className="px-6 py-4 text-center text-[var(--color-base-content)] font-bold">{t('quizLeaderBoard.score')}</th>
                      <th className="px-6 py-4 text-center text-[var(--color-base-content)] font-bold">{t('quizLeaderBoard.points')}</th>
                      <th className="px-6 py-4 text-center text-[var(--color-base-content)] font-bold">{t('quizLeaderBoard.time')}</th>
                      <th className="px-6 py-4 text-center text-[var(--color-base-content)] font-bold">{t('quizLeaderBoard.completed')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((participant, index) => (
                      <tr
                        key={participant.id}
                        className={`border-t border-[var(--color-base-300)] hover:bg-[var(--color-base-100)] transition-all ${
                          index < 3 ? 'bg-[var(--color-base-100)]' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-[var(--color-base-300)] flex items-center justify-center`}>
                              {getRankIcon(index)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-[var(--color-primary-content)]" />
                            </div>
                            <span className="font-medium text-[var(--color-base-content)]">{participant.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-2xl font-bold text-[var(--color-base-content)]">{participant.score}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[var(--color-base-content)]">
                            {participant.totalPoints}/{participant.maxPoints}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-[var(--color-base-content)]">
                            <Zap className="w-4 h-4" />
                            {participant.timeTaken}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-[var(--color-base-content)] opacity-60">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(participant.completedAt).toLocaleString('en-CA', { hour12: false }).replace(/,/, '').replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}