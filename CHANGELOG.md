# Changelog

## [2026-09-08] - Stage 1: Architecture & Scoping
- Initialized project architecture and scoping document.

## [2026-09-08] - Stage 2: Local Dev Environment Setup
- Created monorepo structure with `/frontend` (Vite+React) and `/backend` (Django).
- Installed frontend and backend dependencies.
- Configured `.gitignore` and provided `.env.example` files.
- Verified local development servers can start.

## [2026-09-08] - Stage 3: Database Schema Design
- Designed full PostgreSQL schema in `DATABASE_SCHEMA.md`.
- Defined tables for projects, skills, blogs, tags, links, and analytics.
- Established indexing strategy for high-performance analytics queries.

## [2026-09-08] - Stage 4: Supabase Project Setup
- Created SQL migration script `001_initial_schema.sql` for database initialization.
- Implemented Row Level Security (RLS) policies to ensure public read-only access for content and strict privacy for analytics.
- Documented the setup process for the Supabase project.
