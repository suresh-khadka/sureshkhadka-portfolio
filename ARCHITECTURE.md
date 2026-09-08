# Architecture & Scoping Document - Suresh Khadka AI/ML Portfolio

## 1. System Diagram
`Frontend (React + Vite)` $\leftrightarrow$ `Backend (Django REST Framework)` $\leftrightarrow$ `Database (Supabase PostgreSQL)`

- **Frontend**: Hosted on Vercel. Handles UI, user interaction, and client-side analytics tracking.
- **Backend**: Hosted on Render. Provides RESTful APIs for content management and analytics aggregation. Handles authentication and business logic.
- **Database**: Supabase (PostgreSQL). Stores all persistent data. RLS (Row Level Security) ensures public read-only access.

## 2. Project Structure
**Decision: Monorepo**
I have chosen a monorepo structure to simplify development, versioning, and local environment setup for a single-developer project.

```text
.
├── backend/              # Django project root
│   ├── core/             # Project settings and WSGI/ASGI
│   ├── content/          # App for Projects, Skills, Blogs, Links
│   ├── analytics/        # App for PageViews, ReadEvents, Sessions
│   ├── accounts/         # App for Admin Auth
│   ├── db/
│   │   └── migrations/   # SQL migration files for Supabase
│   ├── .env.example
│   └── manage.py
├── frontend/             # React + Vite root
│   ├── src/
│   │   ├── api/          # API client configuration
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom hooks (including analytics)
│   │   ├── pages/        # Route-level components
│   │   └── store/        # Global state (if needed)
│   ├── .env.example
│   └── package.json
├── CHANGELOG.md
└── ARCHITECTURE.md
```

## 3. Naming Conventions
- **Files/Folders**: `kebab-case` (e.g., `blog-post-card.tsx`, `analytics-view.py`).
- **Variables/Functions**: `camelCase` for Frontend, `snake_case` for Backend.
- **Database Tables**: `snake_case` plural (e.g., `blog_posts`, `page_views`).
- **API Endpoints**: Plural nouns, kebab-case for nested resources (e.g., `/api/blog-posts/`).

## 4. Environment Variables
### Backend (`backend/.env`)
- `DEBUG`: Boolean (True/False)
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: Supabase connection string
- `JWT_SECRET`: Secret for SimpleJWT
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed domains
- `SUPABASE_STORAGE_BUCKET`: Name of the bucket for image uploads

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL`: URL of the Render-hosted Django API
- `VITE_SUPABASE_PUBLIC_URL`: Public URL for assets in Supabase storage

## 5. Entities & Schema Definitions
| Entity | Description | Key Fields |
| :--- | :--- | :--- |
| `Admin` | The single administrator | `username`, `password`, `email` |
| `Project` | Portfolio projects | `title`, `slug`, `description`, `content (markdown)`, `thumbnail_url`, `stack (JSON/Tags)`, `github_url`, `live_url`, `created_at` |
| `Skill` | Technical skills | `name`, `category`, `proficiency_level`, `icon_url` |
| `BlogPost` | Blog articles | `title`, `slug`, `content (markdown)`, `cover_image_url`, `published_at`, `is_draft` |
| `Tag` | Categorization for blogs | `name`, `slug` |
| `Link` | Social/External links | `platform`, `url`, `icon_class` |
| `PageView` | Page hit analytics | `path`, `timestamp`, `referrer`, `session_id` |
| `BlogReadEvent` | Blog engagement metrics | `blog_id`, `session_id`, `seconds_spent`, `scroll_depth`, `timestamp` |
| `VisitorSession` | Unique visitor session | `session_id`, `first_seen`, `last_seen`, `user_agent`, `location_summary` |

## 6. Storage Strategy
- **Images/Files**: All project thumbnails and blog covers will be stored in a **Supabase Storage Bucket**. The Django backend will handle the upload logic and store the resulting public URLs in the database.
