import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const TOUR_STEPS = [
  {
    target: '[data-tour="browse"]',
    title: 'Browse Items',
    description: 'Search and filter through all lost & found items posted by the campus community.',
    icon: '🔍',
    position: 'bottom',
  },
  {
    target: '[data-tour="leaderboard"]',
    title: 'Community Leaderboard',
    description: 'See who\'s helped return the most items and climb the ranks!',
    icon: '🏆',
    position: 'bottom',
  },
  {
    target: '[data-tour="report-lost"]',
    title: 'Report Lost Items',
    description: 'Lost something? Report it here with details and we\'ll try to find a match.',
    icon: '📢',
    position: 'bottom',
  },
  {
    target: '[data-tour="report-found"]',
    title: 'Report Found Items',
    description: 'Found something on campus? Report it to help reunite it with its owner.',
    icon: '📌',
    position: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    description: 'Get alerts when someone finds your item, or when there\'s a new match!',
    icon: '🔔',
    position: 'bottom-end',
  },
  {
    target: '[data-tour="user-menu"]',
    title: 'Your Profile',
    description: 'Access your dashboard, profile, settings, and track your reputation score.',
    icon: '👤',
    position: 'bottom-end',
  },
];

const STORAGE_KEY = 'findit_tour_complete';

export default function OnboardingTour() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState(null);

  // Only show on home page, after login, if not completed
  useEffect(() => {
    if (!isAuthenticated || location.pathname !== '/') return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setIsActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, location.pathname]);

  const positionTooltip = useCallback((stepIdx) => {
    const step = TOUR_STEPS[stepIdx];
    const el = document.querySelector(step.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setHighlightRect({
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
    });

    const tooltipWidth = 320;
    let top = rect.bottom + 12;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    // Keep tooltip within viewport
    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) left = window.innerWidth - tooltipWidth - 16;
    if (top + 200 > window.innerHeight) top = rect.top - 220;

    setTooltipPos({ top, left });
  }, []);

  useEffect(() => {
    if (isActive) positionTooltip(currentStep);
  }, [isActive, currentStep, positionTooltip]);

  useEffect(() => {
    if (!isActive) return;
    const handler = () => positionTooltip(currentStep);
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler);
    };
  }, [isActive, currentStep, positionTooltip]);

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={completeTour}
      />

      {/* Highlight cutout */}
      {highlightRect && (
        <div
          className="fixed z-[9999] rounded-xl pointer-events-none"
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
            border: '2px solid rgba(99,102,241,0.6)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] animate-fade-in"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 320,
        }}
      >
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-2xl border border-surface-200 dark:border-surface-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{step.icon}</span>
              <h3 className="font-bold text-base">{step.title}</h3>
            </div>
            <button onClick={completeTour} className="text-surface-400 hover:text-surface-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 leading-relaxed">
            {step.description}
          </p>

          {/* Progress + Nav */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep ? 'bg-primary-500 w-5' : i < currentStep ? 'bg-primary-300' : 'bg-surface-200 dark:bg-surface-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button onClick={prevStep} className="text-sm text-surface-500 hover:text-surface-700 flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="btn btn-primary text-sm py-1.5 px-4"
              >
                {currentStep < TOUR_STEPS.length - 1 ? (
                  <span className="flex items-center gap-1">Next <ChevronRight className="w-3.5 h-3.5" /></span>
                ) : (
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Got it!</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
