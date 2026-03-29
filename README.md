# FindIt – University Lost & Found System

A full-stack, SaaS-quality platform for campus-wide lost & found management. Built with React, Express, MongoDB, and Socket.IO.

![FindIt](https://img.shields.io/badge/FindIt-University%20Lost%20%26%20Found-6366f1?style=for-the-badge)

## 🚀 Features

- **Smart Matching** – Intelligent algorithm matches lost & found items by keywords, category, location, and date
- **Secure Verification** – Hidden clue system prevents fraudulent claims
- **Trust & Reputation** – Earn points and badges for helping the community
- **Real-time Notifications** – Socket.IO powered instant alerts
- **Admin Dashboard** – Analytics, moderation, and user management
- **Dark Mode** – System-aware theme with smooth transitions
- **Responsive Design** – Works beautifully on mobile and desktop

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Lucide Icons |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (access + refresh tokens) |
| File Upload | Multer (local) / Cloudinary (production) |
| Real-time | Socket.IO |

## 📦 Quick Start

### Prerequisites
- Node.js v18+ 
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
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

## 📁 Project Structure

```
findit/
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
│   ├── middleware/           # Auth, validation, upload
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic
│   └── server.js            # Entry point
└── README.md
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/items | Create item report |
| GET | /api/items | Browse/search items |
| GET | /api/items/:id | Get item details |
| POST | /api/claims | Submit item claim |
| PUT | /api/claims/:id/approve | Approve claim |
| GET | /api/notifications | Get notifications |
| GET | /api/admin/stats | Admin analytics |

## 🎨 Design System

- **Lost Items**: Orange palette (#F97316)
- **Found Items**: Green palette (#10B981)
- **Browse**: Blue palette (#3B82F6)
- **Primary**: Indigo (#6366F1)
- **Typography**: Inter font family
- **Effects**: Glassmorphism, smooth animations, gradient accents

## 🔒 Security

- JWT access + refresh tokens with auto-rotation
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min general, 10/15min auth)
- Helmet security headers
- Input validation on all endpoints
- CORS whitelist configuration
- File type & size validation

## 📝 License

MIT License - feel free to use for your university!
