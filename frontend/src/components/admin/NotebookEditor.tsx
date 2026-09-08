import React from 'react';
import apiClient from '../../api/client';
import { Button } from '../Button';
import { CodeEditorCell } from '../notebook/CodeEditorCell';

interface Blog {
  id: string;
  title: string;
  slug: string;
  intro: string;
  cover_image_url: string;
  is_draft: boolean;
  tags: { id: string; name: string; slug: string }[];
  sections: {
    id: string;
    title: string;
    order: number;
    cells: {
      id: string;
      cell_type: 'markdown' | 'code';
      content: string;
      language: string;
      order: number;
    }[];
  }[];
}

export const NotebookEditor: React.FC<{
  blogId: string;
  sections: Blog['sections'];
  onUpdateSections: (sections: Blog['sections']) => void;
  onSave: (sections: Blog['sections']) => Promise<void>;
}> = ({ blogId, sections, onUpdateSections, onSave }) => {
  // State is now managed by BlogManager (Parent)


  const addSection = () => {
    const newSection = {
      id: crypto.randomUUID(),
      title: 'New Section',
      order: sections.length,
      cells: [],
    };
    onUpdateSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    onUpdateSections(sections.filter(s => s.id !== sectionId));
  };

  const reorderCells = (cells: any[]) => {
    return cells.map((cell, index) => ({ ...cell, order: index }));
  };

  const insertCell = (sectionId: string, index: number, type: 'markdown' | 'code') => {
    onUpdateSections(sections.map(s => {
      if (s.id === sectionId) {
        const newCell = {
          id: crypto.randomUUID(),
          cell_type: type,
          content: '',
          language: 'python',
          order: index,
        };
        const newCells = [...s.cells];
        newCells.splice(index, 0, newCell);
        return { ...s, cells: reorderCells(newCells) };
      }
      return s;
    }));
  };

  const duplicateCell = (sectionId: string, cellId: string) => {
    onUpdateSections(sections.map(s => {
      if (s.id === sectionId) {
        const index = s.cells.findIndex(c => c.id === cellId);
        if (index === -1) return s;

        const originalCell = s.cells[index];
        const duplicatedCell = {
          ...originalCell,
          id: crypto.randomUUID(),
          order: index + 1,
        };

        const newCells = [...s.cells];
        newCells.splice(index + 1, 0, duplicatedCell);
        return { ...s, cells: reorderCells(newCells) };
      }
      return s;
    }));
  };

  const addCell = (sectionId: string, type: 'markdown' | 'code') => {
    const section = sections.find(s => s.id === sectionId);
    const index = section ? section.cells.length : 0;
    insertCell(sectionId, index, type);
  };

  const moveCell = (sectionId: string, cellId: string, direction: 'up' | 'down') => {
    onUpdateSections(sections.map(s => {
      if (s.id === sectionId) {
        const index = s.cells.findIndex(c => c.id === cellId);
        if (index === -1) return s;

        const newCells = [...s.cells];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newCells.length) {
          [newCells[index], newCells[targetIndex]] = [newCells[targetIndex], newCells[index]];
        }
        return { ...s, cells: reorderCells(newCells) };
      }
      return s;
    }));
  };

  const removeCell = (sectionId: string, cellId: string) => {
    onUpdateSections(sections.map(s => {
      if (s.id === sectionId) {
        const newCells = s.cells.filter(c => c.id !== cellId);
        return { ...s, cells: reorderCells(newCells) };
      }
      return s;
    }));
  };

  const updateCell = (sectionId: string, cellId: string, updates: any) => {
    onUpdateSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          cells: s.cells.map(c => (c.id === cellId ? { ...c, ...updates } : c)),
        };
      }
      return s;
    }));
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    onUpdateSections(sections.map(s => (s.id === sectionId ? { ...s, title } : s)));
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
                {/* Action Toolbar */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 border-r border-slate-100">
                  <button
                    onClick={() => moveCell(section.id, cell.id, 'up')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    title="Move Up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => insertCell(section.id, cIdx, 'markdown')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 text-[10px] font-bold"
                    title="Insert Markdown Above"
                  >
                    +M
                  </button>
                  <button
                    onClick={() => insertCell(section.id, cIdx, 'code')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 text-[10px] font-bold"
                    title="Insert Code Above"
                  >
                    +C
                  </button>
                  <div className="my-1 border-t border-slate-200 w-full" />
                  <button
                    onClick={() => duplicateCell(section.id, cell.id)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 text-[10px] font-bold"
                    title="Duplicate Cell"
                  >
                    DUP
                  </button>
                  <button
                    onClick={() => insertCell(section.id, cIdx + 1, 'markdown')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 text-[10px] font-bold"
                    title="Insert Markdown Below"
                  >
                    +M
                  </button>
                  <button
                    onClick={() => insertCell(section.id, cIdx + 1, 'code')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 text-[10px] font-bold"
                    title="Insert Code Below"
                  >
                    +C
                  </button>
                  <button
                    onClick={() => moveCell(section.id, cell.id, 'down')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    title="Move Down"
                  >
                    ↓
                  </button>
                </div>

                <div className="pl-12">
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
                    <CodeEditorCell
                      code={cell.content}
                      language={cell.language}
                      onChange={(newCode) => updateCell(section.id, cell.id, { content: newCode })}
                      onUpdateLanguage={(newLang) => updateCell(section.id, cell.id, { language: newLang })}
                      onRunSuccess={(output) => updateCell(section.id, cell.id, { output })}
                    />
                  )}
                </div>
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
