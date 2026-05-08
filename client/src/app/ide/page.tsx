'use client';
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import LanguageSelector from '@/components/Editor/LanguageSelector';
import OutputPanel from '@/components/Editor/OutputPanel';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import styles from './page.module.css';

const CodeEditor = dynamic(() => import('@/components/Editor/CodeEditor'), { ssr: false });

const STARTER_CODE: Record<string, string> = {
  python: `def solve():
    print("Hello, CodeForge! 🚀")

if __name__ == "__main__":
    solve()
`,
  javascript: `// CodeForge Online IDE
console.log("Hello, CodeForge! 🚀");
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CodeForge! 🚀" << endl;
    return 0;
}
`,
  java: `import java.util.*;

class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeForge! 🚀");
    }
}
`,
};

export default function IDEPage() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState<{ stdout?: string; stderr?: string; exitCode?: number; runtime?: number } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang] || `// Write your ${lang} code here\n`);
    setOutput(null);
  }, []);

  const handleRun = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return; }
    setIsRunning(true); setOutput(null);
    try {
      const { data } = await api.post('/execute', { language, sourceCode: code, stdin });
      setOutput(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Execution failed');
    } finally { setIsRunning(false); }
  };

  const handleClear = () => { setCode(STARTER_CODE[language] || ''); setOutput(null); };

  const handleSave = () => {
    localStorage.setItem(`cf_ide_${language}`, code);
    toast.success('Code saved locally!');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem(`cf_ide_${language}`);
    if (saved) { setCode(saved); toast.success('Code loaded!'); }
    else toast.error('No saved code for this language');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Online IDE</h1>
            <span className={styles.subtitle}>Write and execute any code — no limits, no setup</span>
          </div>
          <div className={styles.noPasteWarning}>🚫 No copy-paste — build your skills by typing</div>
        </div>
        <div className={styles.actions}>
          <LanguageSelector value={language} onChange={handleLanguageChange} />
          <button className="btn btn-ghost btn-sm" onClick={handleLoad}>📂 Load</button>
          <button className="btn btn-ghost btn-sm" onClick={handleSave}>💾 Save</button>
          <button className="btn btn-ghost btn-sm" onClick={handleClear}>🗑 Reset</button>
          <button id="ide-run-btn" className="btn btn-primary" onClick={handleRun} disabled={isRunning}>
            {isRunning ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}}/> Running</> : '▶ Run Code'}
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className={styles.layout}>
        {/* Editor */}
        <div className={styles.editorSection}>
          <CodeEditor value={code} onChange={setCode} language={language} height="100%" />
        </div>

        {/* Right panel: stdin + output */}
        <div className={styles.rightSection}>
          <div className={styles.stdinPanel}>
            <label className="label" htmlFor="ide-stdin">📥 Standard Input (stdin)</label>
            <textarea
              id="ide-stdin"
              className={`input ${styles.stdinInput}`}
              placeholder="Enter input for your program here..."
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={6}
            />
          </div>
          <div className={styles.outputWrapper}>
            <OutputPanel
              stdout={output?.stdout}
              stderr={output?.stderr}
              runtime={output?.runtime}
              isRunning={isRunning}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
