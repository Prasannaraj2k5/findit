# 🔍 FindIt – University Lost & Found System

A full-stack, production-ready platform for campus-wide lost & found management. Built with React, Express, MongoDB, and Socket.IO.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-findit--university.vercel.app-6366f1?style=for-the-badge)](https://findit-university.vercel.app)
![Tech](https://img.shields.io/badge/React_19-Vite-61DAFB?style=flat-square&logo=react)
![Tech](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)
![Tech](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Deploy](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel)

---

## ✨ Highlights

| Feature | Description |
|---------|-------------|
| 🧠 **Smart Matching** | Intelligent algorithm matches lost & found items by keywords, category, location, and date |
| 🔐 **Secure Verification** | Hidden clue system prevents fraudulent claims |
| 🏆 **Trust & Reputation** | Earn points, badges, and climb the leaderboard |
| 🔔 **Real-time Notifications** | Instant alerts for matches, claims, and updates |
| 📊 **Admin Dashboard** | Analytics, moderation, and user management |
| 🌙 **Dark Mode** | System-aware theme with smooth transitions |
| 📱 **Responsive Design** | Works beautifully on mobile, tablet, and desktop |
| ☁️ **Cloud Image Uploads** | Cloudinary integration for persistent image storage |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v7 |
| **Backend** | Node.js, Express, Socket.IO |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Auth** | JWT (access + refresh tokens with auto-rotation) |
| **File Upload** | Cloudinary (production) / Multer (development) |
| **Deployment** | Vercel (serverless functions + static hosting) |
| **Real-time** | Socket.IO |

---

## 📦 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone & Install

```bash
git clone https://github.com/Prasannaraj2k5/findit.git
cd findit

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example server/.env

# Edit server/.env with your settings:
# - MONGODB_URI (required)
# - JWT_SECRET (change for production)
# - CLOUDINARY_* (optional, for image uploads)
# - SMTP_* (optional, for email notifications)
```

### 3. Run Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 📁 Project Structure

```
findit/
├── api/                     # Vercel serverless function
│   └── index.js             # Express adapter for serverless
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # Auth & Theme contexts
│   │   ├── pages/           # Route-level pages
│   │   ├── services/        # API client
│   │   └── utils/           # Constants & helpers
│   └── ...
├── server/                  # Express backend
│   ├── config/              # DB & service configs
│   ├── middleware/           # Auth, validation, upload, demo mode
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic (matching, reputation, notifications)
│   └── app.js               # Express app module
├── vercel.json              # Vercel deployment config
└── README.md
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/items` | Create item report |
| `GET` | `/api/items` | Browse/search items |
| `GET` | `/api/items/:id` | Get item details |
| `GET` | `/api/items/:id/matches` | Get matches for item |
| `POST` | `/api/claims` | Submit item claim |
| `PUT` | `/api/claims/:id/approve` | Approve claim |
| `PUT` | `/api/claims/:id/reject` | Reject claim |
| `GET` | `/api/users/leaderboard` | Get leaderboard rankings |
| `GET` | `/api/notifications` | Get notifications |
| `GET` | `/api/admin/stats` | Admin analytics dashboard |
| `GET` | `/api/health` | Health check |

---

## 🎨 Design System

| Element | Style |
|---------|-------|
| **Lost Items** | Orange palette (`#F97316`) |
| **Found Items** | Green palette (`#10B981`) |
| **Browse** | Blue palette (`#3B82F6`) |
| **Primary** | Indigo (`#6366F1`) |
| **Typography** | Inter font family |
| **Effects** | Glassmorphism, smooth animations, gradient accents |

---

## 🔒 Security

- JWT access + refresh tokens with auto-rotation
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min general, 10/15min auth)
- Helmet security headers
- Input validation on all endpoints
- CORS whitelist configuration
- File type & size validation

---

## 🚀 Deployment

This project is deployed on **Vercel** with:
- **Frontend**: Static site from `client/dist`
- **Backend**: Serverless function at `api/index.js`
- **Database**: MongoDB Atlas
- **Images**: Cloudinary

### Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NODE_ENV` | `production` |

---

## 👨‍💻 Author

**Prasanna Raj**
- GitHub: [@Prasannaraj2k5](https://github.com/Prasannaraj2k5)
- Email: prasannaraj2k5@gmail.com
- University: Kalasalingam University, Tamil Nadu

---

## 📝 License

MIT License – feel free to use for your university!
