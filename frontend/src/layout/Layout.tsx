import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

const Layout = () => {
  useAnalytics();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [location.pathname]);

  const handleScroll = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'blogs', label: 'Blog', external: '/blogs' },
    { id: 'skills', label: 'Skills' },
    { id: 'learning', label: 'Journey', external: '/learning' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-primary text-text-main">
      <nav className="flex items-center justify-between px-6 py-4 bg-primary/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="text-xl font-bold text-text-main">
          <Link to="/" className="hover:text-accent transition-colors">Suresh Khadka</Link>
        </div>
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <li key={link.id}>
              {link.external ? (
                <Link 
                  to={link.external as string} 
                  className={`text-sm font-medium transition-colors ${activeSection === link.id ? 'text-accent' : 'text-text_muted hover:text-accent'}`}
                >
                  {link.label}
                </Link>
              ) : (
                <button 
                  onClick={() => handleScroll(link.id)}
                  className={`text-sm font-medium transition-colors ${activeSection === link.id ? 'text-accent' : 'text-text_muted hover:text-accent'}`}
                >
                  {link.label}
                </button>
              )}
            </li>
          ))}
          <li>
            <Link to="/admin/login" className="bg-accent text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-sky-600 transition-colors">
              Admin
            </Link>
          </li>
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="py-8 border-t border-slate-200 text-center text-text_muted text-sm">
        <p>&copy; {new Date().getFullYear()} Suresh Khadka. Built with React & Django.</p>
      </footer>
    </div>
  );
};

export default Layout;
