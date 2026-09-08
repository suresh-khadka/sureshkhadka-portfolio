import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';

interface Skill {
  id: string;
  name: string;
  category_name: string;
  proficiency_level: string;
  icon_url: string;
}

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await apiClient.get('/skills/');
        setSkills(response.data);
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // Group skills by category
  const categories = Array.from(new Set(skills.map(s => s.category_name)));

  return (
    <div className="page-container">
      <header className="text-center py-12">
        <h1 className="text-5xl font-bold text-white mb-4">Technical Skills</h1>
        <p className="text-text_muted max-w-2xl mx-auto">
          My toolbelt for building intelligent applications. I focus on a balance between 
          theoretical depth and practical engineering.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="bg-secondary h-64 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {categories.map(category => (
            <div key={category} className="bg-secondary p-8 rounded-3xl border border-slate-700 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.filter(s => s.category_name === category).map(skill => (
                  <div key={skill.id} className="flex items-center gap-4 p-3 rounded-xl bg-primary border border-slate-800">
                    <img 
                      src={skill.icon_url || 'https://via.placeholder.com/32'} 
                      alt={skill.name} 
                      className="w-8 h-8 rounded-md object-contain"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{skill.name}</div>
                      <div className="text-xs text-text_muted">{skill.proficiency_level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
