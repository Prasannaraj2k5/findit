import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import { format } from 'date-fns';
import {
  Bell, Check, CheckCheck, Trash2, Package, MessageCircle,
  AlertCircle, Star, Target, Info, ChevronRight
} from 'lucide-react';

const NOTIF_ICONS = {
  match: { icon: Target, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  claim: { icon: MessageCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  claim_approved: { icon: Check, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  claim_rejected: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  message: { icon: MessageCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  system: { icon: Info, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationsAPI.getAll({ limit: 50 });
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn btn-secondary text-sm"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl w-fit animate-slide-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.id
                ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card p-4 flex gap-4">
              <div className="skeleton w-10 h-10 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4"></div>
                <div className="skeleton h-3 w-full"></div>
                <div className="skeleton h-3 w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2 stagger-children">
          {filtered.map((n) => {
            const config = NOTIF_ICONS[n.type] || NOTIF_ICONS.system;
            const Icon = config.icon;

            return (
              <div
                key={n._id}
                className={`card p-4 flex items-start gap-4 animate-fade-in transition-all cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 notif-${n.type || 'system'} ${
                  !n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                }`}
                style={{ opacity: 0 }}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: config.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`text-sm font-semibold truncate ${!n.isRead ? '' : 'text-surface-600 dark:text-surface-400'}`}>
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-xs text-surface-400 mt-1">
                    {format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>

                {n.actionUrl && (
                  <Link
                    to={n.actionUrl}
                    className="p-2 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center animate-fade-in">
          <Bell className="w-16 h-16 mx-auto mb-4 text-surface-300 dark:text-surface-600" />
          <h3 className="text-lg font-semibold mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-surface-500 dark:text-surface-400 mb-4">
            {filter === 'unread'
              ? "You're all caught up! Check back later."
              : 'Notifications will appear here when there are updates about your items.'}
          </p>
          {filter === 'unread' && (
            <button onClick={() => setFilter('all')} className="btn btn-primary">
              View All Notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
}
