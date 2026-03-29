import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Search, Bell, Sun, Moon, Menu, X, ChevronDown,
  LogOut, User, Settings, Shield, Home, PlusCircle,
  Eye, LayoutDashboard, Trophy
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/browse', label: 'Browse', icon: Eye },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/report-lost', label: 'Report Lost', icon: PlusCircle },
    { to: '/report-found', label: 'Report Found', icon: PlusCircle },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              FindIt
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                data-tour={label.toLowerCase().replace(/\s/g, '-')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30'
                    : 'text-surface-600 hover:text-primary-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-primary-400 dark:hover:bg-surface-800'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 pr-4 py-2 w-64 text-sm rounded-xl"
            />
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-surface-500 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  data-tour="notifications"
                  className="p-2 rounded-xl text-surface-500 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white dark:border-dark-bg"></span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef} data-tour="user-menu">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 card p-2 animate-fade-in shadow-xl z-50">
                      <div className="px-3 py-2 border-b border-surface-100 dark:border-surface-700 mb-1">
                        <p className="font-semibold text-sm">{user?.name}</p>
                        <p className="text-xs text-surface-500">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors" onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors" onClick={() => setProfileOpen(false)}>
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors" onClick={() => setProfileOpen(false)}>
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-primary-600" onClick={() => setProfileOpen(false)}>
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-surface-100 dark:border-surface-700" />
                      <button
                        onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost text-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 py-2.5 text-sm"
              />
            </form>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                    : 'text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
