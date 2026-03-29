import { Link } from 'react-router-dom';
import { Heart, ExternalLink, Mail } from 'lucide-react';

const quickLinks = [
  { label: 'Browse Items', to: '/browse' },
  { label: 'Report Lost', to: '/report-lost' },
  { label: 'Report Found', to: '/report-found' },
  { label: 'Leaderboard', to: '/leaderboard' },
];

const supportLinks = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact-us' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms-of-service' },
];

export default function Footer() {
  return (
    <footer className="border-t border-surface-200 dark:border-surface-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                FindIt
              </span>
            </Link>
            <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
              Helping campus communities reunite with their lost belongings through smart matching and trust.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-surface-500 hover:text-primary-500 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-surface-500 hover:text-primary-500 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Connect</h4>
            <div className="flex gap-3">
              <Link to="/contact-us" className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all">
                <Mail className="w-4 h-4" />
              </Link>
              <Link to="/faq" className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all">
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-surface-200 dark:border-surface-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} FindIt. All rights reserved.
          </p>
          <p className="text-xs text-surface-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-danger fill-danger" /> for university communities
          </p>
        </div>
      </div>
    </footer>
  );
}
