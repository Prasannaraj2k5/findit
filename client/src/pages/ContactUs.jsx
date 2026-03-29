import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Clock, Send, Loader2, MessageSquare } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-surface-500">Have questions or feedback? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-4 animate-slide-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
          {[
            { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'prasannaraj2k5@gmail.com', href: 'mailto:prasannaraj2k5@gmail.com' },
            { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: '+91 99620 05819', href: 'tel:+919962005819' },
            { icon: <MapPin className="w-5 h-5" />, label: 'Address', value: 'ECE Block, Kalasalingam University, Srivilliputtur, Virudhunagar, Tamil Nadu, India 626126' },
            { icon: <Clock className="w-5 h-5" />, label: 'Hours', value: 'Mon–Fri: 9:00 AM – 5:00 PM\nSat: 10:00 AM – 2:00 PM' },
          ].map((item, i) => (
            <div key={i} className="card p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-sm text-primary-500 hover:underline">{item.value}</a>
                ) : (
                  <p className="text-sm text-surface-500 whitespace-pre-line">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3 animate-slide-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <h2 className="font-bold text-lg mb-2">Send us a message</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="your@university.in"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Subject *</label>
              <input
                type="text"
                className="input-field"
                placeholder="What is this about?"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Message *</label>
              <textarea
                className="input-field min-h-[140px] resize-none"
                placeholder="Describe your question or feedback..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Sending...</span>
              ) : (
                <span className="flex items-center gap-2 justify-center"><Send className="w-4 h-4" /> Send Message</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
