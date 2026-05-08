import axios from 'axios';

const WANDBOX_API = 'https://wandbox.org/api/compile.json';

// Since Piston went whitelist-only, we gracefully fallback to Wandbox.org API
export const LANGUAGE_RUNTIMES: Record<string, { compiler: string }> = {
  python: { compiler: 'cpython-3.14.0' },
  javascript: { compiler: 'nodejs-20.17.0' },
  typescript: { compiler: 'nodejs-20.17.0' }, // Wandbox doesn't do pure TS readily, falling back to JS for demo
  cpp: { compiler: 'gcc-13.2.0' },
  c: { compiler: 'gcc-13.2.0-c' },
  java: { compiler: 'openjdk-jdk-22+36' },
  go: { compiler: 'go-1.23.2' },
  rust: { compiler: 'rust-1.82.0' },
  csharp: { compiler: 'mono-6.12.0.199' },
  php: { compiler: 'php-8.3.12' },
  ruby: { compiler: 'ruby-4.0.2' },
  swift: { compiler: 'swift-6.0.1' },
};

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtime: number; // in milliseconds
}

export const executeCode = async (
  language: string,
  sourceCode: string,
  stdin: string = ''
): Promise<ExecuteResult> => {
  const runtime = LANGUAGE_RUNTIMES[language];
  if (!runtime) throw new Error(`Language '${language}' is not supported`);

  const startTime = Date.now();

  const response = await axios.post(
    WANDBOX_API,
    {
      compiler: runtime.compiler,
      code: sourceCode,
      stdin: stdin,
    },
    { timeout: 30000 }
  );

  const elapsed = Date.now() - startTime;
  const data = response.data;

  // Wandbox payload properties:
  // compiler_error, program_output, program_error, status

  if (data.compiler_error) {
    return {
      stdout: '',
      stderr: data.compiler_error.trim(),
      exitCode: 1,
      runtime: elapsed,
    };
  }

  // Normalize output: trim each line and the whole string to avoid invisible whitespace mismatches
  const normalizeOutput = (s: string) =>
    s.split('\n').map((l) => l.trimEnd()).join('\n').trim();

  return {
    stdout: normalizeOutput(data.program_output || ''),
    stderr: (data.program_error || '').trim(),
    exitCode: parseInt(data.status || '0', 10),
    runtime: elapsed,
  };
};
