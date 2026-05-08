import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import User from '../models/User.model';
import { sendOtpEmail } from '../services/email.service';

const signToken = (id: string, role: string, username: string) =>
  jwt.sign({ id, role, username }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

const signupSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Generate a 6-digit numeric OTP
const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

// Hash OTP before storing (sha256, quick & stateless enough for short-lived OTPs)
const hashOtp = (otp: string): string => crypto.createHash('sha256').update(otp).digest('hex');

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = signupSchema.parse(req.body);

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(409).json({ error: existingUser.email === email ? 'Email already in use' : 'Username taken' });
      return;
    }

    const user = await User.create({ username, email, passwordHash: password });
    const token = signToken(user.id, user.role, user.username);

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, stats: user.stats },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    res.status(500).json({ error: 'Signup failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken(user.id, user.role, user.username);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, stats: user.stats },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getMe = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = forgotSchema.parse(req.body);

    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpiry +resetOtpAttempts');

    // Always respond with success to prevent email enumeration
    if (!user) {
      res.json({ message: 'If an account with that email exists, an OTP has been sent.' });
      return;
    }

    // Throttle: max 5 OTPs per 10 min window
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (user.resetOtpExpiry && user.resetOtpExpiry > tenMinutesAgo && (user.resetOtpAttempts ?? 0) >= 5) {
      res.status(429).json({ error: 'Too many OTP requests. Please wait 10 minutes before trying again.' });
      return;
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(user._id, {
      resetOtp: hashOtp(otp),
      resetOtpExpiry: expiry,
      $inc: { resetOtpAttempts: 1 },
    });

    await sendOtpEmail(email, otp, user.username);

    res.json({ message: 'If an account with that email exists, an OTP has been sent.' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('forgotPassword error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = resetSchema.parse(req.body);

    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpiry +resetOtpAttempts +passwordHash');
    if (!user) {
      res.status(400).json({ error: 'Invalid or expired OTP.' });
      return;
    }

    // Check expiry
    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      return;
    }

    // Compare hashed OTP
    if (!user.resetOtp || user.resetOtp !== hashOtp(otp)) {
      res.status(400).json({ error: 'Invalid OTP. Please check your email and try again.' });
      return;
    }

    // Update password and clear OTP fields
    user.passwordHash = newPassword; // pre-save hook will hash it
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    user.resetOtpAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error('resetPassword error:', err);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
};
