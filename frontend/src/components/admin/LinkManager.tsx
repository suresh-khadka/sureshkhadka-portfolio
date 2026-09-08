import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Button } from '../Button';

interface Link {
  id: string;
  platform: string;
  url: string;
  icon_class: string;
}

export const LinkManager = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon_class: '',
  });

  const fetchLinks = async () => {
    try {
      const response = await apiClient.get('/links/');
      setLinks(response.data);
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await apiClient.patch(`/links/${editingLink.id}/`, formData);
      } else {
        await apiClient.post('/links/', formData);
      }
      setFormData({ platform: '', url: '', icon_class: '' });
      setEditingLink(null);
      fetchLinks();
    } catch (error) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiClient.delete(`/links/${id}/`);
      fetchLinks();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const startEdit = (l: Link) => {
    setEditingLink(l);
    setFormData({
      platform: l.platform,
      url: l.url,
      icon_class: l.icon_class,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-secondary p-6 rounded-2xl border border-slate-700 h-fit">
        <h3 className="text-xl font-bold text-white mb-6">
          {editingLink ? 'Edit Link' : 'Add Social Link'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Platform</label>
            <input
              className="w-full bg-primary border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={formData.platform}
              onChange={e => setFormData({...formData, platform: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">URL</label>
            <input
              className="w-full bg-primary border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Icon Class (Optional)</label>
            <input
              className="w-full bg-primary border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={formData.icon_class}
              onChange={e => setFormData({...formData, icon_class: e.target.value})}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              {editingLink ? 'Update Link' : 'Add Link'}
            </Button>
            {editingLink && (
              <Button
                variant="secondary"
                onClick={() => { setEditingLink(null); setFormData({ platform: '', url: '', icon_class: '' }); }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {links.map(l => (
          <div key={l.id} className="bg-secondary p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-accent font-bold">
                {l.platform[0].toUpperCase()}
              </div>
              <div>
                <div className="text-white font-bold">{l.platform}</div>
                <div className="text-xs text-text_muted truncate max-w-xs">{l.url}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => startEdit(l)}>Edit</Button>
              <Button variant="outline" className="px-3 py-1 text-xs text-red-400 border-red-400 hover:bg-red-400 hover:text-white" onClick={() => handleDelete(l.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
