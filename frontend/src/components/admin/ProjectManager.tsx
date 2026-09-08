import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Button } from '../Button';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail_url: string;
  stack: string[];
}

export const ProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    thumbnail_url: '',
    stack: '',
  });
  const [uploading, setUploading] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects/');
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
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
      setFormData(prev => ({ ...prev, thumbnail_url: response.data.url }));
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      stack: formData.stack.split(',').map(s => s.trim()),
    };

    try {
      if (editingProject) {
        await apiClient.patch(`/projects/${editingProject.slug}/`, data);
      } else {
        await apiClient.post('/projects/', data);
      }
      setFormData({ title: '', slug: '', description: '', content: '', thumbnail_url: '', stack: '' });
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      alert('Save failed');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await apiClient.delete(`/projects/${slug}/`);
      fetchProjects();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const startEdit = (p: Project) => {
    setEditingProject(p);
    setFormData({
      title: p.title,
      slug: p.slug,
      description: p.description,
      content: p.content || '',
      thumbnail_url: p.thumbnail_url || '',
      stack: p.stack.join(', '),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-secondary p-6 rounded-2xl border border-slate-200 h-fit">
        <h3 className="text-xl font-bold text-text-main mb-6">
          {editingProject ? 'Edit Project' : 'Add New Project'}
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
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Description</label>
            <textarea
              className="w-full bg-primary border border-slate-200 rounded-lg px-3 py-2 text-text-main"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Content (Markdown)</label>
            <textarea
              rows={5}
              className="w-full bg-primary border border-slate-200 rounded-lg px-3 py-2 text-text-main"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Stack (comma separated)</label>
            <input
              className="w-full bg-primary border border-slate-200 rounded-lg px-3 py-2 text-text-main"
              value={formData.stack}
              onChange={e => setFormData({...formData, stack: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Thumbnail</label>
            <div className="flex gap-2">
              <input
                type="file"
                className="hidden"
                id="thumb-upload"
                onChange={handleUpload}
              />
              <label
                htmlFor="thumb-upload"
                className="cursor-pointer bg-slate-700 text-text-main px-3 py-2 rounded-lg text-sm hover:bg-slate-600 transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
              <input
                className="flex-1 bg-primary border border-slate-200 rounded-lg px-3 py-2 text-xs text-text_muted"
                value={formData.thumbnail_url}
                readOnly
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              {editingProject ? 'Update Project' : 'Create Project'}
            </Button>
            {editingProject && (
              <Button
                variant="secondary"
                onClick={() => { setEditingProject(null); setFormData({title:'', slug:'', description:'', content:'', thumbnail_url:'', stack:''}); }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {projects.map(p => (
          <div key={p.id} className="bg-secondary p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={p.thumbnail_url || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div className="text-text-main font-bold">{p.title}</div>
                <div className="text-xs text-text_muted">{p.slug}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => startEdit(p)}>Edit</Button>
              <Button variant="outline" className="px-3 py-1 text-xs text-red-400 border-red-400 hover:bg-red-400 hover:text-text-main" onClick={() => handleDelete(p.slug)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
