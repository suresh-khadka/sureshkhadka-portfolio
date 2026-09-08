import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Button } from '../Button';
import { NotebookEditor } from './NotebookEditor';

interface Blog {
  id: string;
  title: string;
  slug: string;
  intro: string;
  cover_image_url: string;
  is_draft: boolean;
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
    }[];
  }[];
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export const BlogManager = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    intro: '',
    cover_image_url: '',
    is_draft: false,
    selectedTags: [] as string[],
  });
  const [notebookSections, setNotebookSections] = useState<Blog['sections']>([]);
  const [uploading, setUploading] = useState(false);
  const [isSavingBlog, setIsSavingBlog] = useState(false);

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

  const handleUpdateSections = (sections: Blog['sections']) => {
    setNotebookSections(sections);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBlog(true);

    const data = {
      title: formData.title,
      slug: formData.slug,
      intro: formData.intro,
      cover_image_url: formData.cover_image_url,
      is_draft: formData.is_draft,
      tags: formData.selectedTags,
    };

    try {
      let currentBlogId = editingBlog?.id;
      let savedBlog = null;

      if (editingBlog) {
        const res = await apiClient.patch(`/blogs/${editingBlog.slug}/`, data);
        savedBlog = res.data;
      } else {
        const res = await apiClient.post('/blogs/', data);
        savedBlog = res.data;
        currentBlogId = savedBlog.id;
      }

      // After saving the main blog metadata, sync the notebook structure if present
      if (currentBlogId && notebookSections.length > 0) {
        await apiClient.post(`/blogs/${currentBlogId}/sync/`, {
          sections: notebookSections,
        });
      }

      // Transition into "Editing" mode for the saved blog
      setEditingBlog(savedBlog);
      setIsCreating(false);

      // Keep form data synced with the saved object
      setFormData({
        title: savedBlog.title,
        slug: savedBlog.slug,
        intro: savedBlog.intro || '',
        cover_image_url: savedBlog.cover_image_url || '',
        is_draft: savedBlog.is_draft,
        selectedTags: savedBlog.tags ? savedBlog.tags.map((t: any) => t.id) : [],
      });

      fetchContent();
      alert('Blog saved successfully! You can now add sections to your notebook.');
    } catch (error) {
      alert('Save failed');
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleSaveNotebookOnly = async (sections: Blog['sections']) => {
    if (!editingBlog) {
      alert('Please save the basic blog info first to create the blog in the database.');
      return;
    }

    try {
      await apiClient.post(`/blogs/${editingBlog.id}/sync/`, {
        sections: sections,
      });
      setNotebookSections(sections);
      alert('Notebook structure synchronized!');
    } catch (error) {
      alert('Failed to sync notebook');
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

  const startEdit = (b: Blog) => {
    setEditingBlog(b);
    setFormData({
      title: b.title,
      slug: b.slug,
      intro: b.intro || '',
      cover_image_url: b.cover_image_url || '',
      is_draft: b.is_draft,
      selectedTags: b.tags.map(t => t.id),
    });
    setNotebookSections(b.sections || []);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Edit / Create Mode */}
      {(editingBlog || isCreating) && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="lg:col-span-1 bg-secondary p-6 rounded-2xl border border-slate-200 h-fit sticky top-24">
            <h3 className="text-xl font-bold text-text-main mb-6">
              {editingBlog ? `Editing: ${editingBlog.title}` : 'New Blog Post'}
            </h3>
            <form onSubmit={handleSaveBlog} className="space-y-4">
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
                <label className="block text-xs font-bold text-text_muted uppercase mb-1">Intro</label>
                <textarea
                  rows={3}
                  className="w-full bg-primary border border-slate-200 rounded-lg px-3 py-2 text-text-main"
                  value={formData.intro}
                  onChange={e => setFormData({...formData, intro: e.target.value})}
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
              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="primary" className="flex-1" disabled={isSavingBlog}>
                  {isSavingBlog ? 'Saving...' : (editingBlog ? 'Update Blog' : 'Publish Blog')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setEditingBlog(null); setIsCreating(false); setFormData({ title: '', slug: '', intro: '', cover_image_url: '', is_draft: false, selectedTags: [] }); setNotebookSections([]); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <NotebookEditor
                blogId={editingBlog?.id || ''}
                sections={notebookSections}
                onUpdateSections={handleUpdateSections}
                onSave={handleSaveNotebookOnly}
              />
            </div>
          </div>
        </div>
      )}

      {/* List of all blogs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-text-main">All Blog Posts</h3>
          {!editingBlog && !isCreating && (
            <Button variant="primary" onClick={() => { setIsCreating(true); setFormData({ title: '', slug: '', intro: '', cover_image_url: '', is_draft: false, selectedTags: [] }); }}>
              + Create New Post
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map(b => (
            <div key={b.id} className="bg-secondary p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-4">
                <img src={b.cover_image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg object-cover" />
                <div className="overflow-hidden">
                  <div className="text-text-main font-bold truncate">{b.title} {b.is_draft && <span className="text-xs text-orange-400 font-normal ml-2">(Draft)</span>}</div>
                  <div className="text-xs text-text_muted truncate">{b.slug}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 px-3 py-1 text-xs" onClick={() => startEdit(b)}>Edit</Button>
                <Button variant="outline" className="px-3 py-1 text-xs text-red-400 border-red-400 hover:bg-red-400 hover:text-text-main" onClick={() => handleDelete(b.slug)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
