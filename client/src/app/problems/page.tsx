'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import styles from './page.module.css';

interface Problem {
  _id: string; title: string; slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[]; acceptanceRate: number; totalSubmissions: number;
}

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const POPULAR_TAGS = ['Array', 'String', 'Tree', 'Graph', 'DP', 'Math', 'Sorting', 'Binary Search', 'Stack', 'Greedy'];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [difficulty, setDifficulty] = useState('All');
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const DIFF_ORDER: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (difficulty !== 'All') params.append('difficulty', difficulty);
    if (tag) params.append('tag', tag);
    if (search) params.append('search', search);
    api.get(`/problems?${params}`).then(({ data }) => {
      const sorted = [...data.problems].sort(
        (a: Problem, b: Problem) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]
      );
      setProblems(sorted);
      setTotal(data.total);
      setPages(data.pages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, difficulty, tag, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Problems</h1>
            <p className={styles.subtitle}>{total} challenges — write complete programs, not just function stubs</p>
          </div>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              id="problem-search"
              className="input"
              placeholder="Search problems..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.diffFilters}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={`btn btn-sm ${difficulty === d ? (d === 'Easy' ? 'btn-primary' : d === 'Medium' ? styles.btnMedium : d === 'Hard' ? styles.btnHard : 'btn-secondary') : 'btn-ghost'}`}
                onClick={() => { setDifficulty(d); setPage(1); }}
              >
                {d}
              </button>
            ))}
          </div>
          <div className={styles.tagFilters}>
            {POPULAR_TAGS.map((t) => (
              <button key={t} className={`tag ${tag === t ? styles.tagActive : ''}`} onClick={() => { setTag(tag === t ? '' : t); setPage(1); }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loadingRow}>
              {[...Array(8)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : problems.length === 0 ? (
            <div className={styles.empty}>No problems found. Try adjusting your filters.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                  <th>Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p, i) => (
                  <tr key={p._id} className={`${styles.row} ${styles['row' + p.difficulty]}`}>
                    <td className={styles.num}>{(page - 1) * 20 + i + 1}</td>
                    <td>
                      <Link href={`/problems/${p.slug}`} className={styles.problemLink}>{p.title}</Link>
                    </td>
                    <td>
                      <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                    </td>
                    <td>
                      <div className={styles.tags}>
                        {p.tags.slice(0, 2).map((t) => <span key={t} className="tag">{t}</span>)}
                      </div>
                    </td>
                    <td className={styles.acceptance}>
                      {p.totalSubmissions > 0 ? `${((p.acceptanceRate || 0) * 100).toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className={styles.pagination}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
            <span className={styles.pageInfo}>Page {page} of {pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
