import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { usePyodide } from '../../hooks/usePyodide';

interface CodeCellProps {
  code: string;
  initialOutput?: string;
  language?: string;
  isAdmin?: boolean;
}

export const CodeCell: React.FC<CodeCellProps> = ({ code, initialOutput, language = 'python', isAdmin }) => {
  const { runCode, isLoading, error } = usePyodide();
  const [output, setOutput] = useState(initialOutput || '');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRun = async () => {
    setIsExecuting(true);
    try {
      const result = await runCode(code);
      const fullOutput = [result.stdout, result.stderr, result.result].filter(Boolean).join('\\n');
      setOutput(fullOutput);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-xl bg-secondary border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono text-text_muted uppercase">{language}</span>
        <button
          onClick={handleRun}
          disabled={isExecuting || isLoading}
          className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-md hover:bg-opacity-80 disabled:bg-slate-400 transition-colors"
        >
          {isExecuting ? 'Running...' : isLoading ? 'Loading Python...' : 'Run'}
        </button>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-300 mb-3">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1rem' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {output && (
        <div className="p-3 rounded-lg bg-black text-green-400 font-mono text-sm whitespace-pre-wrap border border-slate-700">
          {output}
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 text-xs text-red-500 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}

      {isAdmin && (
        <div className="mt-2 text-xs text-text_muted italic">
          Code Cell
        </div>
      )}
    </div>
  );
};
