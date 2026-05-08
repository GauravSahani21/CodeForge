'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import styles from './page.module.css';

const ActivityCalendar = dynamic(
  () => import('react-activity-calendar').then((mod) => ({ default: mod.ActivityCalendar })),
  { ssr: false }
);

interface User {
  username: string; email: string; avatar?: string; bio?: string; joinedAt: string;
  role: string;
  stats: { solved: number; attempted: number; streak: number; lastActive?: string };
  solvedProblems: Array<{ _id: string; title: string; slug: string; difficulty: string }>;
  badges: string[];
}

interface Activity { date: string; count: number; level: number; }

const BADGE_LABELS: Record<string, string> = {
  'first-solve': '🎯 First Blood',
  'streak-7': '🔥 7-Day Streak',
  'streak-30': '⚡ 30-Day Streak',
  'solved-50': '💯 50 Problems',
  'solved-100': '🏆 Century Club',
};

export default function ProfilePage() {
  const { username } = useParams() as { username: string };
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${username}`).then(r => r.data),
      api.get(`/users/${username}/activity`).then(r => r.data),
    ]).then(([userData, actData]) => {
      setUser(userData);
      // Ensure there's at least one entry for react-activity-calendar
      const today = new Date().toISOString().split('T')[0];
      const hasToday = actData.some((a: Activity) => a.date === today);
      if (!hasToday) actData.push({ date: today, count: 0, level: 0 });
      // Need a date from a year ago
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      const yearAgoStr = yearAgo.toISOString().split('T')[0];
      const hasStart = actData.some((a: Activity) => a.date === yearAgoStr);
      if (!hasStart) actData.unshift({ date: yearAgoStr, count: 0, level: 0 });
      setActivity(actData.sort((a: Activity, b: Activity) => a.date.localeCompare(b.date)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  );
  if (!user) return <div className={styles.notFound}>User not found</div>;

  const acceptanceRate = user.stats.attempted > 0
    ? ((user.stats.solved / user.stats.attempted) * 100).toFixed(1)
    : '0';

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          {/* Left sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                {user.avatar ? <img src={user.avatar} alt={user.username} /> : user.username[0].toUpperCase()}
              </div>
              <h1 className={styles.username}>{user.username}</h1>
              {user.bio && <p className={styles.bio}>{user.bio}</p>}
              <div className={styles.joined}>Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
              {user.role === 'admin' && <span className="badge badge-purple">Admin</span>}
            </div>

            {/* Stats */}
            <div className={styles.statsCard}>
              <div className={styles.stat}>
                <div className={styles.statVal} style={{ color: 'var(--accent-green)' }}>{user.stats.solved}</div>
                <div className={styles.statKey}>Solved</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statVal} style={{ color: 'var(--accent-orange)' }}>{user.stats.streak}</div>
                <div className={styles.statKey}>Day Streak 🔥</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statVal} style={{ color: 'var(--accent-blue)' }}>{acceptanceRate}%</div>
                <div className={styles.statKey}>Acceptance</div>
              </div>
            </div>

            {/* Badges */}
            {user.badges.length > 0 && (
              <div className={styles.badgesCard}>
                <h3 className={styles.sectionTitle}>Badges</h3>
                <div className={styles.badgeList}>
                  {user.badges.map((b) => (
                    <div key={b} className={styles.badgeItem}>{BADGE_LABELS[b] || b}</div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className={styles.main}>
            {/* Activity Heatmap */}
            <div className={styles.heatmapCard}>
              <h2 className={styles.cardTitle}>
                {user.stats.streak > 0 ? `🔥 ${user.stats.streak} day streak` : 'Activity Graph'}
              </h2>
              {activity.length > 1 && (
                <div className={styles.heatmap}>
                  <ActivityCalendar
                    data={activity}
                    colorScheme="dark"
                    theme={{
                      dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                    }}
                    labels={{
                      legend: { less: 'Less', more: 'More' },
                      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                      totalCount: '{{count}} submissions in the last year',
                    }}
                    showWeekdayLabels
                  />
                </div>
              )}
              {activity.length <= 1 && (
                <div className={styles.noActivity}>No activity yet — start solving! 🚀</div>
              )}
            </div>

            {/* Solved Problems */}
            <div className={styles.solvedCard}>
              <h2 className={styles.cardTitle}>Solved Problems ({user.solvedProblems.length})</h2>
              {user.solvedProblems.length === 0 ? (
                <div className={styles.noSolved}>
                  No problems solved yet. <Link href="/problems" className={styles.link}>Start now →</Link>
                </div>
              ) : (
                <div className={styles.problemsList}>
                  {user.solvedProblems.map((p) => (
                    <Link key={p._id} href={`/problems/${p.slug}`} className={styles.problemRow}>
                      <span className={styles.checkmark}>✅</span>
                      <span className={styles.problemTitle}>{p.title}</span>
                      <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
