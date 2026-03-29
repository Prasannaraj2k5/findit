import { Link } from 'react-router-dom';

const illustrations = {
  noItems: (
    <div className="relative w-32 h-32 mx-auto mb-4">
      {/* Box */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-16 rounded-xl bg-gradient-to-br from-surface-200 to-surface-300 dark:from-surface-700 dark:to-surface-800 animate-float" style={{ animationDuration: '3s' }}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-22 h-4 rounded-t-lg bg-gradient-to-r from-surface-300 to-surface-200 dark:from-surface-600 dark:to-surface-700" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl">📦</div>
      </div>
      {/* Sparkles */}
      <div className="absolute top-2 right-4 text-lg animate-pulse" style={{ animationDelay: '0.2s' }}>✨</div>
      <div className="absolute top-8 left-6 text-sm animate-pulse" style={{ animationDelay: '0.8s' }}>✨</div>
      <div className="absolute bottom-0 right-8 text-xs animate-pulse" style={{ animationDelay: '1.4s' }}>⭐</div>
    </div>
  ),

  noNotifications: (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center animate-float" style={{ animationDuration: '2.5s' }}>
        <span className="text-3xl">🔔</span>
      </div>
      <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-primary-400 animate-ping" />
      <div className="absolute top-2 left-8 text-sm opacity-50 animate-bounce" style={{ animationDelay: '0.5s' }}>💤</div>
      <div className="absolute bottom-2 right-10 text-xs opacity-40">🌙</div>
    </div>
  ),

  noClaims: (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-found-100 to-found-200 dark:from-found-900/30 dark:to-found-800/30 flex items-center justify-center animate-float" style={{ animationDuration: '3.5s' }}>
        <span className="text-3xl">🤝</span>
      </div>
      <div className="absolute top-4 right-8 text-sm animate-pulse">💬</div>
      <div className="absolute top-10 left-4 text-xs animate-pulse" style={{ animationDelay: '0.6s' }}>📋</div>
    </div>
  ),

  noSearchResults: (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-lost-100 to-lost-200 dark:from-lost-900/30 dark:to-lost-800/30 flex items-center justify-center animate-float" style={{ animationDuration: '2.8s' }}>
        <span className="text-3xl">🔍</span>
      </div>
      <div className="absolute top-6 left-6 text-sm opacity-60">❓</div>
      <div className="absolute top-2 right-10 text-xs opacity-40 animate-pulse">🗂️</div>
    </div>
  ),

  success: (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-found-400 to-found-500 flex items-center justify-center animate-float" style={{ animationDuration: '2s' }}>
        <span className="text-3xl">🎉</span>
      </div>
      <div className="absolute top-0 right-6 text-lg animate-bounce">🌟</div>
      <div className="absolute top-8 left-4 text-sm animate-bounce" style={{ animationDelay: '0.3s' }}>🎊</div>
      <div className="absolute bottom-0 right-4 text-xs animate-pulse" style={{ animationDelay: '0.6s' }}>✨</div>
    </div>
  ),

  emptyProfile: (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-300 dark:from-primary-900/40 dark:to-primary-800/40 flex items-center justify-center animate-float" style={{ animationDuration: '3.2s' }}>
        <span className="text-3xl">🧑‍🎓</span>
      </div>
      <div className="absolute top-4 right-6 text-sm animate-pulse">⭐</div>
      <div className="absolute top-10 left-6 text-xs animate-pulse" style={{ animationDelay: '0.5s' }}>📊</div>
    </div>
  ),
};

export default function EmptyState({
  type = 'noItems',
  title = 'Nothing here yet',
  description = 'No items to display.',
  actionLabel,
  actionTo,
  actionIcon,
}) {
  return (
    <div className="text-center py-12 px-4 animate-fade-in">
      {illustrations[type] || illustrations.noItems}
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mx-auto mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary inline-flex items-center gap-2">
          {actionIcon} {actionLabel}
        </Link>
      )}
    </div>
  );
}
