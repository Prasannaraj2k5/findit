import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { CATEGORIES, LOCATIONS } from '../utils/constants';
import LocationPicker from '../components/items/LocationPicker';
import toast from 'react-hot-toast';
import {
  MapPin, Calendar, Tag, FileText, Upload, X,
  AlertCircle, Eye, Phone, Mail, ChevronRight, Loader2
} from 'lucide-react';

export default function ReportLost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: { name: '' },
    dateLostOrFound: '',
    contactInfo: { email: '', phone: '', preferredMethod: 'in_app' },
    verificationClues: '',
  });

  const filteredLocations = LOCATIONS.filter(l =>
    l.toLowerCase().includes(formData.location.name.toLowerCase())
  );

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('type', 'lost');
      fd.append('category', formData.category);
      fd.append('location', JSON.stringify(formData.location));
      fd.append('dateLostOrFound', formData.dateLostOrFound);
      fd.append('contactInfo', JSON.stringify(formData.contactInfo));
      fd.append('verificationClues', formData.verificationClues);
      images.forEach(img => fd.append('images', img));

      const { data } = await itemsAPI.create(fd);
      toast.success('Lost item reported successfully!');
      if (data.matchCount > 0) {
        toast.success(`${data.matchCount} potential match(es) found!`, { icon: '🎯' });
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Location & Date' },
    { num: 3, label: 'Verification' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-lost flex items-center justify-center text-white shadow-lg">
            🔍
          </div>
          <div>
            <h1 className="text-2xl font-bold">Report Lost Item</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Provide details to help others find your item</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 animate-slide-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setStep(s.num)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s.num
                  ? 'gradient-lost text-white shadow-md'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
              }`}
            >
              {s.num}
            </button>
            <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? 'text-lost-600' : 'text-surface-400'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-lost-500' : 'bg-surface-200 dark:bg-surface-700'}`}></div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card p-6 sm:p-8 animate-slide-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Black iPhone 15 Pro with clear case"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Category *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: c.value })}
                      className={`p-3 rounded-xl border text-center transition-all text-sm ${
                        formData.category === c.value
                          ? 'border-lost-500 bg-lost-50 dark:bg-lost-900/20 text-lost-700 dark:text-lost-400 shadow-sm'
                          : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                      }`}
                    >
                      <span className="text-xl block mb-1">{c.icon}</span>
                      <span className="text-xs">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description *</label>
                <textarea
                  className="input-field min-h-[120px] resize-none"
                  placeholder="Describe the item in detail (color, brand, distinguishing features, contents...)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Images (optional, max 5)</label>
                <div className="flex flex-wrap gap-3">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                      <Upload className="w-5 h-5 text-surface-400" />
                      <span className="text-[10px] text-surface-400 mt-1">Upload</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setStep(2)} className="btn btn-primary">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location & Date */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-1.5">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="Where did you lose it?"
                    value={formData.location.name}
                    onChange={(e) => {
                      setFormData({ ...formData, location: { ...formData.location, name: e.target.value } });
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    required
                  />
                </div>
                {showLocationSuggestions && formData.location.name && filteredLocations.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full card p-1 max-h-48 overflow-y-auto shadow-xl">
                    {filteredLocations.map(l => (
                      <button
                        key={l}
                        type="button"
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800"
                        onClick={() => {
                          setFormData({ ...formData, location: { ...formData.location, name: l } });
                          setShowLocationSuggestions(false);
                        }}
                      >
                        <MapPin className="w-3.5 h-3.5 inline mr-2 text-surface-400" />
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Map Location Picker */}
              <LocationPicker
                type="lost"
                value={formData.location}
                onChange={(coords) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, lat: coords.lat, lng: coords.lng }
                }))}
              />

              <div>
                <label className="block text-sm font-medium mb-1.5">Date Lost *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="date"
                    className="input-field pl-10"
                    value={formData.dateLostOrFound}
                    onChange={(e) => setFormData({ ...formData, dateLostOrFound: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Contact Info (optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="email"
                      className="input-field pl-10"
                      placeholder="Contact email"
                      value={formData.contactInfo.email}
                      onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, email: e.target.value } })}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="tel"
                      className="input-field pl-10"
                      placeholder="Phone number"
                      value={formData.contactInfo.phone}
                      onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, phone: e.target.value } })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
                <button type="button" onClick={() => setStep(3)} className="btn btn-primary">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-lost-50 dark:bg-lost-900/20 border border-lost-200 dark:border-lost-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-lost-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-lost-700 dark:text-lost-400">Verification Clues (Private)</h4>
                    <p className="text-xs text-lost-600 dark:text-lost-500 mt-1">
                      These clues are NEVER shown publicly. When someone claims your item, they must prove ownership by answering questions about these details. The better the clues, the more secure the verification.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Verification Clues *</label>
                <textarea
                  className="input-field min-h-[120px] resize-none"
                  placeholder="Example: The phone has a small scratch on the top-left corner. The wallpaper is a sunset photo. There's a SpongeBob sticker on the case."
                  value={formData.verificationClues}
                  onChange={(e) => setFormData({ ...formData, verificationClues: e.target.value })}
                  required
                />
                <p className="text-xs text-surface-400 mt-1">
                  <Eye className="w-3 h-3 inline mr-1" />
                  Only visible to you and admins during the claim process
                </p>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
                <button type="submit" disabled={loading} className="btn btn-lost px-8">
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
                  ) : (
                    <span className="flex items-center gap-2">🔍 Report Lost Item</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
