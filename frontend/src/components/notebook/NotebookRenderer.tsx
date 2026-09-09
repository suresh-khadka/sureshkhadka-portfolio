import React from 'react';
import { MarkdownCell } from './MarkdownCell';
import { StaticCodeCell } from './StaticCodeCell';

interface NotebookJson {
  cells: Array<{
    cell_type: 'markdown' | 'code';
    source: string | string[];
    outputs?: Array<{
      text?: string;
      error?: string;
      image?: string;
    }>;
    execution_count?: number;
    metadata?: any;
  }>;
}

interface NotebookRendererProps {
  notebookJson: NotebookJson;
}

export const NotebookRenderer: React.FC<NotebookRendererProps> = ({ notebookJson }) => {
  return (
    <div className="space-y-4">
      {notebookJson.cells.map((cell, idx) => {
        const content = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

        if (cell.cell_type === 'markdown') {
          return <MarkdownCell key={idx} content={content} />;
        }

        if (cell.cell_type === 'code') {
          return (
            <StaticCodeCell
              key={idx}
              code={content}
              outputs={cell.outputs || []}
            />
          );
        }

        return null;
      })}
    </div>
  );
};
