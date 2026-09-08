import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { NotebookSection } from '../components/notebook/NotebookSection';

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
    order: number;
    cells: {
      id: string;
      cell_type: 'markdown' | 'code';
      content: string;
      language: string;
      order: number;
      output?: {
        text_output: string | null;
        error_output: string | null;
        image_output: string | null;
      };
    }[];
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
          src={blog.cover_image_url || 'https://via.placeholder.com/1200x600'}
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
                  href={`#${section.id}`}
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
              <div id={section.id} key={section.id}>
                <NotebookSection
                  title={section.title}
                  cells={section.cells || []}
                />
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
