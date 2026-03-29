import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { STATUS_CONFIG } from '../utils/constants';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Users, Package, TrendingUp, AlertCircle, Trash2, Shield,
  Eye, BarChart3, Activity, CheckCircle, Clock, Download, Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, itemsRes, usersRes] = await Promise.allSettled([
        adminAPI.getStats(),
        adminAPI.getItems({ limit: 20 }),
        adminAPI.getUsers({ limit: 20 }),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
      if (itemsRes.status === 'fulfilled') setItems(itemsRes.value.data.items || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Remove this item?')) return;
    try {
      await adminAPI.deleteItem(id);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await adminAPI.exportData();
      // Generate CSV from items
      const headers = ['ID', 'Title', 'Type', 'Category', 'Status', 'Location', 'Date Lost/Found', 'Reported By', 'Views', 'Created At'];
      const rows = data.items.map(i => [
        i.id, `"${i.title}"`, i.type, i.category, i.status,
        `"${i.location}"`, i.dateLostOrFound, `"${i.reportedBy}"`, i.views, i.createdAt
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `findit-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Total Items', value: stats.totalItems, icon: Package, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Recovery Rate', value: `${stats.recoveryRate}%`, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Pending Claims', value: stats.pendingClaims, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Lost Items', value: stats.lostItems, icon: AlertCircle, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { label: 'Found Items', value: stats.foundItems, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Items This Week', value: stats.recentItems, icon: Activity, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Closed Items', value: stats.closedItems, icon: CheckCircle, color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Manage users, items, and platform analytics</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn btn-secondary"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="card p-5">
                  <div className="skeleton h-10 w-10 rounded-xl mb-3"></div>
                  <div className="skeleton h-6 w-16 mb-1"></div>
                  <div className="skeleton h-3 w-24"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <div key={stat.label} className="card p-5 animate-fade-in" style={{ opacity: 0, animationDelay: `${i * 0.05}s` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-surface-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="animate-fade-in">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-700">
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">Item</th>
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">Reporter</th>
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">Date</th>
                    <th className="px-4 py-3 text-right font-semibold text-surface-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const status = STATUS_CONFIG[item.status];
                    return (
                      <tr key={item._id} className="border-b border-surface-50 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-sm">
                              {item.type === 'lost' ? '🔍' : '📌'}
                            </div>
                            <span className="font-medium truncate max-w-[200px]">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>{item.type}</span>
                        </td>
                        <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{item.reportedBy?.name}</td>
                        <td className="px-4 py-3">
                          <span className="badge" style={{ background: status?.bg, color: status?.color }}>{status?.label}</span>
                        </td>
                        <td className="px-4 py-3 text-surface-500">{format(new Date(item.createdAt), 'MMM d')}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteItem(item._id)} className="p-1.5 rounded-lg text-surface-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-700">
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">Reputation</th>
                    <th className="px-4 py-3 text-left font-semibold text-surface-500">Joined</th>
                    <th className="px-4 py-3 text-right font-semibold text-surface-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-surface-50 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-surface-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.role === 'admin' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700' : 'bg-surface-100 dark:bg-surface-800 text-surface-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u.reputation?.score || 0} pts</td>
                      <td className="px-4 py-3 text-surface-500">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="input-field py-1 px-2 text-xs w-24"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
