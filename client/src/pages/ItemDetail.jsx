import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, claimsAPI } from '../services/api';
import { CATEGORIES, STATUS_CONFIG, REPUTATION_BADGES } from '../utils/constants';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  MapPin, Calendar, Eye, Tag, ArrowLeft, Share2,
  MessageCircle, CheckCircle, XCircle, Send, Loader2, AlertCircle
} from 'lucide-react';
import { LocationMiniMap } from '../components/items/LocationPicker';

export default function ItemDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showClaim, setShowClaim] = useState(false);
  const [claimAnswer, setClaimAnswer] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await itemsAPI.getOne(id);
        setItem(data.item);

        if (isAuthenticated) {
          try { const m = await itemsAPI.getMatches(id); setMatches(m.data.matches || []); } catch (e) {}
          if (data.item.reportedBy?._id === user?._id || user?.role === 'admin') {
            try { const c = await claimsAPI.getItemClaims(id); setClaims(c.data.claims || []); } catch (e) {}
          }
        }
      } catch (error) {
        toast.error('Item not found');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, isAuthenticated]);

  const handleClaim = async () => {
    if (!claimAnswer.trim()) { toast.error('Please provide verification answer'); return; }
    setClaiming(true);
    try {
      await claimsAPI.create({ itemId: id, verificationAnswers: claimAnswer });
      toast.success('Claim submitted! The owner will review your answer.');
      setShowClaim(false);
      setClaimAnswer('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit claim');
    } finally {
      setClaiming(false);
    }
  };

  const handleClaimAction = async (claimId, action) => {
    try {
      if (action === 'approve') {
        await claimsAPI.approve(claimId);
        toast.success('Claim approved! Item marked as returned.');
      } else {
        await claimsAPI.reject(claimId);
        toast.success('Claim rejected.');
      }
      // Refresh
      const { data } = await itemsAPI.getOne(id);
      setItem(data.item);
      const c = await claimsAPI.getItemClaims(id);
      setClaims(c.data.claims || []);
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="skeleton h-8 w-48 mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="skeleton h-96 rounded-2xl"></div>
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-2/3"></div>
        </div>
      </div>
    </div>
  );

  if (!item) return null;

  const category = CATEGORIES.find(c => c.value === item.category);
  const status = STATUS_CONFIG[item.status];
  const isLost = item.type === 'lost';
  const isOwner = user?._id === item.reportedBy?._id;
  const badge = REPUTATION_BADGES[item.reportedBy?.reputation?.level] || REPUTATION_BADGES.new;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-surface-500 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Images */}
        <div className="lg:col-span-3 animate-fade-in">
          <div className="relative h-[400px] rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[activeImage]?.url?.startsWith('http') ? item.images[activeImage].url : `http://localhost:5000${item.images[activeImage]?.url}`}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-50 via-surface-100 to-primary-50 dark:from-surface-800 dark:via-surface-900 dark:to-primary-900/20">
                <div className="text-7xl mb-3 animate-float">{category?.icon || '📦'}</div>
                <p className="text-xs text-surface-400 font-medium">No photo available</p>
              </div>
            )}
            <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-bold text-white ${isLost ? 'gradient-lost' : 'gradient-found'} shadow-lg`}>
              {isLost ? '🔍 LOST' : '📌 FOUND'}
            </div>
          </div>
          {item.images && item.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {item.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-primary-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 animate-slide-in-right" style={{ opacity: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge" style={{ background: status?.bg, color: status?.color }}>{status?.label}</span>
            <span className="badge" style={{ background: `${category?.color}15`, color: category?.color }}>
              {category?.icon} {category?.label}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-3">{item.title}</h1>
          <p className="text-surface-600 dark:text-surface-400 mb-6 leading-relaxed">{item.description}</p>

          {/* Meta info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-surface-400" />
              <span>{item.location?.name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-surface-400" />
              <span>{format(new Date(item.dateLostOrFound), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Eye className="w-4 h-4 text-surface-400" />
              <span>{item.views} views</span>
            </div>
          </div>

          {/* Reporter */}
          <div className="card p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">
                {item.reportedBy?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-sm">{item.reportedBy?.name}</p>
                <p className="text-xs text-surface-500 flex items-center gap-1">
                  {badge.icon} {badge.label} · {item.reportedBy?.reputation?.score || 0} points
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAuthenticated && !isOwner && item.status === 'active' && (
            <button onClick={() => setShowClaim(true)} className={`btn w-full py-3 ${isLost ? 'btn-found' : 'btn-lost'}`}>
              <MessageCircle className="w-4 h-4" />
              {isLost ? "I found this item" : "This is mine"}
            </button>
          )}

          {/* Claim Form */}
          {showClaim && (
            <div className="card p-5 mt-4 animate-fade-in">
              <h3 className="font-semibold mb-2">Submit Claim</h3>
              <div className="p-3 rounded-lg bg-warning/10 text-sm mb-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <span>To verify ownership, describe specific details about this item that only the owner would know.</span>
              </div>
              <textarea
                className="input-field min-h-[100px] resize-none mb-3"
                placeholder="Describe specific details to prove this is yours..."
                value={claimAnswer}
                onChange={(e) => setClaimAnswer(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={handleClaim} disabled={claiming} className="btn btn-primary flex-1">
                  {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Claim
                </button>
                <button onClick={() => setShowClaim(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exact Location Map */}
      {item.location?.lat && item.location?.lng && (
        <div className="mt-6 animate-slide-in-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
          <LocationMiniMap
            lat={item.location.lat}
            lng={item.location.lng}
            title={item.title}
            type={item.type}
          />
        </div>
      )}

      {/* Claims Section (for owner) */}
      {isOwner && claims.length > 0 && (
        <div className="mt-10 animate-slide-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <h2 className="text-xl font-bold mb-4">Claims ({claims.length})</h2>
          <div className="space-y-4">
            {claims.map(claim => (
              <ClaimCard
                key={claim._id}
                claim={claim}
                user={user}
                onAction={handleClaimAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Matches Section */}
      {matches.length > 0 && (
        <div className="mt-10 animate-slide-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <h2 className="text-xl font-bold mb-4">🎯 Potential Matches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {matches.map(match => {
              const matchedItem = isLost ? match.foundItem : match.lostItem;
              if (!matchedItem) return null;
              return (
                <Link key={match._id} to={`/items/${matchedItem._id}`} className="card p-4 flex gap-4 hover:border-primary-500">
                  <div className="w-16 h-16 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {matchedItem.images?.[0] ? (
                      <img src={matchedItem.images[0].url.startsWith('http') ? matchedItem.images[0].url : `http://localhost:5000${matchedItem.images[0].url}`} className="w-full h-full object-cover" />
                    ) : '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{matchedItem.title}</p>
                    <p className="text-xs text-surface-500 truncate">{matchedItem.location?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                        <div className="h-full gradient-primary rounded-full" style={{ width: `${match.score}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-primary-600">{match.score}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ Claim Card with Chat ═══
function ClaimCard({ claim, user, onAction }) {
  const [showChat, setShowChat] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(claim.messages || []);

  const handleSendMessage = async () => {
    if (!chatMsg.trim()) return;
    setSending(true);
    try {
      const { data } = await claimsAPI.addMessage(claim._id, chatMsg.trim());
      setMessages(prev => [...prev, { ...data.message, sender: user._id, senderName: user.name }]);
      setChatMsg('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">
            {claim.claimant?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{claim.claimant?.name}</p>
            <p className="text-xs text-surface-500">{format(new Date(claim.createdAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
        </div>
        <span className={`badge ${claim.status === 'approved' ? 'badge-found' : claim.status === 'rejected' ? 'badge-lost' : 'badge-active'}`}>
          {claim.status}
        </span>
      </div>

      <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800 mb-3">
        <p className="text-sm font-medium mb-1">Verification Answer:</p>
        <p className="text-sm text-surface-600 dark:text-surface-400">{claim.verificationAnswers}</p>
      </div>

      {/* Action buttons */}
      {claim.status === 'pending' && (
        <div className="flex gap-2 mb-3">
          <button onClick={() => onAction(claim._id, 'approve')} className="btn btn-found flex-1 text-sm">
            <CheckCircle className="w-4 h-4" /> Approve
          </button>
          <button onClick={() => onAction(claim._id, 'reject')} className="btn btn-danger flex-1 text-sm">
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>
      )}

      {/* Chat Toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {showChat ? 'Hide' : 'Show'} Messages ({messages.length})
      </button>

      {/* Chat Thread */}
      {showChat && (
        <div className="mt-3 animate-fade-in">
          <div className="max-h-60 overflow-y-auto space-y-2 mb-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
            {messages.length > 0 ? messages.map((msg, i) => {
              const isMe = msg.sender === user?._id;
              return (
                <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-bl-none'
                  }`}>
                    {!isMe && <p className="text-[10px] font-semibold text-primary-500 mb-0.5">{msg.senderName || claim.claimant?.name}</p>}
                    <p>{msg.content}</p>
                    <p className={`text-[9px] mt-1 ${isMe ? 'text-white/60' : 'text-surface-400'}`}>
                      {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-surface-400 text-center py-4">No messages yet. Start the conversation!</p>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="input-field flex-1 text-sm py-2"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !chatMsg.trim()}
              className="btn btn-primary px-4 py-2"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

