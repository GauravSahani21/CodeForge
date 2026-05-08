'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import styles from './page.module.css';

const FALLBACK_SLUGS: Record<string, {title: string; description: string; difficulty: string; tags: string[]; lessons: {_id: string; title: string; order: number; duration: number}[]}> = {
  'python-beginners': { title: 'Python for Absolute Beginners', description: 'Start from zero and write your first programs in Python.', difficulty: 'Beginner', tags: ['Python', 'Basics'], lessons: [{ _id: 'l1', title: 'Hello, World!', order: 1, duration: 5 }, { _id: 'l2', title: 'Variables & Data Types', order: 2, duration: 8 }, { _id: 'l3', title: 'Loops — for and while', order: 3, duration: 10 }] },
  'dsa': { title: 'Data Structures & Algorithms', description: 'Master the core DSA concepts used in coding interviews.', difficulty: 'Intermediate', tags: ['DSA', 'Algorithms'], lessons: [{ _id: 'd1', title: 'Arrays and Lists', order: 1, duration: 12 }] },
};

export default function CourseOverviewPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [course, setCourse] = useState<typeof FALLBACK_SLUGS[string] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/learn/${slug}`).then(({ data }) => { setCourse(data); setLoading(false); })
      .catch(() => {
        const fb = FALLBACK_SLUGS[slug];
        if (fb) { setCourse(fb); setLoading(false); }
        else { router.push('/learn'); }
      });
  }, [slug, router]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}><div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>;
  if (!course) return null;

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);

  return (
    <div className={styles.page}>
      <div className="container">
        <Link href="/learn" className={styles.back}>← Back to Learning Hub</Link>

        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={`badge badge-${course.difficulty === 'Beginner' ? 'easy' : course.difficulty === 'Intermediate' ? 'medium' : 'hard'}`}>{course.difficulty}</span>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.desc}>{course.description}</p>
            <div className={styles.tags}>{course.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.statsBox}>
              <div className={styles.stat}><div className={styles.statVal}>{sortedLessons.length}</div><div className={styles.statKey}>Lessons</div></div>
              <div className={styles.stat}><div className={styles.statVal}>{sortedLessons.reduce((a, l) => a + l.duration, 0)}m</div><div className={styles.statKey}>Total Time</div></div>
              <div className={styles.stat}><div className={styles.statVal}>🚫</div><div className={styles.statKey}>No Copy-Paste</div></div>
            </div>
            <Link href={`/learn/${slug}/${sortedLessons[0]?._id}`} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              🚀 Start Learning
            </Link>
          </div>
        </div>

        <div className={styles.lessonListSection}>
          <h2 className={styles.sectionTitle}>Course Content</h2>
          <div className={styles.lessonCards}>
            {sortedLessons.map((l, i) => (
              <Link key={l._id} href={`/learn/${slug}/${l._id}`} className={styles.lessonCard}>
                <div className={styles.lessonNum}>{i + 1}</div>
                <div className={styles.lessonInfo}>
                  <div className={styles.lessonTitle}>{l.title}</div>
                  <div className={styles.lessonDuration}>⏱ {l.duration} min</div>
                </div>
                <div className={styles.lessonArrow}>→</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
