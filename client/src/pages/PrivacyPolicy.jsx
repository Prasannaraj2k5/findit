import { Shield, Eye, Database, Lock, Trash2, Mail, Globe } from 'lucide-react';

const sections = [
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Information We Collect',
    content: [
      '**Account Information:** When you register, we collect your name, university email address, and password (securely hashed).',
      '**Item Reports:** Details you provide about lost or found items, including descriptions, photos, location data (including GPS coordinates if you choose to pin a location), and dates.',
      '**Usage Data:** We collect anonymous analytics about how you interact with the platform, including pages visited, search queries, and feature usage.',
      '**Communication Data:** Messages sent through our claim chat system are stored to facilitate item recovery.',
    ],
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: 'How We Use Your Information',
    content: [
      'To operate and maintain the FindIt platform and match lost items with found items.',
      'To verify your identity and process item claims securely.',
      'To send notifications about matches, claims, and system updates.',
      'To calculate and display reputation scores and leaderboard rankings.',
      'To generate anonymized platform statistics for administration purposes.',
    ],
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Data Protection & Security',
    content: [
      'All passwords are salted and hashed using bcrypt with appropriate cost factors.',
      'Authentication tokens (JWT) expire after 30 days and are transmitted over HTTPS.',
      'Verification clues are stored with restricted access — they are never shown publicly and are only accessible during the claim review process.',
      'Location data is stored securely and only shared in the context of item reports that you voluntarily publish.',
    ],
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Information Sharing',
    content: [
      'We do **not** sell, trade, or rent your personal information to third parties.',
      'Your email and phone number are only shared with verified parties during an approved claim process.',
      'Anonymized, aggregate statistics may be shared with university administration for safety reporting.',
      'We may disclose information if required by law or to protect the safety of our users.',
    ],
  },
  {
    icon: <Trash2 className="w-5 h-5" />,
    title: 'Data Retention & Deletion',
    content: [
      'Item reports are retained for up to 12 months after creation, after which inactive items may be archived.',
      'Account data is retained as long as your account exists.',
      'You can delete your account at any time through Settings → Security → Delete Account. This permanently removes all your data from our systems.',
      'Chat messages are deleted when the associated claim is resolved or the item is archived.',
    ],
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Contact Us',
    content: [
      'If you have questions about this Privacy Policy or how your data is handled, contact us at **privacy@findit.university.in**.',
      'You may request a copy of all data we hold about you by emailing **data-requests@findit.university.in**.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-surface-500">Last updated: March 2026</p>
      </div>

      <div className="card p-6 mb-8 animate-slide-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
          FindIt is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our university lost and found platform. By using FindIt, you agree to the collection and use of information in accordance with this policy.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="card p-6 animate-slide-in-up" style={{ animationDelay: `${0.1 + i * 0.05}s`, opacity: 0 }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                {section.icon}
              </div>
              {section.title}
            </h2>
            <ul className="space-y-3">
              {section.content.map((item, j) => (
                <li key={j} className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed flex gap-2">
                  <span className="text-primary-400 mt-1 shrink-0">•</span>
                  <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-surface-900 dark:text-surface-200">$1</strong>') }} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
