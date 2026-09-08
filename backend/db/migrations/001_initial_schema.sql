-- 001_initial_schema.sql
-- Supabase Migration: Initial Schema Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CONTENT TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50) NOT NULL,
    icon_url TEXT,
    CONSTRAINT skill_name_category_unique UNIQUE (name, category_id)
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    content TEXT,
    thumbnail_url TEXT,
    stack JSONB,
    github_url TEXT,
    live_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    published_at TIMESTAMPTZ DEFAULT now(),
    is_draft BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
    blog_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, tag_id)
);

CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    icon_class VARCHAR(100)
);

-- ==========================================
-- ANALYTICS TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS visitor_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_seen TIMESTAMPTZ DEFAULT now(),
    last_seen TIMESTAMPTZ DEFAULT now(),
    user_agent TEXT,
    location_summary VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES visitor_sessions(session_id) ON DELETE SET NULL,
    path TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now(),
    referrer TEXT
);

CREATE TABLE IF NOT EXISTS blog_read_events (
    id BIGSERIAL PRIMARY KEY,
    blog_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    session_id UUID REFERENCES visitor_sessions(session_id) ON DELETE SET NULL,
    seconds_spent INTEGER NOT NULL,
    scroll_depth INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_skills_category ON skills(category_id);
CREATE INDEX idx_blog_post_tags_blog ON blog_post_tags(blog_id);
CREATE INDEX idx_blog_post_tags_tag ON blog_post_tags(tag_id);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX idx_blog_read_events_blog ON blog_read_events(blog_id);
CREATE INDEX idx_blog_read_events_session ON blog_read_events(session_id);
CREATE INDEX idx_blog_read_events_timestamp ON blog_read_events(timestamp);
CREATE INDEX idx_visitor_sessions_first_seen ON visitor_sessions(first_seen);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_read_events ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Only SELECT allowed for anonymous users)
CREATE POLICY "Public read skill_categories" ON skill_categories FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read blog_posts" ON blog_posts FOR SELECT USING (is_draft = false);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read blog_post_tags" ON blog_post_tags FOR SELECT USING (true);
CREATE POLICY "Public read links" ON links FOR SELECT USING (true);

-- Analytics tables: No public access.
-- Note: Django backend will use the service_role key to bypass RLS for tracking endpoints.
-- If you want to allow the frontend to insert tracking data directly via Supabase client,
-- you would add INSERT policies here. But for this project, tracking goes through Django.
