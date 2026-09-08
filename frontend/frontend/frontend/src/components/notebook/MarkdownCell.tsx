import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownCellProps {
  content: string;
  isAdmin?: boolean;
}

export const MarkdownCell: React.FC<MarkdownCellProps> = ({ content, isAdmin }) => {
  return (
    <div className="mb-6 p-4 rounded-xl bg-secondary border border-slate-200 shadow-sm">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        className="prose prose-slate max-w-none text-text-main"
      >
        {content}
      </ReactMarkdown>
      {isAdmin && (
        <div className="mt-2 text-xs text-text_muted italic">
          Markdown Cell
        </div>
      )}
    </div>
  );
};
