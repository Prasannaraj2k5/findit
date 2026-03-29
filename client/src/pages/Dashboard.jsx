import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, claimsAPI, notificationsAPI, adminAPI } from '../services/api';
import { STATUS_CONFIG, REPUTATION_BADGES } from '../utils/constants';
import { format } from 'date-fns';
import {
  PlusCircle, Search, Package, Bell, TrendingUp, Eye,
  AlertCircle, CheckCircle, Clock, Award, BarChart3
} from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

export default function Dashboard() {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const calls = [
          itemsAPI.getMyItems(),
          claimsAPI.getMyClaims(),
          notificationsAPI.getAll({ limit: 5 }),
        ];
        // Admin gets platform stats too
        if (user?.role === 'admin') calls.push(adminAPI.getStats());

        const [itemsRes, claimsRes, notifRes, statsRes] = await Promise.allSettled(calls);

        if (itemsRes.status === 'fulfilled') setMyItems(itemsRes.value.data.items || []);
        if (claimsRes.status === 'fulfilled') setMyClaims(claimsRes.value.data.claims || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.notifications || []);
        if (statsRes?.status === 'fulfilled') setPlatformStats(statsRes.value.data.stats);
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const badge = REPUTATION_BADGES[user?.reputation?.level] || REPUTATION_BADGES.new;
  const lostItems = myItems.filter(i => i.type === 'lost');
  const foundItems = myItems.filter(i => i.type === 'found');
  const activeItems = myItems.filter(i => i.status === 'active');

  // Admin sees platform stats, regular users see personal stats
  const statCards = user?.role === 'admin' && platformStats ? [
    { label: 'Total Items', value: platformStats.totalItems, icon: Package, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Lost Reports', value: platformStats.lostItems, icon: Search, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { label: 'Found Reports', value: platformStats.foundItems, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Recovery Rate', value: `${platformStats.recoveryRate}%`, icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  ] : [
    { label: 'Items Reported', value: myItems.length, icon: Package, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Lost Reports', value: lostItems.length, icon: Search, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { label: 'Found Reports', value: foundItems.length, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Active', value: activeItems.length, icon: Clock, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-surface-500 dark:text-surface-400 flex items-center gap-2">
              <span>{badge.icon} {badge.label}</span>
              <span>·</span>
              <span>{user?.reputation?.score || 0} reputation points</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/report-lost" className="btn btn-lost">
              <PlusCircle className="w-4 h-4" /> Report Lost
            </Link>
            <Link to="/report-found" className="btn btn-found">
              <PlusCircle className="w-4 h-4" /> Report Found
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={stat.label} className="card p-5 animate-fade-in" style={{ opacity: 0, animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-surface-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Items */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">My Items</h2>
            <Link to="/browse" className="text-sm text-primary-500 hover:text-primary-600">View All →</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-4 flex gap-4">
                  <div className="skeleton w-16 h-16 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4"></div>
                    <div className="skeleton h-3 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : myItems.length > 0 ? (
            <div className="space-y-3">
              {myItems.slice(0, 5).map((item, i) => {
                const status = STATUS_CONFIG[item.status];
                const isLost = item.type === 'lost';
                return (
                  <Link
                    key={item._id}
                    to={`/items/${item._id}`}
                    className={`card p-4 flex items-center gap-4 animate-fade-in ${isLost ? 'card-lost' : 'card-found'}`}
                    style={{ opacity: 0, animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                      {item.images?.[0] ? (
                        <img src={item.images[0].url.startsWith('http') ? item.images[0].url : `http://localhost:5000${item.images[0].url}`} className="w-full h-full object-cover" />
                      ) : (isLost ? '🔍' : '📌')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.title}</p>
                      <p className="text-xs text-surface-500">{item.location?.name} · {format(new Date(item.createdAt), 'MMM d')}</p>
                    </div>
                    <span className="badge text-xs" style={{ background: status?.bg, color: status?.color }}>{status?.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              type="noItems"
              title="No items reported yet"
              description="Start helping the campus community by reporting lost or found items."
              actionLabel="Report Lost"
              actionTo="/report-lost"
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reputation Card */}
          <div className="card p-5 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <h3 className="font-bold mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-primary-500" /> Reputation</h3>
            <div className="text-center mb-4">
              <div className="text-3xl mb-1">{badge.icon}</div>
              <div className="font-bold text-lg" style={{ color: badge.color }}>{badge.label}</div>
              <div className="text-sm text-surface-500">{user?.reputation?.score || 0} points</div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold">{user?.reputation?.itemsReported || 0}</div>
                <div className="text-[10px] text-surface-500">Reported</div>
              </div>
              <div>
                <div className="text-lg font-bold">{user?.reputation?.itemsFound || 0}</div>
                <div className="text-[10px] text-surface-500">Found</div>
              </div>
              <div>
                <div className="text-lg font-bold">{user?.reputation?.successfulReturns || 0}</div>
                <div className="text-[10px] text-surface-500">Returned</div>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="card p-5 animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><Bell className="w-4 h-4 text-primary-500" /> Notifications</h3>
              <Link to="/notifications" className="text-xs text-primary-500">View All</Link>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 4).map(n => (
                  <div key={n._id} className={`flex items-start gap-3 p-2 rounded-lg ${n.isRead ? '' : 'bg-primary-50 dark:bg-primary-900/10'}`}>
                    <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: n.isRead ? '#cbd5e1' : '#6366f1' }}></div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{n.title}</p>
                      <p className="text-[10px] text-surface-500 truncate">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-surface-500 text-center py-4">No notifications yet</p>
            )}
          </div>

          {/* My Claims */}
          {myClaims.length > 0 && (
            <div className="card p-5 animate-fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
              <h3 className="font-bold mb-3">My Claims</h3>
              <div className="space-y-2">
                {myClaims.slice(0, 3).map(c => (
                  <Link key={c._id} to={`/items/${c.item?._id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800">
                    <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-sm">
                      {c.item?.type === 'lost' ? '🔍' : '📌'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.item?.title}</p>
                    </div>
                    <span className={`badge text-[10px] ${c.status === 'approved' ? 'badge-found' : c.status === 'rejected' ? 'badge-lost' : 'badge-active'}`}>
                      {c.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
