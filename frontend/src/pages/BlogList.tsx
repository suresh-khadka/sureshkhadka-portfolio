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
                  src={blog.cover_image_url || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2214%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E'} 
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
