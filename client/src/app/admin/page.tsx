'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './page.module.css';

type AdminTab = 'problems' | 'add-problem' | 'courses' | 'add-course';

interface Problem {
  _id: string; title: string; slug: string; difficulty: string; isPublished: boolean;
  totalSubmissions: number; totalAccepted: number;
}

const BLANK_PROBLEM = {
  title: '', slug: '', difficulty: 'Easy', tags: '',
  description: '', constraints: '',
  examples: [{ input: '', output: '', explanation: '' }],
  testCases: [{ input: '', expectedOutput: '', isHidden: false }],
  hints: '',
};

export default function AdminPage() {
  const { user, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('problems');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(BLANK_PROBLEM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (user === null) return; // still loading
    if (user && user.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (tab === 'problems') fetchProblems();
  }, [tab]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/problems?limit=50');
      setProblems(data.problems);
    } catch { toast.error('Failed to load problems'); }
    finally { setLoading(false); }
  };

  const handlePublish = async (id: string, currentState: boolean) => {
    try {
      await api.patch(`/problems/${id}/publish`);
      toast.success(currentState ? 'Problem unpublished' : 'Problem published!');
      fetchProblems();
    } catch { toast.error('Failed to update'); }
  };

  const updateForm = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.description) {
      toast.error('Fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        hints: form.hints.split('\n').map(h => h.trim()).filter(Boolean),
      };
      const { data } = await api.post('/problems', payload);
      // Auto-publish
      await api.patch(`/problems/${data._id}/publish`);
      toast.success('✅ Problem created and published!');
      setForm(BLANK_PROBLEM);
      setTab('problems');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Failed to create problem');
    } finally { setSubmitting(false); }
  };

  const addExample = () => setForm(prev => ({ ...prev, examples: [...prev.examples, { input: '', output: '', explanation: '' }] }));
  const updateExample = (i: number, key: string, val: string) => setForm(prev => ({
    ...prev,
    examples: prev.examples.map((ex, idx) => idx === i ? { ...ex, [key]: val } : ex)
  }));
  const removeExample = (i: number) => setForm(prev => ({ ...prev, examples: prev.examples.filter((_, idx) => idx !== i) }));

  const addTestCase = () => setForm(prev => ({ ...prev, testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }] }));
  const updateTestCase = (i: number, key: string, val: unknown) => setForm(prev => ({
    ...prev,
    testCases: prev.testCases.map((tc, idx) => idx === i ? { ...tc, [key]: val } : tc)
  }));
  const removeTestCase = (i: number) => setForm(prev => ({ ...prev, testCases: prev.testCases.filter((_, idx) => idx !== i) }));

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.adminHeader}>
          <div className={styles.adminBadge}>⚙️ Admin Panel</div>
          <div className={styles.adminUser}>Logged in as <strong>{user.username}</strong></div>
        </div>
        <nav className={styles.nav}>
          {([
            { id: 'problems', label: '📋 All Problems', desc: 'View & manage' },
            { id: 'add-problem', label: '➕ Add Problem', desc: 'Create new challenge' },
            { id: 'courses', label: '📚 Courses', desc: 'Coming soon' },
            { id: 'add-course', label: '➕ Add Course', desc: 'Coming soon' },
          ] as Array<{ id: AdminTab; label: string; desc: string }>).map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${tab === item.id ? styles.navActive : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.navDesc}>{item.desc}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* ─── Problems List ─── */}
        {tab === 'problems' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.sectionTitle}>All Problems</h1>
              <button className="btn btn-primary btn-sm" onClick={() => setTab('add-problem')}>+ New Problem</button>
            </div>
            {loading ? (
              <div className={styles.loadingRow}>{[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>#</th><th>Title</th><th>Difficulty</th><th>Submissions</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {problems.length === 0 && (
                      <tr><td colSpan={6} className={styles.empty}>No problems yet. Add one!</td></tr>
                    )}
                    {problems.map((p, i) => (
                      <tr key={p._id} className={styles.row}>
                        <td className={styles.num}>{i + 1}</td>
                        <td className={styles.ptitle}>{p.title}</td>
                        <td><span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span></td>
                        <td className={styles.num}>{p.totalSubmissions}</td>
                        <td>
                          <span className={`badge ${p.isPublished ? 'badge-easy' : 'badge-purple'}`}>
                            {p.isPublished ? '✅ Live' : '🔒 Draft'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className={`btn btn-sm ${p.isPublished ? 'btn-danger' : 'btn-blue'}`}
                              onClick={() => handlePublish(p._id, p.isPublished)}
                            >
                              {p.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Add Problem Form ─── */}
        {tab === 'add-problem' && (
          <div className={styles.section}>
            <h1 className={styles.sectionTitle}>Create New Problem</h1>
            <form onSubmit={handleAddProblem} className={styles.form}>
              {/* Basic Info */}
              <div className={styles.formGroup}>
                <h3 className={styles.groupTitle}>📝 Basic Info</h3>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className="label" htmlFor="p-title">Title *</label>
                    <input id="p-title" className="input" placeholder="Two Sum" value={form.title}
                      onChange={e => { updateForm('title', e.target.value); if (!form.slug) updateForm('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} required />
                  </div>
                  <div className={styles.field}>
                    <label className="label" htmlFor="p-slug">Slug *</label>
                    <input id="p-slug" className="input" placeholder="two-sum" value={form.slug}
                      onChange={e => updateForm('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required />
                  </div>
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className="label" htmlFor="p-diff">Difficulty</label>
                    <select id="p-diff" className="input" value={form.difficulty} onChange={e => updateForm('difficulty', e.target.value)}>
                      <option value="Easy">🟢 Easy</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Hard">🔴 Hard</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className="label" htmlFor="p-tags">Tags (comma-separated)</label>
                    <input id="p-tags" className="input" placeholder="Array, HashMap, Two Pointers" value={form.tags}
                      onChange={e => updateForm('tags', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <h3 className={styles.groupTitle}>📄 Description (Markdown supported)</h3>
                <div className={styles.field}>
                  <label className="label" htmlFor="p-desc">Problem Statement *</label>
                  <textarea id="p-desc" className={`input ${styles.textarea}`} rows={8}
                    placeholder="## Problem Title&#10;&#10;Given an array of integers **nums** and an integer **target**, return indices of the two numbers that add up to target.&#10;&#10;### Input Format&#10;..."
                    value={form.description} onChange={e => updateForm('description', e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className="label" htmlFor="p-constraints">Constraints</label>
                  <textarea id="p-constraints" className={`input ${styles.textareaSm}`} rows={3}
                    placeholder="- 2 ≤ nums.length ≤ 10^4&#10;- -10^9 ≤ nums[i] ≤ 10^9"
                    value={form.constraints} onChange={e => updateForm('constraints', e.target.value)} />
                </div>
              </div>

              {/* Examples */}
              <div className={styles.formGroup}>
                <div className={styles.groupHeader}>
                  <h3 className={styles.groupTitle}>💡 Examples (shown to users)</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addExample}>+ Add Example</button>
                </div>
                {form.examples.map((ex, i) => (
                  <div key={i} className={styles.caseCard}>
                    <div className={styles.caseHeader}>
                      <span>Example {i + 1}</span>
                      {form.examples.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => removeExample(i)}>Remove</button>}
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label className="label">Input</label>
                        <textarea className={`input ${styles.textareaSm}`} rows={2} placeholder="nums = [2,7,11,15]&#10;target = 9" value={ex.input} onChange={e => updateExample(i, 'input', e.target.value)} />
                      </div>
                      <div className={styles.field}>
                        <label className="label">Output</label>
                        <textarea className={`input ${styles.textareaSm}`} rows={2} placeholder="[0, 1]" value={ex.output} onChange={e => updateExample(i, 'output', e.target.value)} />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className="label">Explanation (optional)</label>
                      <input className="input" placeholder="nums[0] + nums[1] = 2 + 7 = 9" value={ex.explanation} onChange={e => updateExample(i, 'explanation', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Test Cases */}
              <div className={styles.formGroup}>
                <div className={styles.groupHeader}>
                  <h3 className={styles.groupTitle}>🧪 Test Cases (used for judging)</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addTestCase}>+ Add Test Case</button>
                </div>
                <p className={styles.hint}>⚠️ The <strong>stdin input</strong> will be passed to the program via standard input. The <strong>expected output</strong> must exactly match stdout (no trailing spaces).</p>
                {form.testCases.map((tc, i) => (
                  <div key={i} className={styles.caseCard}>
                    <div className={styles.caseHeader}>
                      <span>Test Case {i + 1}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <label className={styles.hiddenLabel}>
                          <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestCase(i, 'isHidden', e.target.checked)} />
                          Hidden
                        </label>
                        {form.testCases.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => removeTestCase(i)}>Remove</button>}
                      </div>
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label className="label">stdin (input)</label>
                        <textarea className={`input ${styles.textareaSm}`} rows={2} placeholder="2&#10;7" value={tc.input} onChange={e => updateTestCase(i, 'input', e.target.value)} />
                      </div>
                      <div className={styles.field}>
                        <label className="label">Expected stdout</label>
                        <textarea className={`input ${styles.textareaSm}`} rows={2} placeholder="9" value={tc.expectedOutput} onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hints */}
              <div className={styles.formGroup}>
                <h3 className={styles.groupTitle}>💬 Hints (one per line, optional)</h3>
                <textarea className={`input ${styles.textareaSm}`} rows={3}
                  placeholder="Use a HashMap to store seen values&#10;The complement of each number is target - num"
                  value={form.hints} onChange={e => updateForm('hints', e.target.value)} />
              </div>

              <div className={styles.submitRow}>
                <button type="button" className="btn btn-secondary" onClick={() => setTab('problems')}>Cancel</button>
                <button id="admin-create-btn" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating...</> : '🚀 Create & Publish Problem'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── Courses (placeholder) ─── */}
        {(tab === 'courses' || tab === 'add-course') && (
          <div className={styles.section}>
            <h1 className={styles.sectionTitle}>{tab === 'courses' ? 'Courses' : 'Add Course'}</h1>
            <div className={styles.comingSoon}>
              <div className={styles.comingSoonIcon}>🚧</div>
              <h2>Coming Soon</h2>
              <p>Course management UI is in development. You can add courses via the API.</p>
              <pre className={styles.apiExample}>{`POST /api/learn
Authorization: Bearer <admin_token>
{
  "title": "Course Title",
  "slug": "course-slug",
  "description": "...",
  "difficulty": "Beginner",
  "tags": ["Python"],
  "lessons": [...]
}`}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
