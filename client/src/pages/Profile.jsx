import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, itemsAPI } from '../services/api';
import { REPUTATION_BADGES, STATUS_CONFIG, CATEGORIES } from '../utils/constants';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState';
import {
  User, Mail, Award, Edit3, Save, X, Calendar,
  Package, Search, CheckCircle, Clock, TrendingUp,
  MapPin, Eye, ArrowRight, Shield
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '' });
  const [loading, setLoading] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const badge = REPUTATION_BADGES[user?.reputation?.level] || REPUTATION_BADGES.new;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await itemsAPI.getMyItems();
        setMyItems(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setItemsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.updateProfile(formData);
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const levels = [
    { level: 'new', min: 0, max: 20, label: 'New User', icon: '🌱' },
    { level: 'trusted', min: 20, max: 50, label: 'Trusted', icon: '⭐' },
    { level: 'highly_trusted', min: 50, max: 100, label: 'Highly Trusted', icon: '🏆' },
    { level: 'champion', min: 100, max: 200, label: 'Champion', icon: '👑' },
  ];

  const currentLevel = levels.find(l => l.level === (user?.reputation?.level || 'new'));
  const progress = currentLevel
    ? Math.min(((user?.reputation?.score || 0) - currentLevel.min) / (currentLevel.max - currentLevel.min) * 100, 100)
    : 0;

  const lostItems = myItems.filter(i => i.type === 'lost');
  const foundItems = myItems.filter(i => i.type === 'found');
  const resolvedItems = myItems.filter(i => i.status === 'resolved');
  const memberSince = user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'March 2026';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reported', label: `Reported (${lostItems.length})` },
    { id: 'found', label: `Found (${foundItems.length})` },
    { id: 'achievements', label: 'Achievements' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header Card */}
      <div className="card p-0 mb-6 overflow-hidden animate-fade-in">
        {/* Cover gradient */}
        <div className="h-28 gradient-primary relative">
          <div className="absolute inset-0 bg-black/10" />
          {user?.role === 'admin' && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Administrator
            </div>
          )}
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6 -mt-10 relative">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary-500/25 border-4 border-white dark:border-surface-900">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 pt-2">
              {editing ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    className="input-field text-lg font-bold py-1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <button onClick={handleSave} disabled={loading} className="btn btn-primary py-2 px-3">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditing(false)} className="btn btn-ghost py-2 px-3">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  <button onClick={() => setEditing(true)} className="text-surface-400 hover:text-primary-500 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-surface-500 flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" /> {user?.email}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="badge" style={{ background: `${badge.color}15`, color: badge.color }}>
                  {badge.icon} {badge.label}
                </span>
                <span className="text-xs text-surface-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Reputation', value: user?.reputation?.score || 0, icon: '⭐', color: 'text-warning' },
              { label: 'Reported', value: user?.reputation?.itemsReported || 0, icon: '📢', color: 'text-lost-500' },
              { label: 'Found', value: user?.reputation?.itemsFound || 0, icon: '📌', color: 'text-found-500' },
              { label: 'Returns', value: user?.reputation?.successfulReturns || 0, icon: '🎉', color: 'text-primary-500' },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="text-xl mb-0.5">{s.icon}</div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-surface-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface-100 dark:bg-surface-800/50 animate-slide-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-surface-800 shadow-sm text-primary-600 dark:text-primary-400'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-slide-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Reputation Progress */}
            <div className="card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-500" /> Reputation Progress
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{badge.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{badge.label}</span>
                    <span className="text-sm text-surface-500">{user?.reputation?.score || 0} pts</span>
                  </div>
                  <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-surface-500 mt-1">
                    {currentLevel && currentLevel.max - (user?.reputation?.score || 0)} more points to next level
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {levels.map(l => (
                  <div key={l.level} className={`text-center p-3 rounded-xl ${l.level === user?.reputation?.level ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : 'opacity-50'}`}>
                    <span className="text-2xl block">{l.icon}</span>
                    <span className="text-[10px] font-medium block mt-1">{l.label}</span>
                    <span className="text-[9px] text-surface-500">{l.min}+ pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" /> Recent Activity
              </h3>
              {myItems.length > 0 ? (
                <div className="space-y-3">
                  {myItems.slice(0, 5).map(item => {
                    const catData = CATEGORIES.find(c => c.value === item.category);
                    const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;
                    return (
                      <Link key={item._id} to={`/items/${item._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.type === 'lost' ? 'bg-lost-50 dark:bg-lost-900/20' : 'bg-found-50 dark:bg-found-900/20'}`}>
                          {catData?.icon || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.title}</p>
                          <p className="text-xs text-surface-500 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> {item.location?.name}
                            <span>·</span>
                            {item.createdAt && format(new Date(item.createdAt), 'MMM d')}
                          </p>
                        </div>
                        <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'} text-[10px]`}>
                          {item.type.toUpperCase()}
                        </span>
                        <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  type="noItems"
                  title="No activity yet"
                  description="Start by reporting a lost or found item to build your profile."
                  actionLabel="Report an Item"
                  actionTo="/report-lost"
                />
              )}
            </div>
          </div>
        )}

        {/* Reported Items Tab */}
        {activeTab === 'reported' && (
          <div className="card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-lost-500" /> Lost Items Reported
            </h3>
            {lostItems.length > 0 ? (
              <div className="space-y-3">
                {lostItems.map(item => {
                  const catData = CATEGORIES.find(c => c.value === item.category);
                  return (
                    <Link key={item._id} to={`/items/${item._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-lost-50 dark:bg-lost-900/20 flex items-center justify-center text-lg">
                        {catData?.icon || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <p className="text-xs text-surface-500">{item.location?.name} · {item.createdAt && format(new Date(item.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                      <span className={`badge ${item.status === 'resolved' ? 'badge-found' : 'badge-active'} text-[10px]`}>
                        {item.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState type="noItems" title="No lost items reported" description="Hopefully you haven't lost anything! If you do, report it here." actionLabel="Report Lost" actionTo="/report-lost" />
            )}
          </div>
        )}

        {/* Found Items Tab */}
        {activeTab === 'found' && (
          <div className="card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-found-500" /> Found Items Reported
            </h3>
            {foundItems.length > 0 ? (
              <div className="space-y-3">
                {foundItems.map(item => {
                  const catData = CATEGORIES.find(c => c.value === item.category);
                  return (
                    <Link key={item._id} to={`/items/${item._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-found-50 dark:bg-found-900/20 flex items-center justify-center text-lg">
                        {catData?.icon || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <p className="text-xs text-surface-500">{item.location?.name} · {item.createdAt && format(new Date(item.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                      <span className={`badge ${item.status === 'resolved' ? 'badge-found' : 'badge-active'} text-[10px]`}>
                        {item.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState type="noItems" title="No found items reported" description="Found something on campus? Help reunite it with its owner!" actionLabel="Report Found" actionTo="/report-found" />
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-500" /> Achievements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: '🌟', title: 'First Report', desc: 'Report your first item', unlocked: myItems.length > 0 },
                { icon: '🔍', title: 'Lost & Found', desc: 'Report a lost item', unlocked: lostItems.length > 0 },
                { icon: '🤲', title: 'Good Samaritan', desc: 'Report a found item', unlocked: foundItems.length > 0 },
                { icon: '🏆', title: 'Trusted Member', desc: 'Reach Trusted reputation', unlocked: ['trusted', 'highly_trusted', 'champion'].includes(user?.reputation?.level) },
                { icon: '👑', title: 'Champion', desc: 'Reach Champion status', unlocked: user?.reputation?.level === 'champion' },
                { icon: '🎯', title: 'Perfect Match', desc: 'Successfully return an item', unlocked: (user?.reputation?.successfulReturns || 0) > 0 },
                { icon: '📱', title: 'Helping Hand', desc: 'Report 5+ items', unlocked: myItems.length >= 5 },
                { icon: '💎', title: 'Diamond Finder', desc: 'Return 5+ items', unlocked: (user?.reputation?.successfulReturns || 0) >= 5 },
                { icon: '🌈', title: 'Streak Master', desc: 'Report 10+ items', unlocked: myItems.length >= 10 },
              ].map((ach, i) => (
                <div key={i} className={`p-4 rounded-xl border text-center transition-all ${
                  ach.unlocked
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                    : 'opacity-40 border-surface-200 dark:border-surface-700 grayscale'
                }`}>
                  <div className="text-3xl mb-2">{ach.icon}</div>
                  <p className="text-sm font-bold mb-0.5">{ach.title}</p>
                  <p className="text-[10px] text-surface-500">{ach.desc}</p>
                  {ach.unlocked && <p className="text-[10px] text-found-500 font-semibold mt-1">✓ Unlocked</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
