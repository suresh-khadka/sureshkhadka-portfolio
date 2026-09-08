import React from 'react';
import { MarkdownCell } from './MarkdownCell';
import { CodeCell } from './CodeCell';

interface SectionCell {
  id: string;
  cell_type: 'markdown' | 'code';
  content: string;
  language?: string;
  output?: {
    text_output: string | null;
    error_output: string | null;
    image_output: string | null;
  };
}

interface NotebookSectionProps {
  title: string;
  cells: SectionCell[];
  isAdmin?: boolean;
}

export const NotebookSection: React.FC<NotebookSectionProps> = ({ title, cells, isAdmin }) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-text-main mb-6 border-b border-slate-200 pb-2">
        {title}
      </h2>
      <div className="space-y-6">
        {cells.map(cell => {
          if (cell.cell_type === 'markdown') {
            return <MarkdownCell key={cell.id} content={cell.content} isAdmin={isAdmin} />;
          } else {
            const initialOutput = cell.output?.text_output || cell.output?.error_output || '';
            return (
              <CodeCell
                key={cell.id}
                code={cell.content}
                initialOutput={initialOutput}
                language={cell.language}
                isAdmin={isAdmin}
              />
            );
          }
        })}
      </div>
    </div>
  );
};
