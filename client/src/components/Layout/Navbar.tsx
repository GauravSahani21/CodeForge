'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '/problems', label: 'Problems' },
  { href: '/ide', label: 'IDE' },
  { href: '/learn', label: 'Learn' },
  { href: '/leaderboard', label: 'Rankings' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loadFromStorage } = useAuthStore();

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3L4 7l4 4M16 3l4 4-4 4M12 21l-2-9 2-1 2 1-2 9z" stroke="url(#logoGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="logoGrad" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#39d353"/><stop offset="1" stopColor="#58a6ff"/>
              </linearGradient>
            </defs>
          </svg>
          CodeForge
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={`navbar-link${pathname.startsWith(href) ? ' active' : ''}`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-orange)' }}>⚙️ Admin</Link>
              )}
              <Link href={`/profile/${user.username}`} className={styles.avatarBtn}>
                <div className={styles.avatar}>
                  {user.avatar ? <img src={user.avatar} alt={user.username} /> : user.username[0].toUpperCase()}
                </div>
                <span className={styles.username}>{user.username}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
