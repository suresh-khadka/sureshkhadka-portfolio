import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

const Layout = () => {
  useAnalytics();

  return (
    <div className="app-layout">
      <nav className="main-nav">
        <div className="nav-brand">
          <Link to="/">Suresh Khadka</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/about">About</Link></li>
          <li><Link to="/projects">Projects</Link></li>
          <li><Link to="/blogs">Blog</Link></li>
          <li><Link to="/skills">Skills</Link></li>
          <li><Link to="/learning">Journey</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/admin/login" className="admin-link">Admin</Link></li>
        </ul>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="main-footer">
        <p>&copy; {new Date().getFullYear()} Suresh Khadka. Built with React & Django.</p>
      </footer>
    </div>
  );
};

export default Layout;
