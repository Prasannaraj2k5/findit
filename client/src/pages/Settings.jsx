import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon, Bell, Shield, Lock, Trash2,
  Save, Moon, Sun, Eye, EyeOff, ChevronRight, Loader2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('general');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    matchAlerts: true,
    claimUpdates: true,
    systemAnnouncements: true,
  });

  // Load notification preferences from backend
  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotificationPrefs();
    }
  }, [activeTab]);

  const loadNotificationPrefs = async () => {
    setLoadingNotifs(true);
    try {
      const { data } = await usersAPI.getNotificationPreferences();
      setNotifPrefs(data.preferences);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotifSave = async () => {
    setSavingNotifs(true);
    try {
      await usersAPI.updateNotificationPreferences(notifPrefs);
      toast.success('Notification preferences saved!');
    } catch (error) {
      toast.error('Failed to save notification preferences');
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This will permanently remove ALL your data including items, claims, and notifications. This action CANNOT be undone.')) {
      return;
    }

    // Double confirmation
    if (!confirm('This is your LAST CHANCE. Type OK to confirm account deletion.')) {
      return;
    }

    setDeletingAccount(true);
    try {
      await usersAPI.deleteAccount();
      toast.success('Account deleted successfully');
      await logout();
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">Manage your account preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-1">
          <div className="space-y-1 animate-slide-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {/* General */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              {/* Theme */}
              <div className="card p-6">
                <h3 className="font-bold mb-4">Appearance</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isDark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-primary-500" />}
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-surface-500">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      isDark ? 'bg-primary-500' : 'bg-surface-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      isDark ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Account Info */}
              <div className="card p-6">
                <h3 className="font-bold mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-surface-500">{user?.name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-surface-400" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-surface-500">{user?.email}</p>
                    </div>
                    <span className="badge bg-found-100 dark:bg-found-900/30 text-found-600 text-xs">Verified</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Role</p>
                      <p className="text-sm text-surface-500 capitalize">{user?.role}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs">Admin</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="card p-6 animate-fade-in">
              <h3 className="font-bold mb-6">Notification Preferences</h3>
              {loadingNotifs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                      { key: 'matchAlerts', label: 'Match Alerts', desc: 'Get notified when a potential match is found' },
                      { key: 'claimUpdates', label: 'Claim Updates', desc: 'Updates on claims you\'ve made or received' },
                      { key: 'systemAnnouncements', label: 'System Announcements', desc: 'Platform news and feature updates' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-surface-500">{desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                          className={`relative w-12 h-7 rounded-full transition-colors ${
                            notifPrefs[key] ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600'
                          }`}
                        >
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            notifPrefs[key] ? 'translate-x-6' : 'translate-x-1'
                          }`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-700">
                    <button onClick={handleNotifSave} disabled={savingNotifs} className="btn btn-primary">
                      {savingNotifs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingNotifs ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              {/* Change Password */}
              <div className="card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-500" /> Change Password
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        className="input-field pl-10"
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        className="input-field pl-10 pr-10"
                        placeholder="Min. 6 characters"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type="password"
                        className="input-field pl-10"
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="card p-6 border-danger/20">
                <h3 className="font-bold mb-2 text-danger flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Danger Zone
                </h3>
                <p className="text-sm text-surface-500 mb-4">
                  Once you delete your account, all your data will be permanently removed. This includes your items, claims, notifications, and profile. This action cannot be undone.
                </p>
                <button onClick={handleDeleteAccount} disabled={deletingAccount} className="btn btn-danger">
                  {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
