'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './page.module.css';

const CodeEditor = dynamic(() => import('@/components/Editor/CodeEditor'), { ssr: false });
const OutputPanel = dynamic(() => import('@/components/Editor/OutputPanel'), { ssr: false });

interface Quiz {
  question: string;
  options: string[];
  answer: number;
}

interface Lesson {
  _id: string;
  title: string;
  order: number;
  content: string;
  codeLanguage: string;
  codeExample: string;
  quiz?: Quiz[];
  duration: number;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  difficulty: string;
  lessons: Lesson[];
}

// Fallback lesson content for demo (when no DB)
const FALLBACK_COURSES: Record<string, Course> = {
  'python-beginners': {
    _id: '1', title: 'Python for Absolute Beginners', slug: 'python-beginners', difficulty: 'Beginner',
    lessons: [
      {
        _id: 'l1', title: 'Hello, World!', order: 1, duration: 5, codeLanguage: 'python',
        codeExample: `# Your first Python program\nprint("Hello, World!")`,
        content: `## Welcome to Python!\n\nPython is one of the most popular programming languages in the world. It's known for being **simple to read and write**, making it perfect for beginners.\n\n### Your First Program\n\nIn Python, printing something to the screen is incredibly easy:\n\n\`\`\`python\nprint("Hello, World!")\n\`\`\`\n\nThe \`print()\` function outputs text to the console. The text you want to print goes inside the parentheses, wrapped in quotes.\n\n### Why Python?\n\n- 🐍 Easy to learn — reads almost like English\n- 🚀 Versatile — web, AI, data science, automation\n- 💼 In-demand — one of the top 3 most used languages\n- 🌐 Huge community and libraries\n\n### Try it!\n\nIn the editor below, type the code yourself (no copy-paste!). Then click **Run** to see the output.`,
        quiz: [
          { question: 'Which function is used to print output in Python?', options: ['console.log()', 'printf()', 'print()', 'echo()'], answer: 2 },
          { question: 'What do you put text inside when using print()?', options: ['Square brackets []', 'Curly braces {}', 'Quotes "" or \'\'', 'Angle brackets <>'], answer: 2 },
        ]
      },
      {
        _id: 'l2', title: 'Variables & Data Types', order: 2, duration: 8, codeLanguage: 'python',
        codeExample: `# Variables in Python\nname = "Alice"\nage = 25\nheight = 5.7\nis_student = True\n\nprint(name, age, height, is_student)\nprint(type(name), type(age))`,
        content: `## Variables & Data Types\n\nA **variable** is a named container that stores data. In Python, you create a variable simply by assigning a value to it — no need to declare a type!\n\n### Basic Types\n\n| Type | Example | Description |\n|---|---|---|\n| \`int\` | \`age = 25\` | Whole numbers |\n| \`float\` | \`height = 5.7\` | Decimal numbers |\n| \`str\` | \`name = "Alice"\` | Text (string) |\n| \`bool\` | \`active = True\` | True or False |\n\n### Creating Variables\n\n\`\`\`python\nname = "Alice"    # string\nage = 25          # integer  \nheight = 5.7      # float\nis_active = True  # boolean\n\`\`\`\n\n### Checking Types\n\nUse \`type()\` to check what type a variable is:\n\n\`\`\`python\nprint(type(name))   # <class 'str'>\nprint(type(age))    # <class 'int'>\n\`\`\`\n\n> **Remember:** Variable names are case-sensitive. \`Name\` and \`name\` are different!`,
        quiz: [
          { question: 'What type is the value 3.14?', options: ['int', 'float', 'str', 'bool'], answer: 1 },
          { question: 'Which is a valid variable name in Python?', options: ['2name', 'my name', 'my_name', 'my-name'], answer: 2 },
        ]
      },
      {
        _id: 'l3', title: 'Loops — for and while', order: 3, duration: 10, codeLanguage: 'python',
        codeExample: `# For loop - iterate 5 times\nfor i in range(5):\n    print(f"Count: {i}")\n\n# While loop\nx = 0\nwhile x < 3:\n    print(f"x = {x}")\n    x += 1`,
        content: `## Loops in Python\n\nLoops let you **repeat code** without writing it multiple times.\n\n### The \`for\` Loop\n\nUse \`for\` when you know how many times to repeat:\n\n\`\`\`python\nfor i in range(5):\n    print(i)  # prints 0, 1, 2, 3, 4\n\`\`\`\n\n\`range(n)\` generates numbers from 0 to n-1.\n\n### The \`while\` Loop\n\nUse \`while\` when you repeat until a condition becomes false:\n\n\`\`\`python\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n\`\`\`\n\n> ⚠️ **Infinite Loop Warning!** Always make sure your \`while\` condition will eventually become False, or your program will run forever.\n\n### Loop Control\n- \`break\` — exit the loop immediately\n- \`continue\` — skip the rest of this iteration`,
        quiz: [
          { question: 'What does range(3) produce?', options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '1, 2'], answer: 1 },
          { question: 'Which keyword exits a loop immediately?', options: ['stop', 'exit', 'break', 'continue'], answer: 2 },
        ]
      },
    ]
  },
  'dsa': {
    _id: '2', title: 'Data Structures & Algorithms', slug: 'dsa', difficulty: 'Intermediate',
    lessons: [
      {
        _id: 'd1', title: 'Arrays and Lists', order: 1, duration: 12, codeLanguage: 'python',
        codeExample: `# Python List (dynamic array)\narr = [1, 2, 3, 4, 5]\n\n# Access by index\nprint(arr[0])    # 1\nprint(arr[-1])   # 5 (last element)\n\n# Slicing\nprint(arr[1:3])  # [2, 3]\n\n# Common operations\narr.append(6)    # O(1)\narr.insert(0, 0) # O(n)\narr.pop()        # O(1)\nprint(arr)`,
        content: `## Arrays and Lists\n\nAn **array** is the most fundamental data structure — a contiguous block of memory storing elements of the same type.\n\n### Python Lists\n\nIn Python, lists are **dynamic arrays** — they grow automatically:\n\n\`\`\`python\narr = [10, 20, 30, 40, 50]\n\`\`\`\n\n### Time Complexities\n\n| Operation | Complexity | Reason |\n|---|---|---|\n| Access \`arr[i]\` | O(1) | Direct memory address |\n| Search (unsorted) | O(n) | Scan every element |\n| Append | O(1) amortized | Space at end |\n| Insert at start | O(n) | Shift everything right |\n| Delete at start | O(n) | Shift everything left |\n\n### Key Insight\n\n> Arrays are **great for random access** (getting element by index) but **slow for insertions/deletions** in the middle.`,
        quiz: [
          { question: 'What is the time complexity of accessing arr[i] in an array?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 2 },
          { question: 'Why is inserting at the start of an array O(n)?', options: ['Memory allocation', 'All elements must be shifted right', 'Searching takes O(n)', 'Arrays are linked'], answer: 1 },
        ]
      },
    ]
  },
};

