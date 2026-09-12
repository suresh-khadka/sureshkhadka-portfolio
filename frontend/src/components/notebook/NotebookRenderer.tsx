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
  const normalizeOutputs = (outputs: any[]) => {
    if (!outputs) return [];

    const stripAnsi = (str: string) => str.replace(/\[[0-9;]*m/g, '');

    return outputs.map(output => {
      const flatOutput: any = {};

      switch (output.output_type) {
        case 'stream':
          if (output.text) {
            flatOutput.text_output = Array.isArray(output.text) ? output.text.join('') : output.text;
          }
          break;
        case 'execute_result':
        case 'display_data':
          if (output.data) {
            if (output.data['image/png']) {
              const img = output.data['image/png'];
              flatOutput.image_output = img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
            }
            if (output.data['text/plain']) {
              flatOutput.text_output = Array.isArray(output.data['text/plain'])
                ? output.data['text/plain'].join('')
                : output.data['text/plain'];
            }
          }
          break;
        case 'error':
          const ename = output.ename || 'Error';
          const evalue = output.evalue || '';
          const tracebackRaw = Array.isArray(output.traceback) ? output.traceback.join('\n') : (output.traceback || '');
          const traceback = stripAnsi(tracebackRaw);
          flatOutput.error_output = `${ename}: ${evalue}\n${traceback}`;
          break;
      }
      return flatOutput;
    });
  };

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
              outputs={normalizeOutputs(cell.outputs || [])}
            />
          );
        }

        return null;
      })}
    </div>
  );
};
