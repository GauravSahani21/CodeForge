'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import styles from '../login/auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('If an account exists, an OTP has been sent! 📧');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully! 🎉');
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⚡</div>
          <div className={styles.logoText}>CodeForge</div>
        </div>
        <h1 className={styles.title}>
          {step === 'email' ? 'Forgot Password' : 'Reset Password'}
        </h1>
        <p className={styles.sub}>
          {step === 'email' 
            ? 'Enter your email to receive a password reset OTP' 
            : 'Enter the 6-digit OTP sent to your email and your new password'
          }
        </p>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.field}>
              <label className="label" htmlFor="forgot-email">Email Address</label>
              <input 
                id="forgot-email" 
                type="email" 
                className="input" 
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoFocus 
              />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className={styles.field}>
              <label className="label" htmlFor="reset-otp">6-Digit OTP</label>
              <input 
                id="reset-otp" 
                type="text" 
                className="input" 
                placeholder="123456"
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                maxLength={6}
                required 
                autoFocus 
              />
            </div>
            <div className={styles.field}>
              <label className="label" htmlFor="new-password">New Password</label>
              <input 
                id="new-password" 
                type="password" 
                className="input" 
                placeholder="••••••••"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.field}>
              <label className="label" htmlFor="confirm-password">Confirm New Password</label>
              <input 
                id="confirm-password" 
                type="password" 
                className="input" 
                placeholder="••••••••"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button 
              type="button" 
              className="btn btn-ghost" 
              style={{ marginTop: '8px' }}
              onClick={() => setStep('email')}
            >
              Back to Email
            </button>
          </form>
        )}

        <div className={styles.divider}><span>or</span></div>
        <p className={styles.switchAuth}>
          Remember your password? <Link href="/auth/login" className={styles.authLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
