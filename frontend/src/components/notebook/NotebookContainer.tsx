import React, { useEffect, useState } from 'react';
import { NotebookRenderer } from './NotebookRenderer';
import { useInView } from 'react-intersection-observer';

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
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });
  const [json, setJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inView) return;

    const fetchNotebookJson = async () => {
      setLoading(true);
      try {
        const envBaseUrl = import.meta.env.VITE_SUPABASE_PUBLIC_URL || '';

        if (!envBaseUrl) {
          throw new Error("VITE_SUPABASE_PUBLIC_URL is not defined in the environment");
        }

        const storagePathSegment = '/storage/v1/object/public/portfolio-assets';
        const baseUrl = envBaseUrl.includes(storagePathSegment)
          ? envBaseUrl
          : `${envBaseUrl.replace(/\/$/, '')}${storagePathSegment}`;

        const notebookUrl = `${baseUrl.replace(/\/$/, '')}/${notebook.storage_path}`;

        const response = await fetch(notebookUrl);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch notebook: ${response.status} ${errorText}`);
        }

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(`Downloaded notebook is not valid JSON.`);
        }

        if (!data || !Array.isArray(data.cells)) {
          throw new Error("Invalid notebook structure: 'cells' must be an array.");
        }

        setJson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNotebookJson();
  }, [notebook.storage_path, inView]);

  if (!inView && !json) return <div ref={ref} className="py-8 text-center text-text_muted italic">Scroll to load notebook...</div>;
  if (loading && !json) return <div ref={ref} className="py-4 text-sm text-text_muted animate-pulse">Loading notebook...</div>;
  if (error) return <div ref={ref} className="py-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">Error: {error}</div>;
  if (!json) return <div ref={ref} />;

  return (
    <div ref={ref} className="mb-12">
      <NotebookRenderer notebookJson={json} storagePath={notebook.storage_path} />
    </div>
  );
};
