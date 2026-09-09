import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Button } from '../Button';
import { NotebookManager } from './NotebookManager';

interface Notebook {
  id: string;
  title: string;
  storage_path: string;
  order: number;
}

interface Section {
  id: string;
  title: string;
  slug: string;
  order: number;
  notebooks: Notebook[];
  isNew?: boolean;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  intro: string;
  cover_image_url: string;
  is_draft: boolean;
  tags: { id: string; name: string; slug: string }[];
  sections: Section[];
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
  const [notebookSections, setNotebookSections] = useState<Section[]>([]);
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
      const uploadUrl = `/upload/?blog_id=${editingBlog?.id || ''}&type=cover`;
      const response = await apiClient.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({ ...prev, cover_image_url: response.data.url }));
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSections = (sections: Section[]) => {
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

      setEditingBlog(savedBlog);
      setIsCreating(false);

      setFormData({
        title: savedBlog.title,
        slug: savedBlog.slug,
        intro: savedBlog.intro || '',
        cover_image_url: savedBlog.cover_image_url || '',
        is_draft: savedBlog.is_draft,
        selectedTags: savedBlog.tags ? savedBlog.tags.map((t: any) => t.id) : [],
      });

      // SYNC SECTIONS
      if (savedBlog.id && notebookSections.length > 0) {
        await apiClient.post(`/blogs/${savedBlog.id}/sync/`, {
          sections: notebookSections.map(s => ({
            id: s.id,
            title: s.title,
            order: s.order,
          }))
        });

        // Mark all sections as persisted
        setNotebookSections(prev => prev.map(s => ({ ...s, isNew: false })));
      }

      fetchContent();
      alert('Blog saved successfully!');
    } catch (error) {
      alert('Save failed');
    } finally {
      setIsSavingBlog(false);
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
          <div className="lg:col-span-3 space-y-8">
            {/* CONTENT SECTION LIST */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-text-main">Blog Structure</h3>
                <Button
                  variant="primary"
                  className="text-sm"
                  onClick={() => {
                    const newSection: Section = {
                      id: crypto.randomUUID(),
                      title: 'New Section',
                      slug: `section-${Date.now()}`,
                      order: notebookSections.length,
                      notebooks: [],
                      isNew: true
                    };
                    setNotebookSections([...notebookSections, newSection]);
                  }}
                >
                  + Add Content Section
                </Button>
              </div>

              <div className="space-y-3">
                {notebookSections.map((section, idx) => (
                  <div key={section.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                      <input
                        className="bg-transparent border-b border-transparent focus:border-primary outline-none font-medium text-text-main"
                        value={section.title}
                        onChange={(e) => {
                          const updated = [...notebookSections];
                          updated[idx].title = e.target.value;
                          setNotebookSections(updated);
                        }}
                      />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() => {
                          const updated = notebookSections.filter(s => s.id !== section.id);
                          setNotebookSections(updated);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {notebookSections.length === 0 && (
                  <div className="text-center py-8 text-text_muted italic text-sm">
                    No sections added yet. Start by adding a content section.
                  </div>
                )}
              </div>
            </div>

            {/* SECTIONS DETAIL / NOTEBOOKS */}
            {notebookSections.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-text-main">Notebooks</h3>
                <div className="grid grid-cols-1 gap-6">
                  {notebookSections.map(section => (
                    <div key={section.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-text-main text-lg">{section.title}</h4>
                      </div>
                      <NotebookManager
                        blogId={editingBlog?.id || ''}
                        sections={[section]}
                        onUpdateSections={(updated) => {
                          setNotebookSections(notebookSections.map(s => s.id === section.id ? updated[0] : s));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <img src={b.cover_image_url || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2250%22%20height%3D%2250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%228%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3Eno%20img%3C%2Ftext%3E%3C%2Fsvg%3E'} className="w-12 h-12 rounded-lg object-cover" />
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
