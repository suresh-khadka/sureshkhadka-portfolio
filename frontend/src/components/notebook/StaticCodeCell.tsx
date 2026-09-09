import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DOMPurify from 'dompurify';

interface StaticCodeCellProps {
  code: string;
  outputs: any[];
  language?: string;
}

export const StaticCodeCell: React.FC<StaticCodeCellProps> = ({ code, outputs, language = 'python' }) => {
  return (
    <div className="mb-6 p-4 rounded-xl bg-secondary border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono text-text_muted uppercase">{language}</span>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-300 mb-3">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1rem' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {outputs.map((output, idx) => (
        <React.Fragment key={idx}>
          {output.text && (
            <div className="p-3 rounded-lg bg-black text-green-400 font-mono text-sm whitespace-pre-wrap border border-slate-700 mb-3">
              {output.text}
            </div>
          )}
          {output.html && (
            <div
              className="p-3 rounded-lg bg-white text-text-main font-sans text-sm overflow-auto border border-slate-300 mb-3"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output.html) }}
            />
          )}
          {output.error && (
            <div className="p-3 rounded-lg bg-black text-red-400 font-mono text-sm whitespace-pre-wrap border border-slate-700 mb-3">
              {output.error}
            </div>
          )}
          {output.image && (
            <div className="mb-3 flex justify-center rounded-lg overflow-hidden border border-slate-300 bg-white">
              <img src={output.image} alt="Plot output" className="max-w-full h-auto" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
