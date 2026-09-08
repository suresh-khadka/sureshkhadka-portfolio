import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Button } from '../Button';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string;
  is_draft: boolean;
  tags: { id: string; name: string; slug: string }[];
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export const BlogManager = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    cover_image_url: '',
    is_draft: true,
    selectedTags: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  const fetchContent = async () => {
    try {
      const [blogsRes, tagsRes] = await Promise.all([
        apiClient.get('/blogs/'),
        apiClient.get('/tags/'),
      ]);
      setBlogs(blogsRes.data);
      setTags(tagsRes.data);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({ ...prev, cover_image_url: response.data.url }));
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tags are handled by DRF ManyToMany usually via a list of IDs
    const data = {
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      cover_image_url: formData.cover_image_url,
      is_draft: formData.is_draft,
      tags: formData.selectedTags, // List of tag UUIDs
    };

    try {
      if (editingBlog) {
        await apiClient.patch(`/blogs/${editingBlog.slug}/`, data);
      } else {
        await apiClient.post('/blogs/', data);
      }
      setFormData({ title: '', slug: '', content: '', cover_image_url: '', is_draft: true, selectedTags: [] });
      setEditingBlog(null);
      fetchContent();
    } catch (error) {
      alert('Save failed');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiClient.delete(`/blogs/${slug}/`);
      fetchContent();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const startEdit = (b: BlogPost) => {
    setEditingBlog(b);
    setFormData({
      title: b.title,
      slug: b.slug,
      content: b.content,
      cover_image_url: b.cover_image_url || '',
      is_draft: b.is_draft,
      selectedTags: b.tags.map(t => t.id),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-secondary p-6 rounded-2xl border border-slate-200 h-fit">
        <h3 className="text-xl font-bold text-text-main mb-6">
          {editingBlog ? 'Edit Blog' : 'New Blog Post'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Title</label>
            <input
              className="w-full bg-primary border border-slate-200 rounded-lg px-3 py-2 text-text-main"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Slug</label>
            <input
              className="w-full bg-primary border border-slate-200 rounded-lg px-3 py-2 text-text-main"
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Content (Markdown)</label>
            <textarea
              rows={8}
              className="w-full bg-primary border border-slate-200 rounded-lg px-3 py-2 text-text-main"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-draft"
              checked={formData.is_draft}
              onChange={e => setFormData({...formData, is_draft: e.target.checked})}
            />
            <label htmlFor="is-draft" className="text-sm text-text-main">Keep as draft</label>
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Cover Image</label>
            <div className="flex gap-2">
              <input type="file" id="blog-thumb" className="hidden" onChange={handleUpload} />
              <label htmlFor="blog-thumb" className="cursor-pointer bg-slate-700 text-text-main px-3 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors">
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
              <input
                className="flex-1 bg-primary border border-slate-200 rounded-lg px-3 py-2 text-xs text-text_muted"
                value={formData.cover_image_url}
                readOnly
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-primary rounded-lg border border-slate-200">
              {tags.map(tag => (
                <label key={tag.id} className="flex items-center gap-1 text-xs text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.selectedTags.includes(tag.id)}
                    onChange={e => {
                      const next = e.target.checked
                        ? [...formData.selectedTags, tag.id]
                        : formData.selectedTags.filter(id => id !== tag.id);
                      setFormData({...formData, selectedTags: next});
                    }}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              {editingBlog ? 'Update Blog' : 'Publish Blog'}
            </Button>
            {editingBlog && (
              <Button
                variant="secondary"
                onClick={() => { setEditingBlog(null); setFormData({ title: '', slug: '', content: '', cover_image_url: '', is_draft: true, selectedTags: [] }); }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {blogs.map(b => (
          <div key={b.id} className="bg-secondary p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={b.cover_image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div className="text-text-main font-bold">{b.title} {b.is_draft && <span className="text-xs text-orange-400 font-normal ml-2">(Draft)</span>}</div>
                <div className="text-xs text-text_muted">{b.slug}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => startEdit(b)}>Edit</Button>
              <Button variant="outline" className="px-3 py-1 text-xs text-red-400 border-red-400 hover:bg-red-400 hover:text-text-main" onClick={() => handleDelete(b.slug)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
