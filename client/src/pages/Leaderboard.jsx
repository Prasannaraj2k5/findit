import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import { REPUTATION_BADGES } from '../utils/constants';
import { Trophy, Medal, Award, Star, TrendingUp, Users } from 'lucide-react';

const PODIUM_COLORS = [
  { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.3)', icon: '🥇' },
  { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', glow: 'rgba(148,163,184,0.3)', icon: '🥈' },
  { bg: 'linear-gradient(135deg, #cd7c2f, #a3621a)', glow: 'rgba(205,124,47,0.3)', icon: '🥉' },
];

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await leaderboardAPI.getLeaderboard({ limit: 20 });
        setLeaders(data.leaderboard || []);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white mx-auto mb-4 shadow-lg animate-float">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Campus <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">Leaderboard</span>
        </h1>
        <p className="text-surface-500 dark:text-surface-400">
          Top contributors helping reunite people with their belongings
        </p>
      </div>

      {/* Top 3 Podium */}
      {!loading && topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-10 items-end">
          {[1, 0, 2].map((idx) => {
            const user = topThree[idx];
            const badge = REPUTATION_BADGES[user?.reputation?.level] || REPUTATION_BADGES.new;
            const podium = PODIUM_COLORS[idx];
            const isFirst = idx === 0;

            return (
              <div
                key={user?._id}
                className={`animate-slide-in-up text-center ${isFirst ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}
                style={{ animationDelay: `${idx * 0.15}s`, opacity: 0 }}
              >
                <div className={`card p-5 ${isFirst ? 'pb-8' : 'pb-6'} relative overflow-hidden`}>
                  {isFirst && (
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: podium.bg }}></div>
                  )}
                  <div className="text-3xl mb-2">{podium.icon}</div>
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ background: podium.bg, boxShadow: `0 8px 24px ${podium.glow}` }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <h3 className="font-bold text-sm truncate">{user?.name}</h3>
                  <p className="text-xs text-surface-500 mb-2">{badge.icon} {badge.label}</p>
                  <div className="text-xl font-extrabold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
                    {user?.reputation?.score || 0}
                  </div>
                  <div className="text-[10px] text-surface-400">points</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: 'Contributors', value: leaders.length, color: '#6366f1' },
          { icon: TrendingUp, label: 'Total Points', value: leaders.reduce((s, l) => s + (l.reputation?.score || 0), 0), color: '#10b981' },
          { icon: Star, label: 'Items Found', value: leaders.reduce((s, l) => s + (l.itemsFound || 0), 0), color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={stat.label} className="card p-4 text-center animate-fade-in" style={{ animationDelay: `${0.3 + i * 0.1}s`, opacity: 0 }}>
            <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-[10px] text-surface-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Full Rankings */}
      <div className="card overflow-hidden animate-slide-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
        <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-700">
          <h2 className="font-bold flex items-center gap-2"><Award className="w-4 h-4 text-primary-500" /> Full Rankings</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-8 h-8 rounded-full"></div>
                <div className="skeleton h-4 flex-1"></div>
                <div className="skeleton h-4 w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-surface-50 dark:divide-surface-800">
            {leaders.map((user, i) => {
              const badge = REPUTATION_BADGES[user.reputation?.level] || REPUTATION_BADGES.new;
              return (
                <div
                  key={user._id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <span className={`w-7 text-center font-bold text-sm ${i < 3 ? 'text-primary-500' : 'text-surface-400'}`}>
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-[10px] text-surface-500">{badge.icon} {badge.label}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-primary-600">{user.reputation?.score || 0}</div>
                    <div className="text-[10px] text-surface-400">
                      {user.itemsReported} reported · {user.successfulReturns} returned
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
