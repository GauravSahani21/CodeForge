'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import LanguageSelector from '@/components/Editor/LanguageSelector';
import OutputPanel from '@/components/Editor/OutputPanel';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './page.module.css';

const CodeEditor = dynamic(() => import('@/components/Editor/CodeEditor'), { ssr: false });

interface Problem {
  _id: string; title: string; slug: string; difficulty: string;
  tags: string[]; description: string; constraints: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  starterTemplates: Record<string, string>;
  hints: string[];
}

const DEFAULT_TEMPLATES: Record<string, string> = {
  python: `def solve():
    # Write your solution here
    pass

if __name__ == "__main__":
    solve()
`,
  javascript: `// Write your solution here
// Use console.log() to print output
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}
`,
  java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        
    }
}
`,
};

export default function ProblemSolvePage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { user } = useAuthStore();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'hints'>('description');
  const [output, setOutput] = useState<{ 
    stdout?: string; 
    stderr?: string; 
    status?: string; 
    runtime?: number; 
    testResults?: any[]; 
    passedCount?: number; 
    totalCount?: number; 
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    api.get(`/problems/${slug}`).then(({ data }) => {
      setProblem(data);
      const tmpl = data.starterTemplates?.[language] || DEFAULT_TEMPLATES[language] || '';
      setCode(tmpl);
      setLoading(false);
    }).catch(() => { toast.error('Problem not found'); router.push('/problems'); });
  }, [slug, router]);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    setCode(problem?.starterTemplates?.[lang] || DEFAULT_TEMPLATES[lang] || '');
    setOutput(null);
  }, [problem]);

  const handleRun = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return; }
    setIsRunning(true); setOutput(null);
    try {
      const stdin = showCustomInput ? customInput : (problem?.examples?.[0]?.input || '');
      const { data } = await api.post('/execute', { language, sourceCode: code, stdin });
      setOutput(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Execution failed');
    } finally { setIsRunning(false); }
  };

  const handleSubmit = async () => {
    if (!user) { toast.error('Sign in to submit!'); router.push('/auth/login'); return; }
    if (!code.trim() || !problem) return;
    setIsSubmitting(true); setOutput(null);
    try {
      const { data } = await api.post('/submissions', { problemId: problem._id, language, sourceCode: code });
      setOutput(data);
      if (data.status === 'Accepted') toast.success('🎉 Accepted!');
      else toast.error(`❌ ${data.status}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Submission failed');
    } finally { setIsSubmitting(false); }
  };

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  );
  if (!problem) return null;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.problemMeta}>
          <h1 className={styles.problemTitle}>{problem.title}</h1>
          <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
          {problem.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
        <div className={styles.topActions}>
          <LanguageSelector value={language} onChange={handleLanguageChange} />
          <button id="run-code-btn" className="btn btn-secondary btn-sm" onClick={handleRun} disabled={isRunning || isSubmitting}>
            {isRunning ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}}/> Running</> : '▶ Run'}
          </button>
          <button id="submit-code-btn" className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
            {isSubmitting ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}}/> Judging</> : '⚡ Submit'}
          </button>
        </div>
      </div>

      {/* Main split layout */}
      <div className={styles.splitLayout}>
        {/* Left: Problem description */}
        <div className={styles.left}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'description' ? styles.tabActive : ''}`} onClick={() => setActiveTab('description')}>Description</button>
            {problem.hints?.length > 0 && (
              <button className={`${styles.tab} ${activeTab === 'hints' ? styles.tabActive : ''}`} onClick={() => setActiveTab('hints')}>Hints ({problem.hints.length})</button>
            )}
          </div>

          {activeTab === 'description' && (
            <div className={styles.description}>
              <div className={styles.mdContent}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
              </div>

              {problem.examples?.length > 0 && (
                <div className={styles.examples}>
                  <h3>Examples</h3>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className={styles.example}>
                      <div className={styles.exampleHeader}>Example {i + 1}</div>
                      <div className={styles.ioRow}><span>Input:</span><pre>{ex.input}</pre></div>
                      <div className={styles.ioRow}><span>Output:</span><pre>{ex.output}</pre></div>
                      {ex.explanation && <div className={styles.explanation}><span>Explanation:</span> {ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints && (
                <div className={styles.constraints}>
                  <h3>Constraints</h3>
                  <div className="code-block">{problem.constraints}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hints' && (
            <div className={styles.hints}>
              {problem.hints.map((h, i) => (
                <details key={i} className={styles.hintItem}>
                  <summary className={styles.hintSummary}>💡 Hint {i + 1}</summary>
                  <p className={styles.hintContent}>{h}</p>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Right: Editor + Output */}
        <div className={styles.right}>
          <CodeEditor value={code} onChange={setCode} language={language} height="420px" />

          {/* Custom input toggle */}
          <div className={styles.inputToggle}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCustomInput(!showCustomInput)}>
              {showCustomInput ? '▲' : '▼'} Custom Input
            </button>
            {showCustomInput && (
              <textarea
                id="custom-input"
                className={`input ${styles.customInput}`}
                placeholder="Enter custom stdin here..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                rows={3}
              />
            )}
          </div>

          <OutputPanel
            stdout={output?.stdout}
            stderr={output?.stderr}
            status={output?.status}
            runtime={output?.runtime}
            testResults={output?.testResults as any}
            passedCount={output?.passedCount}
            totalCount={output?.totalCount}
            isRunning={isRunning || isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
