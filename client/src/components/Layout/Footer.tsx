import Link from 'next/link';
import styles from './Footer.module.css';

const LINKS = {
  Platform: [
    { href: '/problems', label: 'Problems' },
    { href: '/ide', label: 'Online IDE' },
    { href: '/learn', label: 'Learning Hub' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ],
  Learn: [
    { href: '/learn/python-beginners', label: 'Python Basics' },
    { href: '/learn/dsa', label: 'DSA' },
    { href: '/learn/cpp-crash-course', label: 'C++ Course' },
    { href: '/learn/competitive-programming', label: 'Competitive Programming' },
  ],
  Account: [
    { href: '/auth/signup', label: 'Create Account' },
    { href: '/auth/login', label: 'Sign In' },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3L4 7l4 4M16 3l4 4-4 4M12 21l-2-9 2-1 2 1-2 9z" stroke="url(#fg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="fg" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#39d353"/><stop offset="1" stopColor="#58a6ff"/>
                </linearGradient>
              </defs>
            </svg>
            <span>CodeForge</span>
          </div>
          <p className={styles.tagline}>Code. Learn. Conquer.<br/>The platform that makes you type every character.</p>
          <div className={styles.pill}>🚫 No copy-paste allowed</div>
        </div>

        <div className={styles.links}>
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section} className={styles.linkGroup}>
              <div className={styles.groupTitle}>{section}</div>
              {items.map(({ href, label }) => (
                <Link key={href} href={href} className={styles.link}>{label}</Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <span className={styles.copy}>© {new Date().getFullYear()} CodeForge. Built for coders who care.</span>
            <div className={styles.bottomLinks}>
              <span className={styles.powered}>Powered by <span style={{color:'var(--accent-green)'}}>Piston API</span> · <span style={{color:'var(--accent-blue)'}}>Monaco Editor</span></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
