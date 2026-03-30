/**
 * FindIt – Persistent In-Memory Backend
 * Full working backend with file-based persistence.
 * All data is saved to server/data/store.json and survives restarts.
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ── Detect serverless environment ──────────────────────────
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// ── Multer config for file uploads ─────────────────────────
const uploadsDir = isServerless ? '/tmp/uploads' : path.join(__dirname, '..', 'uploads');
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { console.warn('Could not create uploads dir:', e.message); }

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });


// ── Data File Path ────────────────────────────────────────
const DATA_DIR = isServerless ? '/tmp/data' : path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// ── Helpers ───────────────────────────────────────────────
const genId = () => crypto.randomBytes(6).toString('hex') + Date.now().toString(36);
const now = () => new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'findit_dev_secret_key_2024_local', { expiresIn: '24h' });
const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'findit_dev_refresh_secret_2024_local', { expiresIn: '30d' });

const hashPwd = (pwd) => bcrypt.hashSync(pwd, 10);
const checkPwd = (pwd, hash) => bcrypt.compareSync(pwd, hash);

// ── Persistence Layer ─────────────────────────────────────
let saveTimer = null;

function saveStore() {
  // Debounce: save at most once every 500ms
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
    } catch (err) {
      console.error('⚠️  Failed to save store:', err.message);
    }
  }, 500);
}

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(raw);
      console.log(`📂 Loaded persistent store (${data.users?.length || 0} users, ${data.items?.length || 0} items)`);
      return data;
    }
  } catch (err) {
    console.error('⚠️  Failed to load store, starting fresh:', err.message);
  }
  return null;
}

// ── In-Memory Store ───────────────────────────────────────
const defaultStore = {
  users: [],
  items: [],
  claims: [],
  notifications: [],
  matches: [],
  notificationPreferences: [],
};

let store = loadStore() || { ...defaultStore };

// ── Seed Data (only if store is empty) ─────────────────────
function seedData() {
  if (store.users.length > 0) {
    console.log('📦 Store already has data, skipping seed');
    return;
  }

  console.log('🌱 Seeding initial data...');

  // Admin user
  store.users.push({
    _id: 'admin001',
    name: 'Admin User',
    email: 'admin@university.in',
    password: hashPwd('admin123'),
    avatar: '',
    role: 'admin',
    isVerified: true,
    reputation: { score: 150, level: 'champion', itemsReported: 12, itemsFound: 8, successfulReturns: 15 },
    createdAt: daysAgo(90),
    updatedAt: now(),
  });

  // Demo users
  const demoUsers = [
    { _id: 'user001', name: 'Priya Sharma', email: 'priya@university.in', score: 65, level: 'highly_trusted', reported: 8, found: 5, returns: 4, days: 60 },
    { _id: 'user002', name: 'Alex Johnson', email: 'alex@university.in', score: 35, level: 'trusted', reported: 5, found: 3, returns: 2, days: 45 },
    { _id: 'user003', name: 'Maya Chen', email: 'maya@university.in', score: 12, level: 'new', reported: 2, found: 1, returns: 0, days: 20 },
    { _id: 'user004', name: 'Ravi Patel', email: 'ravi@university.in', score: 88, level: 'highly_trusted', reported: 10, found: 7, returns: 6, days: 75 },
    { _id: 'user005', name: 'Sarah Williams', email: 'sarah@university.in', score: 22, level: 'trusted', reported: 3, found: 2, returns: 1, days: 30 },
  ];

  demoUsers.forEach((u) => {
    store.users.push({
      _id: u._id,
      name: u.name,
      email: u.email,
      password: hashPwd('demo123'),
      avatar: '',
      role: 'user',
      isVerified: true,
      reputation: { score: u.score, level: u.level, itemsReported: u.reported, itemsFound: u.found, successfulReturns: u.returns },
      createdAt: daysAgo(u.days),
      updatedAt: now(),
    });
  });

  // Demo items
  const demoItems = [
    { _id: 'item001', title: 'Black iPhone 15 Pro', description: 'Lost my iPhone 15 Pro with a clear silicone case near the main library. It has a small crack on the top-right corner of the screen. Last seen around 2 PM.', type: 'lost', category: 'electronics', location: { name: 'Main Library' }, dateLostOrFound: daysAgo(2), reportedBy: 'user001', status: 'active', views: 156, verificationClues: 'Wallpaper is a sunset at the beach, SpongeBob sticker on case' },
    { _id: 'item002', title: 'Blue North Face Backpack', description: 'Found a blue North Face backpack near the science building entrance. Contains some textbooks and a water bottle. Left at the security desk.', type: 'found', category: 'bags', location: { name: 'Science Hall' }, dateLostOrFound: daysAgo(1), reportedBy: 'user002', status: 'active', handoverStatus: 'handed_to_admin', views: 89 },
    { _id: 'item003', title: 'Student ID Card - Engineering', description: 'Lost my student ID card somewhere between the engineering building and the cafeteria. Name on the card is Priya S. Urgent as I need it for lab access.', type: 'lost', category: 'id_cards', location: { name: 'Engineering Building' }, dateLostOrFound: daysAgo(3), reportedBy: 'user001', status: 'active', views: 234, verificationClues: 'ID number starts with ENG-2024, photo has glasses' },
    { _id: 'item004', title: 'Silver MacBook Air M3', description: 'Found a silver MacBook Air M3 left on a desk in Computer Lab B. It was unlocked when found. Currently with campus security.', type: 'found', category: 'electronics', location: { name: 'Computer Lab' }, dateLostOrFound: daysAgo(1), reportedBy: 'user004', status: 'active', handoverStatus: 'handed_to_admin', views: 312 },
    { _id: 'item005', title: 'Car Keys with Toyota Keychain', description: 'Found a set of car keys with a Toyota keychain and a small red lanyard near the parking lot B entrance.', type: 'found', category: 'keys', location: { name: 'Parking Lot' }, dateLostOrFound: daysAgo(4), reportedBy: 'user005', status: 'active', handoverStatus: 'with_finder', views: 67 },
    { _id: 'item006', title: 'Gold Bracelet with Heart Charm', description: 'Lost a gold bracelet with a small heart charm near the gymnasium. It was a gift from my grandmother. Sentimental value.', type: 'lost', category: 'jewelry', location: { name: 'Gymnasium' }, dateLostOrFound: daysAgo(5), reportedBy: 'user003', status: 'active', views: 143, verificationClues: 'Engraved "To Maya, Love Nana" on the inside' },
    { _id: 'item007', title: 'Organic Chemistry Textbook', description: 'Found an Organic Chemistry textbook (McMurry, 9th Edition) on a bench near the Student Center. Has some highlighting inside.', type: 'found', category: 'books', location: { name: 'Student Center' }, dateLostOrFound: daysAgo(2), reportedBy: 'user002', status: 'matched', handoverStatus: 'with_finder', views: 45 },
    { _id: 'item008', title: 'Red Nike Running Shoes', description: 'Lost my red Nike running shoes (size 10) at the sports field. Left them near the bleachers after practice.', type: 'lost', category: 'sports', location: { name: 'Sports Field' }, dateLostOrFound: daysAgo(6), reportedBy: 'user004', status: 'active', views: 78, verificationClues: 'Custom insoles, name written on the tongue in black marker' },
    { _id: 'item009', title: 'Black Leather Wallet', description: 'Found a black leather wallet with multiple cards near the bus stop. Has some cash inside. Brought to the admin office.', type: 'found', category: 'wallet', location: { name: 'Bus Stop' }, dateLostOrFound: daysAgo(1), reportedBy: 'user005', status: 'active', handoverStatus: 'handed_to_admin', views: 198 },
    { _id: 'item010', title: 'Ray-Ban Aviator Sunglasses', description: 'Lost my Ray-Ban aviator sunglasses (gold frame, brown lens) in the cafeteria during lunch. Was sitting near the window.', type: 'lost', category: 'accessories', location: { name: 'Cafeteria' }, dateLostOrFound: daysAgo(3), reportedBy: 'user003', status: 'claimed', views: 112, verificationClues: 'Right lens has a tiny scratch near the edge, comes in a brown case' },
    { _id: 'item011', title: 'Research Documents Folder', description: 'Lost a manila folder containing printed research papers and handwritten notes near the Research Center. Very important for my thesis.', type: 'lost', category: 'documents', location: { name: 'Research Center' }, dateLostOrFound: daysAgo(7), reportedBy: 'user001', status: 'closed', views: 56, verificationClues: 'Documents about quantum computing, pages numbered 1-42' },
    { _id: 'item012', title: 'AirPods Pro (2nd Gen)', description: 'Found AirPods Pro in a white case near Lecture Hall A after the morning lecture. Case has a small sticker on the back.', type: 'found', category: 'electronics', location: { name: 'Lecture Hall A' }, dateLostOrFound: daysAgo(0), reportedBy: 'user004', status: 'active', handoverStatus: 'with_finder', views: 276 },
  ];

  demoItems.forEach((item) => {
    store.items.push({
      ...item,
      images: [],
      contactInfo: { phone: '', email: '', preferredMethod: 'in_app' },
      createdAt: item.dateLostOrFound,
      updatedAt: now(),
    });
  });

  // Demo claims
  store.claims.push({
    _id: 'claim001',
    item: 'item010',
    claimant: 'user002',
    verificationAnswers: 'The right lens has a small scratch near the edge. The case is brown leather.',
    status: 'pending',
    messages: [],
    createdAt: daysAgo(1),
    updatedAt: now(),
  });

  // Demo matches
  store.matches.push({
    _id: 'match001',
    lostItem: 'item003',
    foundItem: 'item009',
    score: 72,
    matchedFields: ['category', 'location', 'date'],
    status: 'pending',
    createdAt: daysAgo(1),
  });
  store.matches.push({
    _id: 'match002',
    lostItem: 'item001',
    foundItem: 'item004',
    score: 58,
    matchedFields: ['category', 'date'],
    status: 'pending',
    createdAt: daysAgo(1),
  });

  // Demo notifications
  store.notifications.push(
    { _id: 'notif001', user: 'user001', type: 'match', title: 'Potential Match Found! 🎯', message: 'A found MacBook Air might match your lost iPhone. Check it out!', relatedItem: 'item001', isRead: false, actionUrl: '/items/item001', createdAt: daysAgo(0) },
    { _id: 'notif002', user: 'user001', type: 'claim', title: 'New Claim on Your Item', message: 'Someone has claimed to know details about your lost student ID.', relatedItem: 'item003', isRead: false, actionUrl: '/items/item003', createdAt: daysAgo(1) },
    { _id: 'notif003', user: 'user001', type: 'system', title: 'Welcome to FindIt! 🎉', message: 'Start by reporting a lost item or browse found items on campus.', isRead: true, actionUrl: '/browse', createdAt: daysAgo(60) },
    { _id: 'notif004', user: 'user002', type: 'claim_approved', title: 'Claim Approved! 🎉', message: 'Your claim for "Research Documents Folder" has been approved.', relatedItem: 'item011', isRead: false, actionUrl: '/items/item011', createdAt: daysAgo(2) },
    { _id: 'notif005', user: 'user003', type: 'match', title: 'Potential Match Found! 🎯', message: 'A found wallet at the bus stop might be related to your lost sunglasses claim.', relatedItem: 'item010', isRead: false, actionUrl: '/items/item010', createdAt: daysAgo(1) },
    { _id: 'notif006', user: 'admin001', type: 'system', title: 'Weekly Admin Report 📊', message: '12 new items reported this week. 1 successful return completed. Platform engagement is up 15%.', isRead: false, actionUrl: '/admin', createdAt: daysAgo(0) },
    { _id: 'notif007', user: 'admin001', type: 'claim', title: 'Claim Needs Review', message: 'A pending claim on "Ray-Ban Aviator Sunglasses" requires your attention.', relatedItem: 'item010', isRead: false, actionUrl: '/items/item010', createdAt: daysAgo(1) },
    { _id: 'notif008', user: 'admin001', type: 'system', title: 'New User Registered', message: 'Maya Chen has joined FindIt. The platform now has 6 registered users.', isRead: true, actionUrl: '/admin', createdAt: daysAgo(3) },
    { _id: 'notif009', user: 'admin001', type: 'match', title: 'High-Score Match Detected! 🎯', message: 'A 72% match was found between "Student ID Card" and "Black Leather Wallet".', relatedItem: 'item003', isRead: false, actionUrl: '/items/item003', createdAt: daysAgo(1) },
  );

  saveStore();
  console.log('✅ Seed data created and saved to disk');
}

seedData();

// ── Auth Helpers ──────────────────────────────────────────
function getAuthUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'findit_dev_secret_key_2024_local');
    return store.users.find((u) => u._id === decoded.id) || null;
  } catch {
    return null;
  }
}

function safeUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function populateUser(userId) {
  const u = store.users.find((x) => x._id === userId);
  return u ? safeUser(u) : { _id: userId, name: 'Unknown', reputation: { score: 0, level: 'new' } };
}

function populateItem(itemId) {
  const item = store.items.find((x) => x._id === itemId);
  return item || null;
}

function updateLevel(user) {
  const s = user.reputation.score;
  if (s >= 100) user.reputation.level = 'champion';
  else if (s >= 50) user.reputation.level = 'highly_trusted';
  else if (s >= 20) user.reputation.level = 'trusted';
  else user.reputation.level = 'new';
}

// ── Smart Matching ────────────────────────────────────────
function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1 === s2) return 100;
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  let matches = 0;
  for (const word of words1) { if (words2.has(word)) matches++; }
  const union = new Set([...words1, ...words2]).size;
  return Math.round((matches / union) * 100);
}

function calculateDateProximity(date1, date2) {
  const diffDays = Math.abs((new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 100;
  if (diffDays <= 3) return 80;
  if (diffDays <= 7) return 60;
  if (diffDays <= 14) return 40;
  if (diffDays <= 30) return 20;
  return 5;
}

function findMatchesForItem(item) {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';
  const candidates = store.items.filter(i =>
    i.type === oppositeType && i.status === 'active' && i.category === item.category && i._id !== item._id
  );

  const matches = [];
  for (const candidate of candidates) {
    const catScore = 100;
    const titleSim = calculateStringSimilarity(item.title, candidate.title);
    const descSim = calculateStringSimilarity(item.description, candidate.description);
    const keywordScore = Math.round(titleSim * 0.6 + descSim * 0.4);
    const locationScore = calculateStringSimilarity(item.location?.name, candidate.location?.name);
    const dateScore = calculateDateProximity(item.dateLostOrFound, candidate.dateLostOrFound);

    const score = Math.round(catScore * 0.3 + keywordScore * 0.3 + locationScore * 0.2 + dateScore * 0.2);

    if (score >= 40) {
      matches.push({ candidate, score, matchedFields: ['category'] });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  // Save top matches & notify
  for (const m of matches.slice(0, 5)) {
    const matchData = {
      _id: genId(),
      lostItem: item.type === 'lost' ? item._id : m.candidate._id,
      foundItem: item.type === 'found' ? item._id : m.candidate._id,
      score: m.score,
      matchedFields: m.matchedFields,
      status: 'pending',
      createdAt: now(),
    };

    // Don't duplicate
    const exists = store.matches.find(
      x => x.lostItem === matchData.lostItem && x.foundItem === matchData.foundItem
    );
    if (!exists) {
      store.matches.push(matchData);

      store.notifications.push({
        _id: genId(), user: item.reportedBy, type: 'match',
        title: 'Potential Match Found! 🎯',
        message: `We found a potential match for your ${item.type} item "${item.title}" with ${m.score}% confidence.`,
        relatedItem: m.candidate._id, isRead: false, actionUrl: `/items/${m.candidate._id}`, createdAt: now(),
      });
      store.notifications.push({
        _id: genId(), user: m.candidate.reportedBy, type: 'match',
        title: 'Potential Match Found! 🎯',
        message: `Someone reported a ${item.type} item that might match your "${m.candidate.title}" with ${m.score}% confidence.`,
        relatedItem: item._id, isRead: false, actionUrl: `/items/${item._id}`, createdAt: now(),
      });
    }
  }

  saveStore();
  return matches;
}

// ════════════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════════════
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    if (store.users.find((u) => u.email === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = {
      _id: genId(),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashPwd(password),
      avatar: '',
      role: 'user',
      isVerified: true,
      reputation: { score: 0, level: 'new', itemsReported: 0, itemsFound: 0, successfulReturns: 0 },
      createdAt: now(),
      updatedAt: now(),
    };
    store.users.push(user);

    // Welcome notification
    store.notifications.push({
      _id: genId(),
      user: user._id,
      type: 'system',
      title: 'Welcome to FindIt! 🎉',
      message: 'Start by reporting a lost item or browse found items on campus.',
      isRead: false,
      actionUrl: '/browse',
      createdAt: now(),
    });

    saveStore();

    const accessToken = signAccess(user._id);
    const refreshToken = signRefresh(user._id);

    res.status(201).json({ user: safeUser(user), accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = store.users.find((u) => u.email === email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  if (!checkPwd(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });

  const accessToken = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  res.json({ user: safeUser(user), accessToken, refreshToken });
});

router.get('/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });
  res.json({ user: safeUser(user) });
});

router.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.post('/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'findit_dev_refresh_secret_2024_local');
    const user = store.users.find((u) => u._id === decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

    res.json({
      accessToken: signAccess(user._id),
      refreshToken: signRefresh(user._id),
    });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ── Real Password Change ──────────────────────────────────
router.put('/auth/change-password', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password are required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

  if (!checkPwd(currentPassword, user.password)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  user.password = hashPwd(newPassword);
  user.updatedAt = now();
  saveStore();

  res.json({ message: 'Password updated successfully' });
});

// ── Real Forgot Password ─────────────────────────────────
router.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = store.users.find(u => u.email === email.toLowerCase());
  if (!user) {
    // Don't reveal if email exists
    return res.json({ message: 'If the email is registered, a temporary password has been generated.' });
  }

  // Generate a real temporary password
  const tempPassword = crypto.randomBytes(4).toString('hex');
  user.password = hashPwd(tempPassword);
  user.updatedAt = now();
  saveStore();

  // In a real app this would be emailed. Since no SMTP, we return it.
  res.json({
    message: 'A temporary password has been generated.',
    tempPassword,
    note: 'Please login with this temporary password and change it in Settings.',
  });
});

router.post('/auth/verify-email', (req, res) => {
  res.json({ message: 'Email verified successfully' });
});

// ════════════════════════════════════════════════════════════
// ITEMS ROUTES
// ════════════════════════════════════════════════════════════
router.post('/items', upload.array('images', 5), (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const { title, description, type, category, dateLostOrFound, verificationClues, handoverStatus } = req.body;
  let location = req.body.location;
  let contactInfo = req.body.contactInfo;

  // Handle multipart form data where these come as JSON strings
  if (typeof location === 'string') try { location = JSON.parse(location); } catch { location = { name: location }; }
  if (typeof contactInfo === 'string') try { contactInfo = JSON.parse(contactInfo); } catch { contactInfo = {}; }

  if (!title || !description || !type || !category) {
    return res.status(400).json({ error: 'Title, description, type, and category are required' });
  }

  const images = (req.files || []).map((f) => ({ url: `/uploads/${f.filename}`, publicId: f.filename }));

  const item = {
    _id: genId(),
    title,
    description,
    type,
    category,
    location: location || { name: '' },
    dateLostOrFound: dateLostOrFound || now(),
    images,
    contactInfo: contactInfo || { preferredMethod: 'in_app' },
    verificationClues: verificationClues || '',
    status: 'active',
    handoverStatus: type === 'found' ? (handoverStatus || 'with_finder') : undefined,
    reportedBy: user._id,
    views: 0,
    createdAt: now(),
    updatedAt: now(),
  };

  store.items.push(item);

  // Update reputation
  user.reputation.itemsReported = (user.reputation.itemsReported || 0) + 1;
  if (type === 'found') {
    user.reputation.itemsFound = (user.reputation.itemsFound || 0) + 1;
    user.reputation.score += 10;
  } else {
    user.reputation.score += 5;
  }
  updateLevel(user);

  // Run smart matching
  const matches = findMatchesForItem(item);

  saveStore();

  res.status(201).json({ item: { ...item, reportedBy: populateUser(user._id) }, matchCount: matches.length });
});

router.get('/items', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  let filtered = [...store.items];

  // Filters
  if (req.query.type) filtered = filtered.filter((i) => i.type === req.query.type);
  if (req.query.category) filtered = filtered.filter((i) => i.category === req.query.category);
  if (req.query.status) filtered = filtered.filter((i) => i.status === req.query.status);
  if (req.query.location) filtered = filtered.filter((i) => i.location?.name?.toLowerCase().includes(req.query.location.toLowerCase()));
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(s) ||
        i.description.toLowerCase().includes(s) ||
        (i.location?.name || '').toLowerCase().includes(s) ||
        i.category.toLowerCase().includes(s)
    );
  }

  // Sort
  const sort = req.query.sort || '-createdAt';
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  filtered.sort((a, b) => {
    const va = a[field] || '';
    const vb = b[field] || '';
    return desc ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
  });

  const total = filtered.length;
  const items = filtered.slice(skip, skip + limit).map((i) => ({
    ...i,
    reportedBy: populateUser(i.reportedBy),
  }));

  res.json({
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
    hasMore: page < Math.ceil(total / limit),
  });
});

router.get('/items/user/my-items', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const items = store.items
    .filter((i) => i.reportedBy === user._id)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .map((i) => ({ ...i, reportedBy: populateUser(i.reportedBy) }));

  res.json({ items });
});

router.get('/items/:id/matches', (req, res) => {
  const matches = store.matches
    .filter((m) => m.lostItem === req.params.id || m.foundItem === req.params.id)
    .map((m) => ({
      ...m,
      lostItem: populateItem(m.lostItem),
      foundItem: populateItem(m.foundItem),
    }));

  res.json({ matches });
});

router.get('/items/:id', (req, res) => {
  const item = store.items.find((i) => i._id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.views = (item.views || 0) + 1;
  // Don't save on every view to avoid excessive writes - save periodically
  if (item.views % 5 === 0) saveStore();

  res.json({
    item: {
      ...item,
      reportedBy: populateUser(item.reportedBy),
    },
  });
});

router.put('/items/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const item = store.items.find((i) => i._id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  if (item.reportedBy !== user._id && user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });

  const allowed = ['title', 'description', 'category', 'location', 'status', 'contactInfo', 'handoverStatus'];
  allowed.forEach((f) => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
  item.updatedAt = now();

  saveStore();

  res.json({ item: { ...item, reportedBy: populateUser(item.reportedBy) } });
});

router.delete('/items/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const idx = store.items.findIndex((i) => i._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Item not found' });
  if (store.items[idx].reportedBy !== user._id && user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });

  store.items.splice(idx, 1);
  saveStore();
  res.json({ message: 'Item deleted successfully' });
});

// ════════════════════════════════════════════════════════════
// CLAIMS ROUTES
// ════════════════════════════════════════════════════════════
router.post('/claims', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const { itemId, verificationAnswers } = req.body;
  const item = store.items.find((i) => i._id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  if (item.reportedBy === user._id) return res.status(400).json({ error: 'Cannot claim your own item' });

  const existing = store.claims.find((c) => c.item === itemId && c.claimant === user._id);
  if (existing) return res.status(400).json({ error: 'You already submitted a claim for this item' });

  const claim = {
    _id: genId(),
    item: itemId,
    claimant: user._id,
    verificationAnswers,
    status: 'pending',
    messages: [],
    createdAt: now(),
    updatedAt: now(),
  };
  store.claims.push(claim);

  item.status = 'claimed';

  // Notify owner
  store.notifications.push({
    _id: genId(),
    user: item.reportedBy,
    type: 'claim',
    title: 'New Claim Received',
    message: `${user.name} has submitted a claim for your item "${item.title}". Review their verification answers.`,
    relatedItem: item._id,
    isRead: false,
    actionUrl: `/items/${item._id}`,
    createdAt: now(),
  });

  saveStore();

  res.status(201).json({ claim: { ...claim, claimant: populateUser(user._id) } });
});

router.get('/claims/my', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const claims = store.claims
    .filter((c) => c.claimant === user._id)
    .map((c) => ({ ...c, item: populateItem(c.item), claimant: populateUser(c.claimant) }));

  res.json({ claims });
});

router.get('/claims/item/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const claims = store.claims
    .filter((c) => c.item === req.params.id)
    .map((c) => ({ ...c, item: populateItem(c.item), claimant: populateUser(c.claimant) }));

  res.json({ claims });
});

router.put('/claims/:id/approve', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const claim = store.claims.find((c) => c._id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  claim.status = 'approved';
  claim.reviewedBy = user._id;
  claim.updatedAt = now();

  const item = store.items.find((i) => i._id === claim.item);
  if (item) {
    item.status = 'closed';
    item.claimedBy = claim.claimant;
    item.handoverStatus = 'returned';
  }

  // Reject other claims
  store.claims.filter((c) => c.item === claim.item && c._id !== claim._id && c.status === 'pending')
    .forEach((c) => { c.status = 'rejected'; });

  // Update reputation
  const claimant = store.users.find(u => u._id === claim.claimant);
  if (claimant) {
    claimant.reputation.score += 10;
    updateLevel(claimant);
  }
  if (item && item.type === 'found') {
    const reporter = store.users.find(u => u._id === item.reportedBy);
    if (reporter) {
      reporter.reputation.successfulReturns = (reporter.reputation.successfulReturns || 0) + 1;
      reporter.reputation.score += 15;
      updateLevel(reporter);
    }
  }

  // Notify
  store.notifications.push({
    _id: genId(),
    user: claim.claimant,
    type: 'claim_approved',
    title: 'Claim Approved! 🎉',
    message: `Your claim for "${item?.title}" has been approved!`,
    relatedItem: claim.item,
    isRead: false,
    actionUrl: `/items/${claim.item}`,
    createdAt: now(),
  });

  saveStore();

  res.json({ claim: { ...claim, claimant: populateUser(claim.claimant) }, item });
});

router.put('/claims/:id/reject', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const claim = store.claims.find((c) => c._id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  claim.status = 'rejected';
  claim.reviewedBy = user._id;
  claim.updatedAt = now();

  // If no more pending claims, set item back to active
  const pendingCount = store.claims.filter((c) => c.item === claim.item && c.status === 'pending').length;
  if (pendingCount === 0) {
    const item = store.items.find((i) => i._id === claim.item);
    if (item) item.status = 'active';
  }

  store.notifications.push({
    _id: genId(),
    user: claim.claimant,
    type: 'claim_rejected',
    title: 'Claim Rejected',
    message: `Your claim was not approved. ${req.body.note || ''}`,
    relatedItem: claim.item,
    isRead: false,
    actionUrl: `/items/${claim.item}`,
    createdAt: now(),
  });

  saveStore();

  res.json({ claim });
});

router.post('/claims/:id/messages', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const claim = store.claims.find((c) => c._id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });

  const message = {
    _id: genId(),
    sender: user._id,
    content: req.body.content,
    createdAt: now(),
  };
  claim.messages.push(message);
  saveStore();

  res.json({ message });
});

// ════════════════════════════════════════════════════════════
// NOTIFICATIONS ROUTES
// ════════════════════════════════════════════════════════════
router.get('/notifications', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const limit = parseInt(req.query.limit) || 20;
  const notifs = store.notifications
    .filter((n) => n.user === user._id)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, limit);

  const unreadCount = store.notifications.filter((n) => n.user === user._id && !n.isRead).length;

  res.json({ notifications: notifs, unreadCount });
});

router.put('/notifications/:id/read', (req, res) => {
  const notif = store.notifications.find((n) => n._id === req.params.id);
  if (notif) {
    notif.isRead = true;
    saveStore();
  }
  res.json({ message: 'Marked as read' });
});

router.put('/notifications/read-all', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.json({ message: 'Done' });

  store.notifications.filter((n) => n.user === user._id).forEach((n) => { n.isRead = true; });
  saveStore();
  res.json({ message: 'All notifications marked as read' });
});

// ════════════════════════════════════════════════════════════
// USERS ROUTES
// ════════════════════════════════════════════════════════════
router.get('/users/profile', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });
  res.json({ user: safeUser(user) });
});

router.put('/users/profile', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  if (req.body.name) user.name = req.body.name;
  if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
  user.updatedAt = now();

  saveStore();

  res.json({ user: safeUser(user) });
});

router.get('/users/:id/reputation', (req, res) => {
  const user = store.users.find((u) => u._id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ reputation: user.reputation });
});

// ── Notification Preferences ──────────────────────────────
router.get('/users/notification-preferences', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const prefs = store.notificationPreferences.find(p => p.userId === user._id);
  res.json({
    preferences: prefs?.preferences || {
      emailNotifications: true,
      matchAlerts: true,
      claimUpdates: true,
      systemAnnouncements: true,
    },
  });
});

router.put('/users/notification-preferences', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const idx = store.notificationPreferences.findIndex(p => p.userId === user._id);
  if (idx >= 0) {
    store.notificationPreferences[idx].preferences = req.body;
  } else {
    store.notificationPreferences.push({ userId: user._id, preferences: req.body });
  }

  saveStore();
  res.json({ message: 'Notification preferences saved', preferences: req.body });
});

// ── Delete Account ────────────────────────────────────────
router.delete('/users/account', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  // Remove user's items
  store.items = store.items.filter(i => i.reportedBy !== user._id);
  // Remove user's claims
  store.claims = store.claims.filter(c => c.claimant !== user._id);
  // Remove user's notifications
  store.notifications = store.notifications.filter(n => n.user !== user._id);
  // Remove notification preferences
  store.notificationPreferences = store.notificationPreferences.filter(p => p.userId !== user._id);
  // Remove user
  store.users = store.users.filter(u => u._id !== user._id);

  saveStore();
  res.json({ message: 'Account deleted successfully' });
});

// ════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════════════════════
router.get('/admin/stats', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  res.json({
    stats: {
      totalUsers: store.users.length,
      totalItems: store.items.length,
      lostItems: store.items.filter((i) => i.type === 'lost').length,
      foundItems: store.items.filter((i) => i.type === 'found').length,
      recoveryRate: Math.round((store.items.filter((i) => i.status === 'closed').length / Math.max(store.items.length, 1)) * 100),
      pendingClaims: store.claims.filter((c) => c.status === 'pending').length,
      closedItems: store.items.filter((i) => i.status === 'closed').length,
      recentItems: store.items.filter((i) => i.createdAt >= oneWeekAgo).length,
    },
  });
});

router.get('/admin/items', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const limit = parseInt(req.query.limit) || 20;
  const items = store.items
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, limit)
    .map((i) => ({ ...i, reportedBy: populateUser(i.reportedBy) }));

  res.json({ items });
});

router.delete('/admin/items/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const idx = store.items.findIndex((i) => i._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Item not found' });
  store.items.splice(idx, 1);
  saveStore();
  res.json({ message: 'Item removed' });
});

router.get('/admin/users', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const limit = parseInt(req.query.limit) || 20;
  const users = store.users.slice(0, limit).map(safeUser);
  res.json({ users });
});

router.put('/admin/users/:id/role', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const target = store.users.find((u) => u._id === req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  target.role = req.body.role;
  saveStore();
  res.json({ user: safeUser(target) });
});

// ════════════════════════════════════════════════════════════
// MATCHES ROUTES
// ════════════════════════════════════════════════════════════
router.get('/matches/my', (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authorized' });

  const userItemIds = store.items.filter((i) => i.reportedBy === user._id).map((i) => i._id);
  const matches = store.matches
    .filter((m) => userItemIds.includes(m.lostItem) || userItemIds.includes(m.foundItem))
    .map((m) => ({
      ...m,
      lostItem: populateItem(m.lostItem),
      foundItem: populateItem(m.foundItem),
    }));

  res.json({ matches });
});

router.put('/matches/:id/status', (req, res) => {
  const match = store.matches.find((m) => m._id === req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  match.status = req.body.status;
  saveStore();
  res.json({ match });
});

// ── Leaderboard (public) ──────────────────────────────────
router.get('/users/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const leaderboard = store.users
    .map(u => ({
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      reputation: u.reputation,
      itemsReported: store.items.filter(i => i.reportedBy === u._id).length,
      itemsFound: store.items.filter(i => i.reportedBy === u._id && i.type === 'found').length,
      successfulReturns: u.reputation?.successfulReturns || 0,
      createdAt: u.createdAt,
    }))
    .sort((a, b) => (b.reputation?.score || 0) - (a.reputation?.score || 0))
    .slice(0, limit);

  res.json({ leaderboard });
});

// ── Admin Export ──────────────────────────────────────────
router.get('/admin/export', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const oneMonthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const exportData = {
    generatedAt: now(),
    summary: {
      totalUsers: store.users.length,
      totalItems: store.items.length,
      lostItems: store.items.filter(i => i.type === 'lost').length,
      foundItems: store.items.filter(i => i.type === 'found').length,
      activeItems: store.items.filter(i => i.status === 'active').length,
      closedItems: store.items.filter(i => i.status === 'closed').length,
      totalClaims: store.claims.length,
      pendingClaims: store.claims.filter(c => c.status === 'pending').length,
      approvedClaims: store.claims.filter(c => c.status === 'approved').length,
      recoveryRate: Math.round((store.items.filter(i => i.status === 'closed').length / Math.max(store.items.length, 1)) * 100),
      itemsThisWeek: store.items.filter(i => i.createdAt >= oneWeekAgo).length,
      itemsThisMonth: store.items.filter(i => i.createdAt >= oneMonthAgo).length,
    },
    items: store.items.map(i => ({
      id: i._id,
      title: i.title,
      type: i.type,
      category: i.category,
      status: i.status,
      location: i.location?.name || '',
      dateLostOrFound: i.dateLostOrFound,
      reportedBy: populateUser(i.reportedBy)?.name || 'Unknown',
      views: i.views,
      createdAt: i.createdAt,
    })),
    users: store.users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      reputationScore: u.reputation?.score || 0,
      reputationLevel: u.reputation?.level || 'new',
      createdAt: u.createdAt,
    })),
  };

  res.json(exportData);
});

// ── Health ────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'persistent',
    dataFile: DATA_FILE,
    stats: {
      users: store.users.length,
      items: store.items.length,
      claims: store.claims.length,
    },
    timestamp: now(),
  });
});

export default router;
