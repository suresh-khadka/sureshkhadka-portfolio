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
        <h1 className="text-5xl font-bold text-text-main mb-4">Technical Skills</h1>
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
            <div key={category} className="bg-secondary p-8 rounded-3xl border border-slate-200 shadow-lg">
              <h2 className="text-2xl font-bold text-text-main mb-6 border-b border-slate-200 pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.filter(s => s.category_name === category).map(skill => (
                  <div key={skill.id} className="flex items-center gap-4 p-3 rounded-xl bg-primary border border-slate-300">
                    <img 
                      src={skill.icon_url || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%228%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3Eno%20img%3C%2Ftext%3E%3C%2Fsvg%3E'} 
                      alt={skill.name} 
                      className="w-8 h-8 rounded-md object-contain"
                    />
                    <div className="flex-1">
                      <div className="text-text-main font-medium">{skill.name}</div>
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
