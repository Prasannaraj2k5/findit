import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, generateAccessToken, generateRefreshToken } from '../middleware/auth.js';
import { validate, registerValidation, loginValidation } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { generateToken } from '../utils/helpers.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';

const router = express.Router();

// Register
router.post('/register', authLimiter, registerValidation, validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const verificationToken = generateToken();
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
    });

    // Send verification email (demo mode will log to console)
    await sendVerificationEmail(email, verificationToken);

    // Welcome notification
    await createNotification({
      user: user._id,
      type: 'system',
      title: 'Welcome to FindIt! 🎉',
      message: `Hey ${name}! Welcome to FindIt — your campus lost & found platform. Report lost items, browse found ones, and help reunite people with their belongings. Explore the Browse page to get started!`,
      actionUrl: '/browse',
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', authLimiter, loginValidation, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Verify email
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', protect, async (req, res) => {
  req.user.refreshToken = undefined;
  await req.user.save();
  res.json({ message: 'Logged out successfully' });
});

export default router;
