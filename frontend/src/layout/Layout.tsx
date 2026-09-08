import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

const Layout = () => {
  useAnalytics();

  return (
    <div className="app-layout min-h-screen bg-primary text-text-main">
      <nav className="flex items-center justify-between px-6 py-4 bg-primary/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
        <div className="text-xl font-bold text-white">
          <Link to="/" className="hover:text-accent transition-colors">Suresh Khadka</Link>
        </div>
        <ul className="hidden md:flex items-center gap-6">
          <li><Link to="/about" className="text-sm font-medium text-text_muted hover:text-accent transition-colors">About</Link></li>
          <li><Link to="/projects" className="text-sm font-medium text-text_muted hover:text-accent transition-colors">Projects</Link></li>
          <li><Link to="/blogs" className="text-sm font-medium text-text_muted hover:text-accent transition-colors">Blog</Link></li>
          <li><Link to="/skills" className="text-sm font-medium text-text_muted hover:text-accent transition-colors">Skills</Link></li>
          <li><Link to="/learning" className="text-sm font-medium text-text_muted hover:text-accent transition-colors">Journey</Link></li>
          <li><Link to="/contact" className="text-sm font-medium text-text_muted hover:text-accent transition-colors">Contact</Link></li>
          <li>
            <Link to="/admin/login" className="bg-accent text-primary px-3 py-1 rounded-lg text-sm font-bold hover:bg-sky-300 transition-colors">
              Admin
            </Link>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="py-8 border-t border-slate-800 text-center text-text_muted text-sm">
        <p>&copy; {new Date().getFullYear()} Suresh Khadka. Built with React & Django.</p>
      </footer>
    </div>
  );
};

export default Layout;
