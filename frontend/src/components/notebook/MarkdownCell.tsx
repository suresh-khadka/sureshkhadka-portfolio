import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownCellProps {
  content: string;
  isAdmin?: boolean;
  attachments?: Record<string, { data: string; mime_type: string }>;
  storagePath?: string;
}

export const MarkdownCell: React.FC<MarkdownCellProps> = ({ content, isAdmin, attachments, storagePath }) => {
  const sanitizeEmphasis = (text: string) => {
    return text.replace(/(```[\s\S]*?```|`[^`]*?`)|(\*\*|\*)\s+([^*`\n]+?)\s+(\*\*|\*)/g, (match, code, open, content, close) => {
      if (code) return code;
      if (open !== close) return match;
      return `${open}${content.trim()}${close}`;
    });
  };

  const sanitizedContent = sanitizeEmphasis(content);

  const ImageComponent = ({ node, ...props }: any) => {
    const [error, setError] = useState(false);
    const alt = props.alt || '';
    let src = props.src || '';

    const debugLog = (reason: string) => {
      if (import.meta.env.DEV) {
        console.warn(`[MarkdownCell Image Debug] src: "${src}", alt: "${alt}", attachments: ${JSON.stringify(Object.keys(attachments || {}))}, reason: ${reason}`);
      }
    };

    // Case (a): attachment: images.webp
    if (src.startsWith('attachment:')) {
      const rawFileName = src.replace('attachment:', '');
      const fileName = decodeURIComponent(rawFileName);

      let attachment = attachments?.[fileName];
      if (!attachment) {
        // Case-insensitive match
        const keys = Object.keys(attachments || {});
        const caseInsensitiveKey = keys.find(k => k.toLowerCase() === fileName.toLowerCase());
        if (caseInsensitiveKey) {
          attachment = attachments?.[caseInsensitiveKey];
        }
      }

      if (attachment) {
        const mimeTypes = Object.keys(attachment).filter(k => k !== 'data');
        const mime = mimeTypes[0] || attachment.mime_type;

        // In Jupyter, data can be in .data or directly under the MIME type key
        const data = attachment.data || (mime ? attachment[mime] : null);

        if (mime && data) {
          const cleanData = typeof data === 'string' ? data.replace(/\s+/g, '') : String(data).replace(/\s+/g, '');
          src = `data:${mime};base64,${cleanData}`;
        } else {
          debugLog(`No mime type or data found. Keys: ${JSON.stringify(Object.keys(attachment))}`);
          setError(true);
        }
      } else {
        debugLog('Attachment key missing');
        setError(true);
      }
    }
    // Case (b): Relative path
    else if (!src.startsWith('http') && !src.startsWith('data:')) {
      const envBaseUrl = import.meta.env.VITE_SUPABASE_PUBLIC_URL || '';
      const storagePathSegment = '/storage/v1/object/public/portfolio-assets';
      const baseUrl = envBaseUrl.includes(storagePathSegment)
        ? envBaseUrl
        : `${envBaseUrl.replace(/\/$/, '')}${storagePathSegment}`;

      // Use the directory of the notebook for relative paths
      const notebookDir = storagePath ? storagePath.substring(0, storagePath.lastIndexOf('/')) : '';
      const fileName = encodeURIComponent(src);
      src = `${baseUrl.replace(/\/$/, '')}/${notebookDir}/${fileName}`;
    }

    if (error) {
      return (
        <div
          className="border border-slate-300 bg-slate-50 p-2 text-xs text-slate-500 rounded-md inline-block my-2 max-w-full"
          title={alt}
        >
          Image missing: {alt}
        </div>
      );
    }

    return (
      <img
        {...props}
        src={src}
        loading="lazy"
        style={{ maxWidth: '100%', height: 'auto' }}
        onError={() => {
          debugLog('onError fired');
          setError(true);
        }}
      />
    );
  };

  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ImageComponent
        }}
        urlTransform={(url) => {
          // Pass through attachment: and data:image URLs unchanged
          if (url.startsWith('attachment:') || url.startsWith('data:image/')) {
            return url;
          }
          return url; // react-markdown's default behavior handles the rest
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
      {isAdmin && (
        <div className="mt-2 text-xs text-text_muted italic text-center">
          Markdown Cell
        </div>
      )}
    </article>
  );

};
