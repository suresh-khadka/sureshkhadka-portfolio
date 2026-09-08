import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadPyodide, PyodideInterface } from 'pyodide';

interface PyodideContextType {
  pyodide: PyodideInterface | null;
  isLoading: boolean;
  error: string | null;
  initPyodide: () => Promise<PyodideInterface | null>;
  runCode: (code: string) => Promise<{
    stdout: string;
    stderr: string;
    result: string | null;
    plot: string | null;
  }>;
}

const PyodideContext = createContext<PyodideContextType | undefined>(undefined);

export const PyodideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initPyodide = useCallback(async () => {
    if (pyodide) return pyodide;

    setIsLoading(true);
    setError(null);
    try {
      const py = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });

      await py.loadPackage(['numpy', 'pandas', 'matplotlib']);
      setPyodide(py);
      return py;
    } catch (err) {
      console.error('Failed to initialize Pyodide:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error loading Pyodide';
      setError(errMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [pyodide]);

  const runCode = useCallback(async (code: string) => {
    const py = pyodide || await initPyodide();
    if (!py) {
      throw new Error('Pyodide not initialized');
    }

    let stdout = '';
    let stderr = '';

    py.setStdout({
      batched: (text) => {
        stdout += text + '\n';
      },
    });
    py.setStderr({
      batched: (text) => {
        stderr += text + '\n';
      },
    });

    try {
      const result = await py.runPythonAsync(code);

      let plot = null;
      const plotCode = "import matplotlib.pyplot as plt\n" +
                      "import io\n" +
                      "import base64\n" +
                      "if plt.get_fignums():\n" +
                      "    buf = io.BytesIO()\n" +
                      "    plt.savefig(buf, format='png')\n" +
                      "    buf.seek(0)\n" +
                      "    plot_data = base64.b64encode(buf.read()).decode('utf-8')\n" +
                      "    plt.close('all')\n" +
                      "    plot_data\n" +
                      "else:\n" +
                      "    None";

      plot = await py.runPythonAsync(plotCode);

      return {
        stdout,
        stderr,
        result: result?.toString(),
        plot: plot,
      };
    } catch (err) {
      return {
        stdout,
        stderr: stderr + (err instanceof Error ? err.message : String(err)),
        result: null,
        plot: null,
      };
    }
  }, [pyodide, initPyodide]);

  return (
    <PyodideContext.Provider value={{ pyodide, isLoading, error, initPyodide, runCode }}>
      {children}
    </PyodideContext.Provider>
  );
};

export const usePyodideContext = () => {
  const context = useContext(PyodideContext);
  if (context === undefined) {
    throw new Error('usePyodideContext must be used within a PyodideProvider');
  }
  return context;
};
