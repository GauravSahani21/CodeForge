import Link from 'next/link';
import styles from './page.module.css';

const FEATURES = [
  { icon: '⚡', title: 'Full Code Challenges', desc: 'Master the craft by writing complete programs, including main() and complex boilerplate. No more function stubs.' },
  { icon: '🛠️', title: 'Integrated Compiler', desc: 'A blazing fast, cloud-hosted IDE supporting 13+ languages. Compile, execute, and debug your logic in milliseconds.' },
  { icon: '📚', title: 'Curated Learning Path', desc: 'Step-by-step interactive courses designed for deep mastery. From fundamentals to advanced data structures.' },
  { icon: '🔥', title: 'Activity Heatmap', desc: 'Visualize your progress with a GitHub-style persistence graph. Compete with yourself to keep the streak alive.' },
  { icon: '🚫', title: 'Anti-Paste Guard', desc: 'Our unique editor enforces muscle memory by preventing copy-paste. You type every line, you own every concept.' },
  { icon: '🏆', title: 'Global Rankings', desc: 'Climb the competitive leaderboard. Earn prestige by solving hardest challenges and helping the community.' },
];

const STATS = [
  { value: '200+', label: 'Challenges' },
  { value: '13+', label: 'Languages' },
  { value: '50+', label: 'Courses' },
  { value: '∞', label: 'Potential' },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.heroBg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>
      {/* Hero */}
      <section className={styles.hero}>

        <div className={`container ${styles.heroContent}`}>
          <div className={`badge badge-blue ${styles.heropill}`}>✨ The LeetCode alternative that demands more</div>
          <h1 className={styles.heroTitle}>
            Code. Learn.<br />
            <span className="gradient-text">Conquer.</span>
          </h1>
          <p className={styles.heroSub}>
            The platform for developers who want to <strong>write real code</strong> — not just function stubs.
            Full online compiler, 200+ problems, structured courses, and streak tracking.
          </p>
          <div className={styles.heroActions}>
            <Link href="/auth/signup" className="btn btn-primary btn-lg">Start Coding Free</Link>
            <Link href="/problems" className="btn btn-secondary btn-lg">Browse Problems →</Link>
          </div>
          {/* Code preview mockup */}
          <div className={styles.codePreview}>
            <div className={styles.codeBar}>
              <span className={`${styles.dot} ${styles.red}`}/><span className={`${styles.dot} ${styles.yellow}`}/><span className={`${styles.dot} ${styles.green}`}/>
              <span className={styles.codeFile}>solution.py</span>
            </div>
            <pre className={styles.codeContent} dangerouslySetInnerHTML={{ __html: `<span style="color:#f78c6c">def</span> <span style="color:#82aaff">solve</span><span style="color:#89ddff">(</span><span style="color:#c3e88d">n</span><span style="color:#89ddff">):</span>
    <span style="color:#546e7a"># Write your complete solution here</span>
    <span style="color:#f78c6c">if</span> n <span style="color:#89ddff">&lt;=</span> <span style="color:#f78c6c">1</span><span style="color:#89ddff">:</span>
        <span style="color:#f78c6c">return</span> n
    <span style="color:#f78c6c">return</span> solve<span style="color:#89ddff">(</span>n<span style="color:#89ddff">-</span><span style="color:#f78c6c">1</span><span style="color:#89ddff">)</span> <span style="color:#89ddff">+</span> solve<span style="color:#89ddff">(</span>n<span style="color:#89ddff">-</span><span style="color:#f78c6c">2</span><span style="color:#89ddff">)</span>

<span style="color:#f78c6c">if</span> __name__ <span style="color:#89ddff">==</span> <span style="color:#c3e88d">"__main__"</span><span style="color:#89ddff">:</span>
    n <span style="color:#89ddff">=</span> <span style="color:#82aaff">int</span><span style="color:#89ddff">(</span><span style="color:#82aaff">input</span><span style="color:#89ddff">())</span>
    <span style="color:#82aaff">print</span><span style="color:#89ddff">(</span>solve<span style="color:#89ddff">(</span>n<span style="color:#89ddff">))</span>` }} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={`text-center ${styles.sectionHeader}`}>
            <h2>Everything you need to level up</h2>
            <p>Built for coders who are serious about growth</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2>Ready to forge your skills?</h2>
            <p>Join thousands of developers who type every character, every day.</p>
            <Link href="/auth/signup" className="btn btn-primary btn-lg">Create Free Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
