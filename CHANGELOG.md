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

## [2026-09-08] - Stage 7: Single-Admin Auth System
- Implemented JWT-based authentication using `djangorestframework-simplejwt`.
- Configured `SECRET_KEY` and `JWT_SECRET` for secure token signing.
- Created `IsOwnerAdmin` custom permission class to protect write operations.
- Set up login and token refresh endpoints (`/api/accounts/login/` and `/api/accounts/token/refresh/`).
- Added a management command `seed_admin` to create the single administrative user.

## [2026-09-08] - Stage 8: Public Read API
- Implemented read-only serializers for Projects, Skills, BlogPosts, Tags, and Links.
- Created public GET endpoints for all content resources.
- Added tag-based filtering for the blog list.
- Ensured draft blog posts are excluded from public view.
- Integrated content URLs into the main API routing.

## [2026-09-08] - Stage 9: Admin-Only CRUD API
- Implemented full CRUD (Create, Retrieve, Update, Delete) endpoints for all content resources.
- Created `IsAdminOrReadOnly` permission to strictly allow write operations only for the admin user.
- Integrated Supabase Storage for image uploads via a dedicated `/api/upload/` endpoint.
- Implemented secure file upload utility using the Supabase Python client.
- Updated API routing to support administrative management of all portfolio entities.

## [2026-09-08] - Stage 10: Analytics Tracking Backend
- Implemented unauthenticated POST endpoints for tracking page views and blog engagement.
- Created `VisitorSession` logic to automatically track and update user sessions via `session_id`.
- Built a heartbeat mechanism (`/api/track/heartbeat/`) to maintain active session durations.
- Integrated analytics endpoints into the global API routing at `/api/track/`.
- Added basic input validation and sanitization to protect analytics data.

## [2026-09-08] - Stage 11: Analytics Aggregation API
- Built admin-only aggregation endpoints to summarize raw tracking data.
- Implemented "Visitors Over Time" using Django `TruncDate` for daily counts.
- Developed "Most Read Blogs" view with total read counts and average time spent.
- Created "Page View Counts" for identifying top-performing pages.
- Implemented "Active Sessions" view to monitor users active within the last 15 minutes.
- Integrated `IsOwnerAdmin` permission to ensure analytics data is private.

## [2026-09-08] - Stage 12: Backend Automated Testing
- Set up a comprehensive test suite using `pytest` and `pytest-django`.
- Configured a dedicated `tests_settings.py` to use an in-memory SQLite database for fast, isolated tests.
- Implemented test cases for:
    - Public read-only access to projects, blogs, and skills.
    - Strict exclusion of draft blog posts from public view.
    - Security of CRUD endpoints (rejecting unauthenticated write attempts).
    - Correctness of administrative create, update, and delete operations.
    - End-to-end validation of analytics tracking (page views, blog reads).
    - Correctness of analytics aggregation logic for the admin dashboard.
- Verified 100% pass rate across all implemented backend features.

## [2026-09-08] - Stage 13: Render Deployment Prep (Backend)
- Installed `gunicorn` as the production WSGI server.
- Configured `STATIC_ROOT` for efficient static file collection during build.
- Implemented a `/health/` endpoint to allow Render to monitor service availability.
- Created a `render.yaml` blueprint for automated infrastructure-as-code deployment.
- Generated `requirements.txt` for production dependency installation.
- Documented all required production environment variables.

## [2026-09-08] - Stage 14: React + Vite Frontend Scaffold
- Installed `react-router-dom` and `axios`.
- Established project directory structure (`/api`, `/components`, `/hooks`, `/pages`, `/store`, `/layout`).
- Implemented a centralized `apiClient` with JWT interceptors for authentication and automatic token refreshing.
- Created a Global Layout with a responsive navigation bar and footer.
- Configured the main routing system with stubs for all required pages (Home, About, Projects, Blogs, Skills, Journey, Contact, Admin).
- Migrated the project to TypeScript (`.tsx`) for better type safety.

## [2026-09-08] - Stage 15: Public Pages, Wired to Live API
- Integrated Tailwind CSS for a professional, dark-themed design.
- Developed the Home page with a high-impact hero section and "Featured Projects" grid.
- Implemented the Projects and Project Detail pages, featuring a case-study layout and tech-stack tags.
- Built the Blog List and Detail pages, including tag-based filtering and a a clean reading experience.
- Developed the Skills page with category-based grouping and proficiency indicators.
- Created the About page and a dedicated Learning Journey timeline.
- Implemented a functional Contact page with a simulated submission flow.
- Wired all public pages to the Django REST API using the `apiClient`.

## [2026-09-08] - Stage 16: Frontend Analytics Instrumentation
- Implemented `useAnalytics` hook for automated session management and pageview tracking.
- Integrated a periodic heartbeat mechanism (every 30s) to track active session durations.
- Added detailed engagement tracking to `BlogDetail` using `visibilitychange` events.
- Implemented scroll-depth calculation to measure actual article consumption.
- Wired all frontend tracking events to the `/api/track/` backend endpoints.
- Ensured anonymous tracking via UUID session IDs persisted in localStorage.
