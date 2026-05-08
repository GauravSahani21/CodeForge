'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import styles from './auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      router.push('/problems');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Login failed');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⚡</div>
          <div className={styles.logoText}>CodeForge</div>
        </div>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.sub}>Continue your coding journey</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className="label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" className="input" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className={styles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="label" htmlFor="login-password">Password</label>
              <Link href="/auth/forgot-password" className={styles.authLink} style={{ fontSize: '0.8rem' }}>
                Forgot password?
              </Link>
            </div>
            <input id="login-password" type="password" className="input" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button id="login-submit" type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isLoading}>
            {isLoading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Signing in...</> : 'Sign in'}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>
        <p className={styles.switchAuth}>
          Don&apos;t have an account? <Link href="/auth/signup" className={styles.authLink}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
