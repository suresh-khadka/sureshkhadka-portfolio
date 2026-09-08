import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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

interface Skill {
  id: string;
  name: string;
  category_name: string;
  proficiency_level: string;
  icon_url: string;
}

const SectionWrapper = ({ id, children, title, subtitle }: { id: string, children: React.ReactNode, title?: string, subtitle?: string }) => {
  return (
    <section
      id={id}
      className="min-h-screen w-full flex flex-col justify-center py-20 px-6 md:px-12 lg:px-24 snap-start"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto w-full"
      >
        {title && (
          <header className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-text-main mb-4">{title}</h2>
            {subtitle && <p className="text-text_muted max-w-2xl mx-auto text-lg">{subtitle}</p>}
          </header>
        )}
        {children}
      </motion.div>
    </section>
  );
};

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactStatus, setContactStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, skillsRes] = await Promise.all([
          apiClient.get('/projects/'),
          apiClient.get('/skills/'),
        ]);
        setProjects(projectsRes.data);
        setSkills(skillsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    setTimeout(() => setContactStatus('success'), 1500);
  };

  const skillCategories = Array.from(new Set(skills.map(s => s.category_name)));

  return (
    <div className="snap-container h-full">
      {/* Hero Section */}
      <section id="hero" className="min-h-screen w-full flex flex-col items-center justify-center text-center py-20 px-6 snap-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
            Available for new opportunities
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold text-text-main mb-6 leading-tight">
            Building the future with <span className="text-accent">AI & ML</span>
          </h1>
          <p className="text-lg md:text-2xl text-text_muted max-w-3xl mx-auto mb-12 leading-relaxed">
            Hi, I am Suresh Khadka. I specialize in creating intelligent systems that solve real-world problems.
            Explore my work, my journey, and my technical expertise.
          </p>
          <div className="flex gap-4">
            <Button variant="primary" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
              View Work
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              Get in Touch
            </Button>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <SectionWrapper id="about" title="About Me">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-lg text-text_muted leading-relaxed">
              I am a passionate AI/ML Engineer and Full-stack Developer with a deep interest in
              building systems that can learn, adapt, and solve complex real-world problems.
            </p>
            <p className="text-lg text-text_muted leading-relaxed">
              Currently, I am focusing on the intersection of Large Language Models (LLMs) and
              traditional software architecture, aiming to create tools that are not only
              intelligent but also robust and scalable.
            </p>
            <div className="flex gap-4">
              <Link to="/learning" className="bg-accent text-white px-6 py-3 rounded-lg font-bold hover:bg-sky-600 transition-colors">
                See My Journey
              </Link>
              <Button variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Contact Me
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="/profile_01.png"
              alt="Suresh Khadka"
              className="rounded-3xl shadow-2xl border-4 border-secondary w-full object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-accent text-white p-6 rounded-2xl font-bold shadow-xl">
              AI/ML Enthusiast
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Skills Section */}
      <SectionWrapper id="skills" title="Technical Skills" subtitle="My toolbelt for building intelligent applications.">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2].map(i => <div key={i} className="bg-secondary h-64 rounded-3xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {skillCategories.map(category => (
              <div key={category} className="bg-secondary p-8 rounded-3xl border border-slate-200 shadow-lg">
                <h3 className="text-2xl font-bold text-text-main mb-6 border-b border-slate-200 pb-2">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skills.filter(s => s.category_name === category).map(skill => (
                    <div key={skill.id} className="flex items-center gap-4 p-3 rounded-xl bg-primary border border-slate-200">
                      <img
                        src={skill.icon_url || 'https://placehold.co/32'}
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
      </SectionWrapper>

      {/* Projects Section */}
      <SectionWrapper id="projects" title="Featured Work" subtitle="A selection of my most impactful AI/ML projects">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="bg-secondary h-80 rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.slice(0, 6).map(project => (
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
                    View Details <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* Contact Section */}
      <SectionWrapper id="contact" title="Get in Touch" subtitle="Have a project in mind or just want to say hi?">
        <div className="max-w-xl mx-auto bg-secondary p-8 rounded-3xl border border-slate-200 shadow-2xl">
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text_muted mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-primary border border-slate-200 rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text_muted mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-primary border border-slate-200 rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text_muted mb-2">Message</label>
              <textarea
                rows={5}
                required
                className="w-full bg-primary border border-slate-200 rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent transition-colors"
                placeholder="Tell me about your project..."
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={contactStatus === 'sending'}
              className="w-full bg-accent text-white font-bold py-4 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {contactStatus === 'success' && (
              <p className="text-center text-green-600 font-medium mt-4">Message sent successfully!</p>
            )}
          </form>
        </div>
      </SectionWrapper>
    </div>
  );
}
