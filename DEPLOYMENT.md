# Deployment Guide: AI/ML Learning Portfolio

## 1. Backend Deployment (Render)
- **Service Type**: Web Service
- **Runtime**: Python
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `gunicorn core.wsgi`
- **Environment Variables**:
    - `DATABASE_URL`: Your Supabase PostgreSQL connection string.
    - `SECRET_KEY`: A long random string for Django.
    - `JWT_SECRET`: A secret for JWT signing.
    - `SUPABASE_URL`: Your Supabase project URL.
    - `SUPABASE_KEY`: Your Supabase service role key.
    - `DEBUG`: `False`
- **Static Files**: Ensure `collectstatic` is run during build or via a pre-deploy script.

## 2. Frontend Deployment (Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
    - `VITE_API_URL`: Your Render backend URL (e.g., `https://portfolio-api.onrender.com`).

## 3. Database (Supabase)
- Run the initial schema migration: `001_initial_schema.sql`.
- Ensure RLS policies are active for public read-only access to content.
- Create the admin user via the `seed_admin` management command on the Render console.

## 4. Post-Deployment Verification
- [ ] Verify public pages (Home, Projects, Blogs) load data from the live API.
- [ ] Verify Admin Login works and JWT tokens are stored.
- [ ] Verify content can be added/edited via the Admin Dashboard.
- [ ] Verify analytics are being tracked (check the Analytics tab in Admin).
