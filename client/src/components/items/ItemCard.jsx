import { Link } from 'react-router-dom';
import { MapPin, Calendar, Eye, Tag } from 'lucide-react';
import { CATEGORIES, STATUS_CONFIG, REPUTATION_BADGES } from '../../utils/constants';
import { format } from 'date-fns';

export default function ItemCard({ item }) {
  const category = CATEGORIES.find(c => c.value === item.category);
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;
  const isLost = item.type === 'lost';
  const userBadge = REPUTATION_BADGES[item.reportedBy?.reputation?.level] || REPUTATION_BADGES.new;

  return (
    <Link
      to={`/items/${item._id}`}
      className={`card ${isLost ? 'card-lost' : 'card-found'} block overflow-hidden group card-hover-lift animate-fade-in`}
      style={{ opacity: 0 }}
    >
      {/* Image */}
      <div className="relative h-48 bg-surface-100 dark:bg-surface-800 overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0].url.startsWith('http') ? item.images[0].url : `http://localhost:5000${item.images[0].url}`}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {category?.icon || '📦'}
          </div>
        )}

        {/* Type badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${isLost ? 'gradient-lost' : 'gradient-found'} shadow-lg`}>
          {isLost ? '🔍 LOST' : '📌 FOUND'}
        </div>

        {/* Status badge */}
        <div
          className="absolute top-3 right-3 badge"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-3 leading-relaxed">
          {item.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-surface-500 dark:text-surface-400 mb-3">
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" style={{ color: category?.color }} />
            {category?.label || item.category}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {item.location?.name}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(item.dateLostOrFound), 'MMM d, yyyy')}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] font-bold">
              {item.reportedBy?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="text-xs font-medium">{item.reportedBy?.name || 'Anonymous'}</span>
            <span className="text-xs" title={userBadge.label}>{userBadge.icon}</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-surface-400">
            <Eye className="w-3 h-3" /> {item.views || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
