'use client';
import dynamic from 'next/dynamic';
import { useRef, useCallback } from 'react';
import type * as Monaco from 'monaco-editor';
import toast from 'react-hot-toast';
import styles from './CodeEditor.module.css';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
}

const MONACO_LANG_MAP: Record<string, string> = {
  python: 'python', javascript: 'javascript', typescript: 'typescript',
  cpp: 'cpp', c: 'c', java: 'java', go: 'go', rust: 'rust',
  csharp: 'csharp', php: 'php', ruby: 'ruby', kotlin: 'kotlin', swift: 'swift',
};

export default function CodeEditor({ value, onChange, language, height = '500px', readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      editorRef.current = editor;

      editor.updateOptions({
        contextmenu: false,
        readOnly,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: 14,
        lineHeight: 22,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        renderLineHighlight: 'gutter',
        smoothScrolling: true,
        cursorBlinking: 'phase',
        cursorSmoothCaretAnimation: 'on',
        padding: { top: 16, bottom: 16 },
        lineNumbers: 'on',
        glyphMargin: false,
        folding: true,
        bracketPairColorization: { enabled: true },
      });

      if (!readOnly) {
        // ── ANTI PASTE ──────────────────────────────────────────────
        editor.onDidPaste(() => {
          toast.error('🚫 Copy-paste is disabled on CodeForge!', { id: 'paste-block' });
          const model = editor.getModel();
          if (!model) return;
          // Undo the paste
          editor.trigger('keyboard', 'undo', null);
        });

        // Block Ctrl+V / Cmd+V
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
          toast.error('🚫 Paste is disabled!', { id: 'paste-block' });
        });

        // Allow copy for reading but block paste on container
        const container = editor.getContainerDomNode();
        container.addEventListener('paste', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toast.error('🚫 Copy-paste is disabled!', { id: 'paste-block' });
        }, true);

        // Block right-click context menu at DOM level
        container.addEventListener('contextmenu', (e) => e.preventDefault(), true);
      }
    },
    [readOnly]
  );

  return (
    <div className={styles.editorWrapper} style={{ height }}>
      <MonacoEditor
        height={height}
        language={MONACO_LANG_MAP[language] || 'plaintext'}
        value={value}
        onChange={(val) => onChange(val || '')}
        theme="vs-dark"
        onMount={handleMount}
        options={{ automaticLayout: true }}
        loading={
          <div className={styles.editorLoading}>
            <div className="spinner" />
            <span>Loading editor...</span>
          </div>
        }
      />
    </div>
  );
}
