import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DOMPurify from 'dompurify';

interface StaticCodeCellProps {
  code: string;
  outputs: any[];
  language?: string;
  index?: number;
}

export const StaticCodeCell: React.FC<StaticCodeCellProps> = ({ code, outputs, language = 'python', index = 0 }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="notebook-cell">
      <div className="notebook-code-block">
        <div className="notebook-cell-gutter">
          In [{index + 1}]:
        </div>
        <div className="code-container">
          <div className="absolute right-2 top-2 z-10">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-xs"
              title="Copy code"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1rem',
                backgroundColor: '#1e1e1e',
                fontSize: '13px',
                fontFamily: 'JetBrains Mono, Fira Code, monospace'
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>

      {outputs.map((output, idx) => (
        <div key={idx} className="notebook-output-block">
          <div className="notebook-cell-gutter">
            {idx === 0 ? `Out [${index + 1}]:` : ''}
          </div>
          <div className="output-container">
            {output.text_output && (
              <div className="notebook-output-content">
                {output.text_output}
              </div>
            )}
            {output.html && (
              <div
                className="p-3 rounded-lg bg-white text-text-main font-sans text-sm overflow-auto border border-slate-300 mb-3"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output.html) }}
              />
            )}
            {output.error_output && (
              <div className="notebook-output-error">
                {output.error_output}
              </div>
            )}
            {output.image_output && (
              <div className="mb-3 flex justify-center rounded-lg overflow-hidden border border-slate-700 bg-white">
                <img src={output.image_output} alt="Plot output" className="max-w-full h-auto" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

