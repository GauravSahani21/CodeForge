'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import styles from './page.module.css';

interface Course {
  _id: string; title: string; slug: string; description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[]; thumbnail?: string; enrolledCount: number;
  lessons: Array<{ _id: string }>;
}

const DIFF_COLORS = { Beginner: 'easy', Intermediate: 'medium', Advanced: 'hard' };

const FALLBACK_COURSES: Course[] = [
  { _id: '1', title: 'Python for Absolute Beginners', slug: 'python-beginners', description: 'Learn Python from scratch — variables, loops, functions, and your first programs.', difficulty: 'Beginner', tags: ['Python', 'Basics'], enrolledCount: 1240, lessons: Array(12).fill({}) },
  { _id: '2', title: 'Data Structures & Algorithms', slug: 'dsa', description: 'Master arrays, linked lists, trees, graphs, sorting, and dynamic programming.', difficulty: 'Intermediate', tags: ['DSA', 'Algorithms'], enrolledCount: 890, lessons: Array(20).fill({}) },
  { _id: '3', title: 'Competitive Programming Essentials', slug: 'competitive-programming', description: 'Win contests. Learn advanced techniques like segment trees, modular arithmetic, and more.', difficulty: 'Advanced', tags: ['CP', 'Math'], enrolledCount: 432, lessons: Array(15).fill({}) },
  { _id: '4', title: 'C++ Crash Course', slug: 'cpp-crash-course', description: 'From Hello World to templates and STL. The fastest path to C++ fluency.', difficulty: 'Beginner', tags: ['C++', 'Basics'], enrolledCount: 760, lessons: Array(10).fill({}) },
  { _id: '5', title: 'JavaScript for Problem Solving', slug: 'js-problem-solving', description: 'Use JavaScript to crack coding problems. Closures, async, and algorithmic thinking.', difficulty: 'Intermediate', tags: ['JS', 'Algorithms'], enrolledCount: 615, lessons: Array(14).fill({}) },
  { _id: '6', title: 'Java Full Course', slug: 'java-full-course', description: 'OOP, collections, generics, and competitive coding patterns in pure Java.', difficulty: 'Intermediate', tags: ['Java', 'OOP'], enrolledCount: 520, lessons: Array(18).fill({}) },
];

export default function LearnPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/learn').then(({ data }) => {
      setCourses(data.length > 0 ? data : FALLBACK_COURSES);
      setLoading(false);
    }).catch(() => { setCourses(FALLBACK_COURSES); setLoading(false); });
  }, []);

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const filtered = filter === 'All' ? courses : courses.filter(c => c.difficulty === filter);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Learning Hub</h1>
            <p className={styles.subtitle}>Structured courses from absolute zero to competitive level</p>
          </div>
          <div className={styles.noPaste}>🚫 Typing enforced in all editors</div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {difficulties.map((d) => (
            <button
              key={d}
              className={`btn btn-sm ${filter === d ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(d)}
            >{d}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.skeletonGrid}>
            {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((course) => (
              <Link key={course._id} href={`/learn/${course.slug}`} className={styles.courseCard}>
                <div className={styles.cardTop}>
                  <span className={`badge badge-${DIFF_COLORS[course.difficulty]}`}>{course.difficulty}</span>
                  <span className={styles.lessonCount}>{course.lessons.length} lessons</span>
                </div>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.courseDesc}>{course.description}</p>
                <div className={styles.cardBottom}>
                  <div className={styles.tags}>
                    {course.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <span className={styles.enrolled}>👥 {course.enrolledCount.toLocaleString()}</span>
                </div>
                <div className={styles.startBtn}>Start Learning →</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
