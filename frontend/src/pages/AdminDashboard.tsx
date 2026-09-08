import React, { useState } from 'react';
import { ProjectManager } from '../components/admin/ProjectManager';
import { BlogManager } from '../components/admin/BlogManager';
import { SkillManager } from '../components/admin/SkillManager';
import { LinkManager } from '../components/admin/LinkManager';
import { Button } from '../components/Button';

type Tab = 'projects' | 'blogs' | 'skills' | 'links';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('projects');

  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'blogs', label: 'Blog Posts' },
    { id: 'skills', label: 'Skills' },
    { id: 'links', label: 'Social Links' },
  ];

  return (
    <div className="page-container">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Content Manager</h1>
          <p className="text-text_muted">Update your portfolio data in real-time</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/admin/login';
          }}
        >
          Logout
        </Button>
      </header>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            className="whitespace-nowrap"
            onClick={() => setActiveTab(tab.id as Tab)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'projects' && <ProjectManager />}
        {activeTab === 'blogs' && <BlogManager />}
        {activeTab === 'skills' && <SkillManager />}
        {activeTab === 'links' && <LinkManager />}
      </div>
    </div>
  );
}
