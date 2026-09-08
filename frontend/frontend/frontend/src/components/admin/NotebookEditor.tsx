import React, { useState } from 'react';
import { NotebookSection } from '../notebook/NotebookSection';
import apiClient from '../../api/client';

interface Cell {
  id: string;
  cell_type: 'markdown' | 'code';
  content: string;
  language: string;
  order: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  cells: Cell[];
}

interface NotebookEditorProps {
  blogId: string;
  initialSections: Section[];
  onSave: (sections: Section[]) => Promise<void>;
}

export const NotebookEditor: React.FC<NotebookEditorProps> = ({ blogId, initialSections, onSave }) => {
  const [sections, setSections] = useState<Section[]>(initialSections);

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: 'New Section',
      order: sections.length,
      cells: [],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const addCell = (sectionId: string, type: 'markdown' | 'code') => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          cells: [
            ...s.cells,
            {
              id: crypto.randomUUID(),
              cell_type: type,
              content: '',
              language: 'python',
              order: s.cells.length,
            },
          ],
        };
      }
      return s;
    }));
  };

  const updateCell = (sectionId: string, cellId: string, updates: Partial<Cell>) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          cells: s.cells.map(c => (c.id === cellId ? { ...c, ...updates } : c)),
        };
      }
      return s;
    }));
  };

  const removeCell = (sectionId: string, cellId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, cells: s.cells.filter(c => c.id !== cellId) };
      }
      return s;
    }));
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map(s => (s.id === sectionId ? { ...s, title } : s)));
  };

  return (
    <div className="space-y-8 p-6 bg-white rounded-2xl border border-slate-200">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-text-main">Blog Structure</h3>
        <button
          onClick={addSection}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
        >
          + Add Section
        </button>
      </div>

      {sections.map((section, sIdx) => (
        <div key={section.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex justify-between items-center gap-4">
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSectionTitle(section.id, e.target.value)}
              className="text-lg font-bold bg-transparent border-b border-slate-300 focus:border-primary outline-none px-1"
            />
            <button
              onClick={() => removeSection(section.id)}
              className="text-red-500 hover:text-red-700 text-xs font-medium"
            >
              Remove Section
            </button>
          </div>

          <div className="space-y-4 pl-4 border-l-2 border-slate-200">
            {section.cells.map((cell, cIdx) => (
              <div key={cell.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 relative group">
                <div className="flex justify-between items-center">
                  <select
                    value={cell.cell_type}
                    onChange={(e) => updateCell(section.id, cell.id, { cell_type: e.target.value as 'markdown' | 'code' })}
                    className="text-xs bg-slate-100 border border-slate-300 rounded px-1"
                  >
                    <option value="markdown">Markdown</option>
                    <option value="code">Code</option>
                  </select>
                  <button
                    onClick={() => removeCell(section.id, cell.id)}
                    className="text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete Cell
                  </button>
                </div>

                {cell.cell_type === 'markdown' ? (
                  <textarea
                    value={cell.content}
                    onChange={(e) => updateCell(section.id, cell.id, { content: e.target.value })}
                    className="w-full p-2 text-sm border border-slate-200 rounded-md font-mono"
                    rows={3}
                    placeholder="Enter markdown content..."
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={cell.language}
                      onChange={(e) => updateCell(section.id, cell.id, { language: e.target.value })}
                      className="text-xs bg-slate-100 border border-slate-300 rounded px-1 w-24"
                    />
                    <textarea
                      value={cell.content}
                      onChange={(e) => updateCell(section.id, cell.id, { content: e.target.value })}
                      className="w-full p-2 text-sm border border-slate-200 rounded-md font-mono bg-slate-900 text-white"
                      rows={5}
                      placeholder="Enter python code..."
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => addCell(section.id, 'markdown')}
                className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
              >
                + Text Cell
              </button>
              <button
                onClick={() => addCell(section.id, 'code')}
                className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
              >
                + Code Cell
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => onSave(sections)}
        className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg"
      >
        Save Blog Structure
      </button>
    </div>
  );
};
