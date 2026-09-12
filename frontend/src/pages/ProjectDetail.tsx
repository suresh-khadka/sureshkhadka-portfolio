import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';

interface Project {
  title: string;
  description: string;
  content: string;
  thumbnail_url: string;
  stack: string[];
  github_url?: string;
  live_url?: string;
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

  if (loading) return <div className="page-container text-center py-20 text-text-main">Loading...</div>;
  if (!project) return <div className="page-container text-center py-20 text-text-main">Project not found.</div>;

  return (
    <div className="page-container">
      <Link to="/projects" className="text-accent hover:underline mb-8 inline-block">&larr; Back to Projects</Link>
      
      <header className="mb-12">
        <h1 className="text-5xl font-bold text-text-main mb-4">{project.title}</h1>
        <p className="text-xl text-text_muted mb-8 max-w-3xl">{project.description}</p>
        
        <div className="flex gap-4 mb-10">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer" className="bg-slate-800 text-text-main px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
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
          src={project.thumbnail_url || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2214%22%20fill%3D%22%2394a3b8%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E'} 
          alt={project.title} 
          className="w-full h-auto rounded-3xl shadow-2xl border border-slate-200"
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-text-main mb-6">Case Study</h2>
          <div className="prose prose-invert max-w-none text-text_muted whitespace-pre-wrap">
            {project.content}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary p-6 rounded-2xl border border-slate-200 sticky top-8">
            <h3 className="text-xl font-bold text-text-main mb-4">Project Details</h3>
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
