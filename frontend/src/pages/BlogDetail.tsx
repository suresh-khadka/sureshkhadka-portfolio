import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { NotebookContainer } from '../components/notebook/NotebookContainer';
import { MarkdownCell } from '../components/notebook/MarkdownCell';
import { StaticCodeCell } from '../components/notebook/StaticCodeCell';

interface BlogCell {
  id: string;
  cell_type: 'markdown' | 'code';
  content: string;
  language?: string;
  order: number;
  output?: {
    text_output?: string;
    error_output?: string;
    image_output?: string;
  };
}

interface Blog {
  id: string;
  title: string;
  intro: string;
  cover_image_url: string;
  published_at: string;
  tags: { id: string; name: string; slug: string }[];
  sections: {
    id: string;
    title: string;
    slug: string;
    order: number;
    notebooks: {
      id: string;
      title: string;
      storage_path: string;
      order: number;
    }[];
    cells: BlogCell[];
  }[];
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await apiClient.get(`/blogs/${slug}/`);
        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    const calculateScrollDepth = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      return Math.round((winScroll / height) * 100);
    };

    const sendTrackingData = async () => {
      if (!blog) return;

      const secondsSpent = Math.floor((Date.now() - startTime) / 1000);
      const scrollDepth = calculateScrollDepth();
      const sessionId = localStorage.getItem('portfolio_session_id');

      try {
        await apiClient.post('/track/blog-read/', {
          session_id: sessionId,
          blog: blog.id,
          seconds_spent: secondsSpent,
          scroll_depth: scrollDepth,
        });
      } catch (error) {
        console.error("Error sending read event:", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendTrackingData();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      sendTrackingData();
    };
  }, [blog, startTime]);

  if (loading) return <div className="page-container text-center py-20 text-text-main">Loading...</div>;
  if (!blog) return <div className="page-container text-center py-20 text-text-main">Blog post not found.</div>;

  return (
    <div className="page-container">
      <Link to="/blogs" className="text-accent hover:underline mb-8 inline-block">&larr; Back to Blog</Link>

      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-text-main mb-4">{blog.title}</h1>
        <div className="flex justify-center gap-4 mb-8">
          <span className="text-text_muted">{new Date(blog.published_at).toLocaleDateString()}</span>
          <span className="text-accent">•</span>
          <div className="flex gap-2">
            {blog.tags.map(tag => (
              <span key={tag.id} className="text-sm text-accent">#{tag.name}</span>
            ))}
          </div>
        </div>
        <img
          src={blog.cover_image_url || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2214%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E'}
          alt={blog.title}
          className="w-full h-auto max-h-[500px] object-cover rounded-3xl shadow-2xl border border-slate-200 mb-8"
        />
        {blog.intro && (
          <p className="max-w-3xl mx-auto text-xl text-text_muted leading-relaxed italic">
            {blog.intro}
          </p>
        )}
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Table of Contents */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 p-4 bg-secondary rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-text-main uppercase mb-4 border-b border-slate-200 pb-2">Contents</h3>
            <nav className="space-y-2">
              {blog.sections.map(section => (
                <a
                  key={section.id}
                  href={`#${section.slug || section.id}`}
                  className="block text-sm text-text_muted hover:text-accent transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Notebook Content */}
        <main className="lg:col-span-3">
          {blog.sections && blog.sections.length > 0 ? (
            blog.sections.map(section => (
              <div id={section.slug || section.id} key={section.id} className="mb-16">
                <h2 className="text-3xl font-bold text-text-main mb-8 pb-2 border-b-2 border-slate-100">
                  {section.title}
                </h2>
                <div className="space-y-8">
                  {section.cells && section.cells.length > 0 && (
                    <div className="space-y-4">
                      {section.cells.map((cell, idx) => {
                        if (cell.cell_type === 'markdown') {
                          return <MarkdownCell key={cell.id || idx} content={cell.content} />;
                        }
                        if (cell.cell_type === 'code') {
                          return (
                            <StaticCodeCell
                              key={cell.id || idx}
                              code={cell.content}
                              language={cell.language}
                              outputs={cell.output ? [{
                                text: cell.output.text_output,
                                error: cell.output.error_output,
                                image: cell.output.image_output,
                              }] : []}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  {section.notebooks && section.notebooks.length > 0 && (
                    <div className="space-y-4">
                      {section.notebooks.map(notebook => (
                        <NotebookContainer key={notebook.id} notebook={notebook} />
                      ))}
                    </div>
                  )}

                  {!section.cells?.length && !section.notebooks?.length && (
                    <div className="p-8 text-center text-text_muted bg-secondary rounded-2xl border border-dashed border-slate-300">
                      No content available for this section.
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-text_muted bg-secondary rounded-2xl border border-dashed border-slate-300">
              No content available for this blog post.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
