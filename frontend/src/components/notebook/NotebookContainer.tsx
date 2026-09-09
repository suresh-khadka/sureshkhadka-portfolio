import React, { useEffect, useState } from 'react';
import { NotebookRenderer } from './NotebookRenderer';

interface NotebookMetadata {
  id: string;
  title: string;
  storage_path: string;
  order: number;
}

interface NotebookContainerProps {
  notebook: NotebookMetadata;
}

export const NotebookContainer: React.FC<NotebookContainerProps> = ({ notebook }) => {
  const [json, setJson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotebookJson = async () => {
      try {
        const envBaseUrl = import.meta.env.VITE_SUPABASE_PUBLIC_URL || '';

        if (!envBaseUrl) {
          throw new Error("VITE_SUPABASE_PUBLIC_URL is not defined in the environment");
        }

        console.log("DEBUG: Runtime envBaseUrl:", envBaseUrl);
        console.log("DEBUG: Constructing URL with bucket: portfolio-assets");
        console.log("DEBUG: Constructing URL with storage_path:", notebook.storage_path);

        const storagePathSegment = '/storage/v1/object/public/portfolio-assets';
        const baseUrl = envBaseUrl.includes(storagePathSegment)
          ? envBaseUrl
          : `${envBaseUrl.replace(/\/$/, '')}${storagePathSegment}`;

        const notebookUrl = `${baseUrl.replace(/\/$/, '')}/${notebook.storage_path}`;
        console.log("DEBUG: Final notebookUrl:", notebookUrl);

        const response = await fetch(notebookUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Notebook fetch failed", {
            url: notebookUrl,
            status: response.status,
            statusText: response.statusText,
            response: errorText,
          });
          throw new Error(`Failed to fetch notebook: ${response.status} ${errorText}`);
        }

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Notebook JSON parse failed", {
            url: notebookUrl,
            preview: text.slice(0, 200),
          });
          throw new Error(`Downloaded notebook is not valid JSON. Preview: ${text.slice(0, 100)}...`);
        }

        // Validate Jupyter Notebook structure
        if (!data || !Array.isArray(data.cells)) {
          throw new Error("Invalid notebook structure: 'cells' must be an array.");
        }

        // Deep validation of cells
        for (let i = 0; i < data.cells.length; i++) {
          const cell = data.cells[i];
          if (!cell || typeof cell !== 'object' || !cell.cell_type) {
            throw new Error(`Invalid notebook structure: Cell at index ${i} is missing 'cell_type'.`);
          }
        }

        setJson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNotebookJson();
  }, [notebook.storage_path]);

  if (loading) return <div className="py-4 text-sm text-text_muted animate-pulse">Loading notebook...</div>;
  if (error) return <div className="py-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">Error: {error}</div>;
  if (!json) return null;

  return (
    <div className="mb-12">
      <NotebookRenderer notebookJson={json} />
    </div>
  );
};
