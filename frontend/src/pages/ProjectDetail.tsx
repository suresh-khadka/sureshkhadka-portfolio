import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

interface Project {
  title: string;
  description: string;
  content: string;
  thumbnail_url: string;
  stack: string[];
  github_url: string;
  live_url: string;
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await apiClient.get(`/projects/${slug}/`);
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) return <div className="page-container text-center py-20 text-white">Loading...</div>;
  if (!project) return <div className="page-container text-center py-20 text-white">Project not found.</div>;

  return (
    <div className="page-container">
      <Link to="/projects" className="text-accent hover:underline mb-8 inline-block">&larr; Back to Projects</Link>
      
      <header className="mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">{project.title}</h1>
        <p className="text-xl text-text_muted mb-8 max-w-3xl">{project.description}</p>
        
        <div className="flex gap-4 mb-10">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer" className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
              GitHub Repo
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noreferrer" className="bg-accent text-primary px-4 py-2 rounded-lg font-bold hover:bg-sky-300 transition-colors flex items-center gap-2">
              Live Demo
            </a>
          )}
        </div>

        <img 
          src={project.thumbnail_url || 'https://via.placeholder.com/1200x600'} 
          alt={project.title} 
          className="w-full h-auto rounded-3xl shadow-2xl border border-slate-700"
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6">Case Study</h2>
          <div className="prose prose-invert max-w-none text-text_muted whitespace-pre-wrap">
            {project.content}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary p-6 rounded-2xl border border-slate-700 sticky top-8">
            <h3 className="text-xl font-bold text-white mb-4">Project Details</h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs uppercase text-text_muted font-bold mb-1">Tech Stack</span>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map(tech => (
                    <span key={tech} className="text-xs bg-primary px-2 py-1 rounded-md text-accent border border-accent/20">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
