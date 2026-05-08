'use client';
import styles from './LanguageSelector.module.css';

const LANGUAGES = [
  { id: 'python', label: 'Python 3', icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'typescript', label: 'TypeScript', icon: '🔷' },
  { id: 'cpp', label: 'C++', icon: '⚙️' },
  { id: 'c', label: 'C', icon: '🔧' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'go', label: 'Go', icon: '🐹' },
  { id: 'rust', label: 'Rust', icon: '🦀' },
  { id: 'csharp', label: 'C#', icon: '💜' },
  { id: 'php', label: 'PHP', icon: '🐘' },
  { id: 'ruby', label: 'Ruby', icon: '💎' },
  { id: 'kotlin', label: 'Kotlin', icon: '🎯' },
  { id: 'swift', label: 'Swift', icon: '🦅' },
];

interface Props { value: string; onChange: (lang: string) => void; }

export default function LanguageSelector({ value, onChange }: Props) {
  const current = LANGUAGES.find((l) => l.id === value);
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>{current?.icon ?? '📝'}</span>
      <select
        id="language-select"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select programming language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>{lang.icon} {lang.label}</option>
        ))}
      </select>
    </div>
  );
}

export { LANGUAGES };
