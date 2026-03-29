import { FileText, Users, Shield, AlertTriangle, Scale, Ban, RefreshCw } from 'lucide-react';

const sections = [
  {
    icon: <Users className="w-5 h-5" />,
    title: '1. Acceptance of Terms',
    content: 'By creating an account or using FindIt, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the platform. FindIt is intended for use by students, faculty, and staff of participating universities.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: '2. User Accounts',
    content: 'You must register with a valid university email address. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information and keep it up to date. One account per person — sharing accounts is prohibited. You must be at least 16 years old to use FindIt.',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: '3. Item Reporting',
    content: 'All item reports must be truthful and made in good faith. Do not report items you have not actually lost or found. Provide accurate descriptions, locations, and dates. Verification clues should be specific enough to prove ownership but not so detailed that they compromise security (e.g., don\'t include PINs or passwords as clues). You are responsible for the accuracy of the information you provide.',
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: '4. Claims & Item Recovery',
    content: 'Claims must be made honestly. Falsely claiming items that do not belong to you is a violation of these terms and may result in account suspension. Both finders and claimants should arrange safe, public campus meeting locations for item handover. FindIt is not responsible for the condition of recovered items. FindIt acts solely as a platform to connect lost item owners with finders — we do not take physical possession of items.',
  },
  {
    icon: <Ban className="w-5 h-5" />,
    title: '5. Prohibited Conduct',
    content: 'The following activities are strictly prohibited: Filing false reports or fraudulent claims. Harassing, threatening, or abusing other users. Attempting to use the platform for illegal activities. Uploading malicious content, spam, or inappropriate images. Manipulating the reputation system through fake interactions. Scraping, crawling, or collecting data from FindIt without authorization.',
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: '6. Limitation of Liability',
    content: 'FindIt is provided "as is" without warranties of any kind. We do not guarantee that lost items will be found or recovered. We are not liable for any disputes between users, damage to items, or losses incurred through the use of the platform. Users interact at their own risk and are encouraged to exercise reasonable judgment and caution.',
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: '7. Changes & Termination',
    content: 'We reserve the right to modify these terms at any time. Significant changes will be communicated via in-app notification. We may suspend or terminate accounts that violate these terms. You may delete your account at any time through the Settings page.',
  },
];

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-surface-500">Last updated: March 2026</p>
      </div>

      <div className="card p-6 mb-8 animate-slide-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
          Welcome to FindIt. These Terms of Service govern your access to and use of the FindIt University Lost & Found platform. Please read them carefully before using our services.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <div key={i} className="card p-6 animate-slide-in-up" style={{ animationDelay: `${0.1 + i * 0.04}s`, opacity: 0 }}>
            <h2 className="text-base font-bold mb-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                {section.icon}
              </div>
              {section.title}
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed pl-12">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6 mt-8 text-center animate-slide-in-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
        <p className="text-sm text-surface-500">
          Questions about these terms? Contact us at{' '}
          <a href="mailto:legal@findit.university.in" className="text-primary-500 hover:underline font-medium">
            legal@findit.university.in
          </a>
        </p>
      </div>
    </div>
  );
}
