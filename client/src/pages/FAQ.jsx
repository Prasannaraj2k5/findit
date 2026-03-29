import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I report a lost item?',
        a: 'Navigate to "Report Lost" from the top navigation. Fill in the item details including title, category, description, and location. You can pin the exact location on the map and upload photos. Our system will automatically try to match your item with found items.',
      },
      {
        q: 'How do I report a found item?',
        a: 'Click on "Report Found" in the navigation bar. Provide details about the item you found, including where and when you found it. Pin the location on the map so the owner can see exactly where it was recovered.',
      },
      {
        q: 'Do I need an account to use FindIt?',
        a: 'You can browse items without an account, but you need to register with your university email to report items, file claims, or communicate with other users. Registration is free and takes less than a minute.',
      },
    ],
  },
  {
    category: 'Claims & Verification',
    questions: [
      {
        q: 'How does the claim process work?',
        a: 'When you find your lost item listed, click "Claim This Item" and provide verification details that prove ownership (e.g., unique marks, contents, serial numbers). The finder will review your claim and can approve or reject it. You can communicate through the built-in chat system.',
      },
      {
        q: 'What are verification clues?',
        a: 'Verification clues are private details about your item that only the true owner would know. These are never shown publicly. When someone claims your item, they must provide answers that match these clues. Better clues = more secure verification.',
      },
      {
        q: 'What happens when my claim is approved?',
        a: 'You\'ll receive a notification with the finder\'s contact information. You can then arrange a meeting to collect your item. Both parties earn reputation points for successful returns.',
      },
    ],
  },
  {
    category: 'Reputation & Leaderboard',
    questions: [
      {
        q: 'How does the reputation system work?',
        a: 'You earn points by reporting items, returning found items to their owners, and contributing positively to the community. Points unlock badge levels: New User → Trusted → Highly Trusted → Champion.',
      },
      {
        q: 'What are reputation badges?',
        a: 'Badges reflect your trustworthiness in the community. 🌱 New User (0-20 pts), ⭐ Trusted (20-50 pts), 🏆 Highly Trusted (50-100 pts), 👑 Champion (100+ pts). Higher badges mean other users will trust your claims more.',
      },
    ],
  },
  {
    category: 'Account & Security',
    questions: [
      {
        q: 'How do I change my password?',
        a: 'Go to Settings from your profile menu. Under the Security tab, enter your current password and your new password. Click "Update Password" to save the change.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Navigate to Settings → Security → Delete Account. Type "DELETE" to confirm. This action is permanent and will remove all your data, reported items, and history.',
      },
      {
        q: 'Is my personal information safe?',
        a: 'Yes. Your email and contact details are only shared with verified claim participants. Verification clues are never displayed publicly. We use encryption for all sensitive data.',
      },
    ],
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (key) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFAQ = FAQ_DATA.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
          <HelpCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-surface-500">Everything you need to know about FindIt</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 animate-slide-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          type="text"
          className="input-field pl-12 py-3 text-base"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6">
        {filteredFAQ.map((cat, ci) => (
          <div key={cat.category} className="animate-slide-in-up" style={{ animationDelay: `${0.1 + ci * 0.05}s`, opacity: 0 }}>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full gradient-primary" />
              {cat.category}
            </h2>
            <div className="space-y-2">
              {cat.questions.map((item, qi) => {
                const key = `${ci}-${qi}`;
                const isOpen = openItems[key];
                return (
                  <div key={key} className="card overflow-hidden">
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      <span className="font-medium text-sm pr-4">{item.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-primary-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-surface-400 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-surface-600 dark:text-surface-400 leading-relaxed border-t border-surface-100 dark:border-surface-800 pt-3 animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredFAQ.length === 0 && (
        <div className="text-center py-12">
          <p className="text-surface-400 text-sm">No questions match your search. Try different keywords.</p>
        </div>
      )}
    </div>
  );
}
