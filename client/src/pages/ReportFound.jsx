import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { CATEGORIES, LOCATIONS } from '../utils/constants';
import LocationPicker from '../components/items/LocationPicker';
import toast from 'react-hot-toast';
import {
  MapPin, Calendar, Upload, X, ChevronRight, Loader2, Mail, Phone, Package
} from 'lucide-react';

export default function ReportFound() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: { name: '' },
    dateLostOrFound: '',
    handoverStatus: 'with_finder',
    contactInfo: { email: '', phone: '', preferredMethod: 'in_app' },
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
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
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
      fd.append('type', 'found');
      fd.append('category', formData.category);
      fd.append('location', JSON.stringify(formData.location));
      fd.append('dateLostOrFound', formData.dateLostOrFound);
      fd.append('handoverStatus', formData.handoverStatus);
      fd.append('contactInfo', JSON.stringify(formData.contactInfo));
      images.forEach(img => fd.append('images', img));

      const { data } = await itemsAPI.create(fd);
      toast.success('Found item reported! Thank you for helping! 🎉');
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-found flex items-center justify-center text-white shadow-lg">
            📌
          </div>
          <div>
            <h1 className="text-2xl font-bold">Report Found Item</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Help reunite someone with their lost belongings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card p-6 sm:p-8 space-y-5 animate-slide-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Blue backpack found near library"
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
                      ? 'border-found-500 bg-found-50 dark:bg-found-900/20 text-found-700 dark:text-found-400 shadow-sm'
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
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe the item you found (color, brand, condition...)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1.5">Where did you find it? *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Location"
                value={formData.location.name}
                onChange={(e) => {
                  setFormData({ ...formData, location: { name: e.target.value } });
                  setShowLocationSuggestions(true);
                }}
                onFocus={() => setShowLocationSuggestions(true)}
                required
              />
            </div>
            {showLocationSuggestions && formData.location.name && filteredLocations.length > 0 && (
              <div className="absolute z-10 mt-1 w-full card p-1 max-h-48 overflow-y-auto shadow-xl">
                {filteredLocations.map(l => (
                  <button key={l} type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800"
                    onClick={() => { setFormData({ ...formData, location: { name: l } }); setShowLocationSuggestions(false); }}>
                    <MapPin className="w-3.5 h-3.5 inline mr-2 text-surface-400" />{l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Location Picker */}
          <LocationPicker
            type="found"
            value={formData.location}
            onChange={(coords) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, lat: coords.lat, lng: coords.lng }
            }))}
          />

          <div>
            <label className="block text-sm font-medium mb-1.5">Date Found *</label>
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

          {/* Handover Status */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Item Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: 'with_finder', label: 'With Me', icon: '🤲' },
                { value: 'ready_for_pickup', label: 'Ready for Pickup', icon: '📍' },
                { value: 'handed_to_admin', label: 'Handed to Admin', icon: '🏢' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, handoverStatus: opt.value })}
                  className={`p-3 rounded-xl border text-center transition-all text-sm ${
                    formData.handoverStatus === opt.value
                      ? 'border-found-500 bg-found-50 dark:bg-found-900/20'
                      : 'border-surface-200 dark:border-surface-700'
                  }`}
                >
                  <span className="text-xl block mb-1">{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Photos (optional)</label>
            <div className="flex flex-wrap gap-3">
              {previews.map((p, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 flex flex-col items-center justify-center cursor-pointer hover:border-found-500 transition-colors">
                  <Upload className="w-5 h-5 text-surface-400" />
                  <span className="text-[10px] text-surface-400 mt-1">Upload</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="btn btn-found px-8 py-3">
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
              ) : (
                <span className="flex items-center gap-2">📌 Report Found Item</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
