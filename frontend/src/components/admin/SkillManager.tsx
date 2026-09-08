import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Button } from '../Button';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency_level: string;
  icon_url: string;
}

interface Category {
  id: string;
  name: string;
}

export const SkillManager = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    proficiency_level: '',
    icon_url: '',
  });

  const fetchContent = async () => {
    try {
      const [skillsRes, catsRes] = await Promise.all([
        apiClient.get('/skills/'),
        apiClient.get('/skill-categories/'), // We might need to add this endpoint to views.py
      ]);
      setSkills(skillsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await apiClient.patch(`/skills/${editingSkill.id}/`, formData);
      } else {
        await apiClient.post('/skills/', formData);
      }
      setFormData({ name: '', category: '', proficiency_level: '', icon_url: '' });
      setEditingSkill(null);
      fetchContent();
    } catch (error) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiClient.delete(`/skills/${id}/`);
      fetchContent();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const startEdit = (s: Skill) => {
    setEditingSkill(s);
    setFormData({
      name: s.name,
      category: s.category,
      proficiency_level: s.proficiency_level,
      icon_url: s.icon_url,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-secondary p-6 rounded-2xl border border-slate-700 h-fit">
        <h3 className="text-xl font-bold text-white mb-6">
          {editingSkill ? 'Edit Skill' : 'Add New Skill'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Skill Name</label>
            <input
              className="w-full bg-primary border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Category</label>
            <select
              className="w-full bg-primary border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Proficiency</label>
            <select
              className="w-full bg-primary border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={formData.proficiency_level}
              onChange={e => setFormData({...formData, proficiency_level: e.target.value})}
              required
            >
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text_muted uppercase mb-1">Icon URL</label>
            <input
              className="w-full bg-primary border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={formData.icon_url}
              onChange={e => setFormData({...formData, icon_url: e.target.value})}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              {editingSkill ? 'Update Skill' : 'Add Skill'}
            </Button>
            {editingSkill && (
              <Button
                variant="secondary"
                onClick={() => { setEditingSkill(null); setFormData({ name: '', category: '', proficiency_level: '', icon_url: '' }); }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {skills.map(s => (
          <div key={s.id} className="bg-secondary p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={s.icon_url || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg object-contain" />
              <div>
                <div className="text-white font-bold">{s.name}</div>
                <div className="text-xs text-text_muted">{s.proficiency_level}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => startEdit(s)}>Edit</Button>
              <Button variant="outline" className="px-3 py-1 text-xs text-red-400 border-red-400 hover:bg-red-400 hover:text-white" onClick={() => handleDelete(s.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
