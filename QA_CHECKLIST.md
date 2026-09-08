# Quality Assurance Checklist

## Core Functionality
- [ ] **Home Page**: Hero section displays correctly, featured projects are loaded.
- [ ] **Projects**: Project list and details load; tags are clickable.
- [ ] **Blog**: List filters by tags; detail page renders Markdown-like content.
- [ ] **Skills**: Categorized skills are displayed with proficiency levels.
- [ ] **Contact**: Form submits (simulated) and shows success state.

## Admin Portal
- [ ] **Authentication**: Login/Logout cycle works perfectly.
- [ ] **Content Management**:
    - [ ] Projects can be created/updated/deleted.
    - [ ] Blog posts can be drafted and published.
    - [ ] Skills and Links can be managed.
- [ ] **Image Uploads**: Images upload to Supabase and display correctly.
- [ ] **Analytics View**: Charts update with real visitor data.

## Analytics & Tracking
- [ ] **Session Tracking**: New visitors get a unique session ID.
- [ ] **Page Views**: Every page visit is recorded.
- [ ] **Blog Engagement**: Read time and scroll depth are sent on page exit.
- [ ] **Heartbeat**: Active sessions are maintained while the user is on site.

## Performance & Security
- [ ] **API Security**: Public endpoints are read-only; write endpoints require Admin JWT.
- [ ] **Responsiveness**: Portfolio is fully responsive on mobile and desktop.
- [ ] **Load Times**: Initial page load is fast (Vite build optimization).
