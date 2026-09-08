import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Button } from '../components/Button';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  stack: string[];
}

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/projects/');
        // Take the first 3 as featured
        setFeaturedProjects(response.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20">
        <div className="mb-6 inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
          Available for new opportunities
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-text-main mb-6">
          Building the future with <span className="text-accent">AI & ML</span>
        </h1>
        <p className="text-lg md:text-xl text-text_muted max-w-2xl mx-auto mb-10">
          Hi, I am Suresh Khadka. I specialize in creating intelligent systems that solve real-world problems. 
          Explore my work, my journey, and my technical expertise.
        </p>
        <div className="flex gap-4">
          <Button variant="primary" as="a" href="/projects">View Work</Button>
          <Button variant="outline" as="a" href="/contact">Get in Touch</Button>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-text-main mb-2">Featured Work</h2>
            <p className="text-text_muted">A selection of my most impactful AI/ML projects</p>
          </div>
          <Link to="/projects" className="text-accent hover:underline font-medium">
            View all projects &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-secondary h-64 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map(project => (
              <div key={project.id} className="group bg-secondary rounded-2xl overflow-hidden border border-slate-200 hover:border-accent transition-all duration-300 shadow-lg">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={project.thumbnail_url || 'https://placehold.co/400x200'} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-main mb-2">{project.title}</h3>
                  <p className="text-text_muted text-sm mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.map(tech => (
                      <span key={tech} className="text-xs bg-white px-2 py-1 rounded-md text-accent border border-accent/20 shadow-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to={`/projects/${project.slug}`} 
                    className="text-text-main font-semibold flex items-center gap-2 group-hover:text-accent transition-colors"
                  >
                    View Case Study <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
