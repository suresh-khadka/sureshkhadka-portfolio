import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string;
  published_at: string;
  tags: { id: string; name: string; slug: string }[];
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const tag = activeTag || "";
        const response = await apiClient.get(`/blogs/?tag=${tag}`);
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [activeTag]);

  return (
    <div className="page-container">
      <header className="text-center py-12">
        <h1 className="text-5xl font-bold text-text-main mb-4">Insights & Learning</h1>
        <p className="text-text_muted max-w-2xl mx-auto">
          Sharing my thoughts on Machine Learning, AI architecture, and software engineering.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-secondary h-64 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map(blog => (
            <div key={blog.id} className="group bg-secondary rounded-2xl overflow-hidden border border-slate-200 hover:border-accent transition-all duration-300 shadow-lg">
              <div className="h-48 overflow-hidden">
                <img 
                  src={blog.cover_image_url || 'https://via.placeholder.com/400x200'} 
                  alt={blog.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  {blog.tags.map(tag => (
                    <Link 
                      key={tag.id} 
                      to={`/blogs?tag=${tag.slug}`} 
                      className="text-xs text-accent hover:underline"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-text-main mb-2 group-hover:text-accent transition-colors">{blog.title}</h3>
                <p className="text-text_muted text-sm mb-6 line-clamp-2">
                  {blog.content ? blog.content.substring(0, 150) : 'No content available'}...
                </p>
                <Link 
                  to={`/blogs/${blog.slug}`} 
                  className="text-text-main font-semibold flex items-center gap-2 hover:text-accent transition-colors"
                >
                  Read Article <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
