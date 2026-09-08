import React, { useState } from 'react';
import { usePyodide } from '../../hooks/usePyodide';

interface CodeEditorCellProps {
  code: string;
  onChange: (code: string) => void;
  language?: string;
  onUpdateLanguage: (lang: string) => void;
  onRunSuccess?: (output: {
    text_output: string | null;
    error_output: string | null;
    image_output: string | null;
  }) => void;
}

export const CodeEditorCell: React.FC<CodeEditorCellProps> = ({
  code,
  onChange,
  language = 'python',
  onUpdateLanguage,
  onRunSuccess
}) => {
  const { runCode, isLoading, error } = usePyodide();
  const [output, setOutput] = useState('');
  const [plot, setPlot] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRun = async () => {
    setIsExecuting(true);
    setPlot(null);
    try {
      const result = await runCode(code);
      const stdout = result.stdout || null;
      const stderr = result.stderr || null;
      const plotBase64 = result.plot || null;

      const fullOutput = [result.stdout, result.stderr, result.result].filter(Boolean).join('\n');
      setOutput(fullOutput);
      if (result.plot) {
        setPlot("data:image/png;base64," + result.plot);
      }

      if (onRunSuccess) {
        onRunSuccess({
          text_output: fullOutput || null,
          error_output: stderr,
          image_output: plotBase64,
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setOutput("Error: " + errMsg);
      if (onRunSuccess) {
        onRunSuccess({
          text_output: null,
          error_output: errMsg,
          image_output: null,
        });
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleRun();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <input
          type="text"
          value={language}
          onChange={(e) => onUpdateLanguage(e.target.value)}
          className="text-xs bg-slate-100 border border-slate-300 rounded px-1 w-24"
        />
        <button
          onClick={handleRun}
          disabled={isExecuting || isLoading}
          className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-md hover:bg-opacity-80 disabled:bg-slate-400 transition-colors"
        >
          {isExecuting ? 'Running...' : isLoading ? 'Loading Python...' : 'Run (Shift+Enter)'}
        </button>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-2 text-sm border border-slate-200 rounded-md font-mono bg-slate-900 text-white"
        rows={5}
        placeholder="Enter python code..."
      />
      {output && (
        <div className="p-3 rounded-lg bg-black text-green-400 font-mono text-sm whitespace-pre-wrap border border-slate-700">
          {output}
        </div>
      )}
      {plot && (
        <div className="flex justify-center rounded-lg overflow-hidden border border-slate-300 bg-white">
          <img src={plot} alt="Plot output" className="max-w-full h-auto" />
        </div>
      )}
      {error && (
        <div className="mt-2 p-2 text-xs text-red-500 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};