export default function LessonPage() {
  const { slug, lessonId } = useParams() as { slug: string; lessonId: string };
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<{ stdout?: string; stderr?: string; runtime?: number } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'lesson' | 'editor'>('lesson');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/learn/${slug}`);
        setCourse(data);
        const foundLesson = data.lessons.find((l: Lesson) => l._id === lessonId) || data.lessons[0];
        setLesson(foundLesson);
        setCode(foundLesson?.codeExample || '');
      } catch {
        // Fall back to static content
        const fallback = FALLBACK_COURSES[slug];
        if (fallback) {
          setCourse(fallback);
          const foundLesson = fallback.lessons.find(l => l._id === lessonId) || fallback.lessons[0];
          setLesson(foundLesson || null);
          setCode(foundLesson?.codeExample || '');
        } else {
          toast.error('Course not found');
          router.push('/learn');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, lessonId, router]);

  const handleRun = async () => {
    if (!code.trim() || !lesson) return;
    setIsRunning(true); setOutput(null);
    try {
      const { data } = await api.post('/execute', { language: lesson.codeLanguage, sourceCode: code, stdin: '' });
      setOutput(data);
    } catch {
      toast.error('Execution failed');
    } finally { setIsRunning(false); }
  };

  const handleQuizSubmit = () => {
    if (!lesson?.quiz) return;
    const total = lesson.quiz.length;
    const correct = lesson.quiz.filter((q, i) => selectedAnswers[i] === q.answer).length;
    setQuizSubmitted(true);
    if (correct === total) toast.success(`🎉 Perfect score! ${correct}/${total}`);
    else toast.error(`${correct}/${total} correct — try again!`);
  };

  const navigateLesson = (dir: 'prev' | 'next') => {
    if (!course || !lesson) return;
    const sorted = [...course.lessons].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(l => l._id === lesson._id);
    const target = dir === 'next' ? sorted[idx + 1] : sorted[idx - 1];
    if (target) router.push(`/learn/${slug}/${target._id}`);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  );
  if (!course || !lesson) return null;

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
  const currentIdx = sortedLessons.findIndex(l => l._id === lesson._id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < sortedLessons.length - 1;

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.courseHeader}>
          <Link href="/learn" className={styles.backLink}>← All Courses</Link>
          <h2 className={styles.courseTitle}>{course.title}</h2>
          <div className={styles.progress}>
            <div className={styles.progressBar} style={{ width: `${((currentIdx + 1) / sortedLessons.length) * 100}%` }} />
          </div>
          <span className={styles.progressText}>{currentIdx + 1} / {sortedLessons.length} lessons</span>
        </div>
        <nav className={styles.lessonList}>
          {sortedLessons.map((l, i) => (
            <Link
              key={l._id}
              href={`/learn/${slug}/${l._id}`}
              className={`${styles.lessonItem} ${l._id === lesson._id ? styles.lessonActive : ''} ${i < currentIdx ? styles.lessonDone : ''}`}
            >
              <span className={styles.lessonNum}>
                {i < currentIdx ? '✅' : i === currentIdx ? '▶' : `${i + 1}`}
              </span>
              <span className={styles.lessonName}>{l.title}</span>
              <span className={styles.lessonDuration}>{l.duration}m</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.lessonMeta}>
            <h1 className={styles.lessonTitle}>{lesson.title}</h1>
            <span className={styles.duration}>⏱ {lesson.duration} min</span>
          </div>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'lesson' ? styles.tabActive : ''}`} onClick={() => setActiveTab('lesson')}>📖 Lesson</button>
            <button className={`${styles.tab} ${activeTab === 'editor' ? styles.tabActive : ''}`} onClick={() => setActiveTab('editor')}>💻 Practice</button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'lesson' && (
            <div className={styles.lessonContent}>
              {/* Markdown */}
              <div className={styles.mdContent}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
              </div>

              {/* Inline code example (read-only preview) */}
              {lesson.codeExample && (
                <div className={styles.exampleBlock}>
                  <div className={styles.exampleHeader}>
                    <span>📝 Code Example</span>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('editor')}>Try it yourself →</button>
                  </div>
                  <pre className={styles.codePreview}>{lesson.codeExample}</pre>
                </div>
              )}

              {/* Quiz */}
              {lesson.quiz && lesson.quiz.length > 0 && (
                <div className={styles.quiz}>
                  <h2 className={styles.quizTitle}>🧠 Quick Check</h2>
                  {lesson.quiz.map((q, qi) => (
                    <div key={qi} className={styles.quizQuestion}>
                      <p className={styles.question}>{q.question}</p>
                      <div className={styles.options}>
                        {q.options.map((opt, oi) => {
                          let optClass = styles.option;
                          if (quizSubmitted) {
                            if (oi === q.answer) optClass = `${styles.option} ${styles.correct}`;
                            else if (selectedAnswers[qi] === oi) optClass = `${styles.option} ${styles.wrong}`;
                          } else if (selectedAnswers[qi] === oi) {
                            optClass = `${styles.option} ${styles.selected}`;
                          }
                          return (
                            <button
                              key={oi}
                              className={optClass}
                              onClick={() => !quizSubmitted && setSelectedAnswers({ ...selectedAnswers, [qi]: oi })}
                            >
                              <span className={styles.optionLetter}>{String.fromCharCode(65 + oi)}</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {!quizSubmitted ? (
                    <button
                      id="quiz-submit-btn"
                      className="btn btn-primary"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(selectedAnswers).length < (lesson.quiz?.length || 0)}
                    >
                      Submit Answers
                    </button>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => { setQuizSubmitted(false); setSelectedAnswers({}); }}>
                      Try Again
                    </button>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className={styles.navButtons}>
                <button className="btn btn-secondary" disabled={!hasPrev} onClick={() => navigateLesson('prev')}>← Previous</button>
                {hasNext ? (
                  <button className="btn btn-primary" onClick={() => navigateLesson('next')}>Next Lesson →</button>
                ) : (
                  <Link href="/learn" className="btn btn-primary">🎉 Course Complete!</Link>
                )}
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className={styles.editorView}>
              <div className={styles.noPasteNotice}>🚫 Copy-paste is disabled — type every character to build real muscle memory</div>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={lesson.codeLanguage || 'python'}
                height="380px"
              />
              <div className={styles.runBar}>
                <button id="lesson-run-btn" className="btn btn-primary" onClick={handleRun} disabled={isRunning}>
                  {isRunning ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Running</> : '▶ Run Code'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setCode(lesson.codeExample || '')}>Reset to Example</button>
              </div>
              <OutputPanel stdout={output?.stdout} stderr={output?.stderr} runtime={output?.runtime} isRunning={isRunning} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
