import { vi } from "vitest";
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminDashboard from './AdminDashboard';

// Mock the managers to avoid API calls and complex rendering
vi.mock('../components/admin/ProjectManager', () => ({ ProjectManager: () => <div>Project Manager</div> }));
vi.mock('../components/admin/BlogManager', () => ({ BlogManager: () => <div>Blog Manager</div> }));
vi.mock('../components/admin/SkillManager', () => ({ SkillManager: () => <div>Skill Manager</div> }));
vi.mock('../components/admin/LinkManager', () => ({ LinkManager: () => <div>Link Manager</div> }));
vi.mock('../components/admin/AnalyticsManager', () => ({ AnalyticsManager: () => <div>Analytics Manager</div> }));

describe('AdminDashboard', () => {
  it('renders the dashboard title and tabs', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('switches tabs on click', () => {
    render(<AdminDashboard />);
    
    // Default tab is projects
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    
    // Click Analytics tab
    fireEvent.click(screen.getByText('Analytics'));
    expect(screen.getByText('Analytics Manager')).toBeInTheDocument();
    expect(screen.queryByText('Project Manager')).not.toBeInTheDocument();
  });
});
