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

## [2026-09-08] - Stage 5: Django Backend Scaffold
- Created Django apps: `content`, `analytics`, and `accounts`.
- Configured `settings.py` to use `django-environ` for environment-based configuration.
- Integrated Django REST Framework (DRF) and `django-cors-headers`.
- Configured PostgreSQL database connectivity via `DATABASE_URL`.
- Verified system health using `python manage.py check`.

## [2026-09-08] - Stage 6: Django Models + Migrations
- Implemented Django models for `content` and `analytics` apps matching the schema.
- Configured UUID primary keys and relationships (including Many-to-Many for BlogPosts and Tags).
- Registered all models in the Django Admin for internal management.
- Generated initial migration files.
- Updated `ARCHITECTURE.md` to specify `managed = True` as the migration strategy.
