import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import { CATEGORIES } from '../utils/constants';
import { format } from 'date-fns';
import {
  Search, Shield, Zap, ArrowRight, CheckCircle2,
  MapPin, Package, Users, TrendingUp, Star, Calendar, Eye, Tag
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [recentItems, setRecentItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await itemsAPI.getAll({ limit: 6, sort: '-createdAt', status: 'active' });
        setRecentItems(data.items || []);
      } catch (err) {
        console.error('Failed to load recent items:', err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchRecent();
  }, []);

  const stats = [
    { label: 'Items Recovered', value: '2,450+', icon: Package, color: '#10b981' },
    { label: 'Active Users', value: '8,200+', icon: Users, color: '#3b82f6' },
    { label: 'Recovery Rate', value: '78%', icon: TrendingUp, color: '#f59e0b' },
    { label: 'Universities', value: '15+', icon: MapPin, color: '#8b5cf6' },
  ];

  const features = [
    {
      icon: Search,
      title: 'Smart Matching',
      description: 'Intelligent algorithm automatically matches lost items with found reports using keywords, location, and date proximity.',
      color: '#6366f1',
    },
    {
      icon: Shield,
      title: 'Verified Claims',
      description: 'Secure verification system prevents fraud. Only the true owner can prove ownership through hidden verification clues.',
      color: '#10b981',
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Real-time alerts when a match is found. Get notified instantly via in-app notifications and email.',
      color: '#f59e0b',
    },
    {
      icon: Star,
      title: 'Trust & Reputation',
      description: 'Build your campus reputation by helping others. Earn trust badges and recognition for successful returns.',
      color: '#ec4899',
    },
  ];

  const steps = [
    { step: '01', title: 'Report', description: 'Report your lost or found item with details, photos, and verification clues.', color: '#f97316' },
    { step: '02', title: 'Match', description: 'Our smart system automatically finds potential matches from all reported items.', color: '#6366f1' },
    { step: '03', title: 'Verify', description: 'The owner proves ownership by answering verification questions.', color: '#10b981' },
    { step: '04', title: 'Reunite', description: 'Connect with the finder and recover your item safely.', color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-found-400 animate-pulse"></span>
              Trusted by 8,200+ students across 15+ universities
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight animate-slide-in-up">
              Lost Something?
              <br />
              <span className="bg-gradient-to-r from-primary-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                We'll Help You Find It
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              The smartest campus lost & found platform. Report, discover, and recover your belongings with smart matching and verified claims.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to={isAuthenticated ? '/report-lost' : '/register'} className="btn btn-primary text-base px-8 py-3 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50">
                Report Lost Item <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/browse" className="btn bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 text-base px-8 py-3">
                Browse Found Items
              </Link>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" className="fill-surface-50 dark:fill-dark-bg" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className="card p-5 text-center animate-fade-in" style={{ opacity: 0, animationDelay: `${i * 0.1}s` }}>
              <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
              <div className="text-xs text-surface-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ LIVE ITEM FEED ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Recently <span className="bg-gradient-to-r from-lost-500 to-found-500 bg-clip-text text-transparent">Reported</span>
            </h2>
            <p className="text-surface-500 dark:text-surface-400">Latest items from the campus community</p>
          </div>
          <Link to="/browse" className="btn btn-secondary hidden sm:flex">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-40 rounded-none"></div>
                <div className="p-4 space-y-3">
                  <div className="skeleton h-5 w-3/4"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-3 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {recentItems.map(item => {
              const category = CATEGORIES.find(c => c.value === item.category);
              const isLost = item.type === 'lost';
              return (
                <Link
                  key={item._id}
                  to={`/items/${item._id}`}
                  className={`card ${isLost ? 'card-lost' : 'card-found'} block overflow-hidden group card-hover-lift animate-fade-in`}
                  style={{ opacity: 0 }}
                >
                  <div className="relative h-40 bg-surface-100 dark:bg-surface-800 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0].url?.startsWith('http') ? item.images[0].url : `http://localhost:5000${item.images[0].url}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-800 dark:to-surface-900">
                        {category?.icon || '📦'}
                      </div>
                    )}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${isLost ? 'gradient-lost' : 'gradient-found'} shadow-lg`}>
                      {isLost ? '🔍 LOST' : '📌 FOUND'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">{item.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-surface-500 mt-2">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location?.name}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(item.dateLostOrFound), 'MMM d')}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-surface-300" />
            <p className="text-surface-500">No items reported yet. Be the first!</p>
          </div>
        )}

        <div className="text-center mt-6 sm:hidden">
          <Link to="/browse" className="btn btn-primary">View All Items <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Four simple steps to recover your lost items or help someone find theirs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.step} className="text-center animate-fade-in" style={{ opacity: 0, animationDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ background: step.color, boxShadow: `0 8px 24px ${step.color}30` }}>
                {step.step}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface-50 dark:bg-surface-900/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              Built with modern technology to make finding lost items effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div key={feature.title} className="card p-6 flex gap-5 card-hover-lift animate-fade-in" style={{ opacity: 0, animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${feature.color}15` }}>
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="card gradient-primary p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 rounded-full blur-[60px]"></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of students already using FindIt to recover their lost belongings.
            </p>
            <Link to={isAuthenticated ? '/report-lost' : '/register'} className="btn bg-white text-primary-700 font-bold px-8 py-3 text-base hover:bg-white/90 shadow-xl">
              {isAuthenticated ? 'Report an Item' : 'Create Free Account'} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
