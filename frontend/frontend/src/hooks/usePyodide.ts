import { useState, useEffect, useCallback } from 'react';
import { loadPyodide, PyodideInterface } from 'pyodide';

export function usePyodide() {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initPyodide = useCallback(async () => {
    if (pyodide) return pyodide;

    setIsLoading(true);
    setError(null);
    try {
      // Load Pyodide runtime
      const py = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });

      // Pre-load essential packages for the blog
      await py.loadPackage(['numpy', 'pandas', 'matplotlib']);

      setPyodide(py);
      return py;
    } catch (err) {
      console.error('Failed to initialize Pyodide:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading Pyodide');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runCode = useCallback(async (code: string) => {
    const py = pyodide || await initPyodide();
    if (!py) {
      throw new Error('Pyodide not initialized');
    }

    let stdout = '';
    let stderr = '';

    // Redirect stdout and stderr
    py.setStdout({
      batched: (text) => {
        stdout += text + '\\n';
      },
    });
    py.setStderr({
      batched: (text) => {
        stderr += text + '\\n';
      },
    });

    try {
      const result = await py.runPythonAsync(code);
      return {
        stdout,
        stderr,
        result: result?.toString(),
      };
    } catch (err) {
      return {
        stdout,
        stderr: stderr + (err instanceof Error ? err.message : String(err)),
        result: null,
      };
    }
  }, [pyodide, initPyodide]);

  return {
    pyodide,
    isLoading,
    error,
    initPyodide,
    runCode,
  };
}
