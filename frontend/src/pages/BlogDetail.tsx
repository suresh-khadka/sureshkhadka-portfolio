import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cover_image_url: string;
  published_at: string;
  tags: { id: string; name: string; slug: string }[];
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await apiClient.get(`/blogs/${slug}/`);
        setBlog(response.data);
      } catch (error) {
        console.erorr("Error fetching blog:", error);
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

  if (loading) return <div className="page-container text-center py-20 text-white">Loading...</div>;
  if (!blog) return <div className="page-container text-center py-20 text-white">Blog post not found.</div>;

  return (
    <div className="page-container">
      <Link to="/blogs" className="text-accent hover:underline mb-8 inline-block">&larr; Back to Blog</Link>

      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">{blog.title}</h1>
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
          className="w-full h-auto max-h-[500px] object-cover rounded-3xl shadow-2xl border border-slate-700"
        />
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="prose prose-invert max-w-none text-text_muted whitespace-pre-wrap text-lg leading-relaxed">
          {blog.content}
        </div>
      </div>
    </div>
  );
}
