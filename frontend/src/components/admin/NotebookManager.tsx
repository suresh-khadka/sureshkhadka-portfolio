import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';
import { Button } from '../Button';

interface Notebook {
  id: string;
  title: string;
  storage_path: string;
  order: number;
}

interface Section {
  id: string;
  title: string;
  slug: string;
  order: number;
  notebooks: Notebook[];
  isNew?: boolean;
}

interface NotebookManagerProps {
  blogId: string;
  sections: Section[];
  onUpdateSections: (sections: Section[]) => void;
}

export const NotebookManager: React.FC<NotebookManagerProps> = ({ blogId, sections, onUpdateSections }) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  const activeSection = sections.find(s => s.id === activeSectionId);

  const isUploadDisabled = !blogId || activeSection?.isNew;

  const handleUploadClick = () => {
    if (isUploadDisabled) return;
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeSectionId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post(`/blog-sections/${activeSectionId}/notebooks/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh notebooks for this section
      const notebooksRes = await apiClient.get(`/blog-sections/${activeSectionId}/notebooks/`);

      const updatedSections = sections.map(s => {
        if (s.id === activeSectionId) {
          return { ...s, notebooks: notebooksRes.data };
        }
        return s;
      });

      onUpdateSections(updatedSections);
    } catch (error) {
      alert('Upload failed: ' + (error as any).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    if (!confirm('Are you sure you want to delete this notebook?')) return;
    try {
      await apiClient.delete(`/blog-sections/${activeSectionId}/notebooks/${notebookId}/`);
      const notebooksRes = await apiClient.get(`/blog-sections/${activeSectionId}/notebooks/`);
      const updatedSections = sections.map(s => {
        if (s.id === activeSectionId) {
          return { ...s, notebooks: notebooksRes.data };
        }
        return s;
      });
      onUpdateSections(updatedSections);
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleUpdateNotebookTitle = async (notebookId: string, title: string) => {
    try {
      await apiClient.patch(`/blog-sections/${activeSectionId}/notebooks/${notebookId}/`, { title });
      const notebooksRes = await apiClient.get(`/blog-sections/${activeSectionId}/notebooks/`);
      const updatedSections = sections.map(s => {
        if (s.id === activeSectionId) {
          return { ...s, notebooks: notebooksRes.data };
        }
        return s;
      });
      onUpdateSections(updatedSections);
    } catch (error) {
      alert('Update failed');
    }
  };

  const handleReorderNotebooks = async (orderedIds: string[]) => {
    try {
      await apiClient.patch(`/blog-sections/${activeSectionId}/notebooks/reorder/`, { order: orderedIds });
      const notebooksRes = await apiClient.get(`/blog-sections/${activeSectionId}/notebooks/`);
      const updatedSections = sections.map(s => {
        if (s.id === activeSectionId) {
          return { ...s, notebooks: notebooksRes.data };
        }
        return s;
      });
      onUpdateSections(updatedSections);
    } catch (error) {
      alert('Reorder failed');
    }
  };

  if (!activeSection) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-text-main">
          Notebooks in "{activeSection.title}"
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            className="text-sm"
            disabled={isUploadDisabled || uploading}
            onClick={handleUploadClick}
          >
            {uploading ? 'Uploading...' : '+ Upload .ipynb'}
          </Button>
          {isUploadDisabled && (
            <span className="text-[10px] text-text_muted italic max-w-[150px] leading-tight">
              {!blogId ? 'Save blog first' : 'Save section first'}
            </span>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".ipynb"
            onChange={handleUpload}
          />
        </div>
      </div>

      <div className="space-y-3">
        {activeSection.notebooks.length > 0 ? (
          activeSection.notebooks.map((notebook, idx) => (
            <div key={notebook.id} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl group">
              <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
              <input
                className="flex-1 bg-transparent border-b border-transparent focus:border-primary outline-none text-sm font-medium"
                value={notebook.title}
                onChange={(e) => handleUpdateNotebookTitle(notebook.id, e.target.value)}
              />
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDeleteNotebook(notebook.id)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-text_muted bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            No notebooks uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
};
