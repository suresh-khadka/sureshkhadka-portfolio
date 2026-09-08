# Database Schema Design - Suresh Khadka Portfolio

This document outlines the PostgreSQL schema for the portfolio project.

## 1. Entity Relationship Diagram (Logical)

- `Admin` (1) $\rightarrow$ Manages $\rightarrow$ (N) `Project`, `Skill`, `BlogPost`, `Link`
- `SkillCategory` (1) $\rightarrow$ Categorizes $\rightarrow$ (N) `Skill`
- `BlogPost` (N) $\leftrightarrow$ (N) `Tag` (via `blog_post_tags`)
- `VisitorSession` (1) $\rightarrow$ Tracks $\rightarrow$ (N) `PageView`
- `VisitorSession` (1) $\rightarrow$ Tracks $\rightarrow$ (N) `BlogReadEvent`
- `BlogPost` (1) $\rightarrow$ Recorded in $\rightarrow$ (N) `BlogReadEvent`

## 2. Table Definitions

### Content Tables

#### `skill_categories`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ID |
| `name` | VARCHAR(50) | NOT NULL, UNIQUE | Category name (e.g., "Languages", "Frameworks") |

#### `skills`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ID |
| `category_id` | UUID | FK $\rightarrow$ `skill_categories(id)`, NOT NULL | Category link |
| `name` | VARCHAR(100) | NOT NULL | Skill name (e.g., "Python") |
| `proficiency_level` | VARCHAR(50) | NOT NULL | e.g., "Expert", "Intermediate" |
| `icon_url` | TEXT | | URL to SVG/PNG icon |

#### `projects`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ID |
| `title` | VARCHAR(200) | NOT NULL | Project title |
| `slug` | VARCHAR(200) | NOT NULL, UNIQUE | URL-friendly identifier |
| `description` | TEXT | NOT NULL | Short summary |
| `content` | TEXT | | Detailed markdown content |
| `thumbnail_url` | TEXT | | Image URL |
| `stack` | JSONB | | List of technologies used |
| `github_url` | TEXT | | Link to repo |
| `live_url` | TEXT | | Link to live demo |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Timestamp |

#### `blog_posts`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ID |
| `title` | VARCHAR(255) | NOT NULL | Blog title |
| `slug` | VARCHAR(255) | NOT NULL, UNIQUE | URL-friendly identifier |
| `content` | TEXT | NOT NULL | Markdown body |
| `cover_image_url` | TEXT | | Header image URL |
| `published_at` | TIMESTAMPTZ | DEFAULT now() | Publication date |
| `is_draft` | BOOLEAN | DEFAULT TRUE | Visibility toggle |

#### `tags`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ID |
| `name` | VARCHAR(50) | NOT NULL, UNIQUE | Tag name (e.g., "ML", "React") |
| `slug` | VARCHAR(50) | NOT NULL, UNIQUE | URL-friendly tag |

#### `blog_post_tags`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `blog_id` | UUID | FK $\rightarrow$ `blog_posts(id)`, NOT NULL | Link to blog |
| `tag_id` | UUID | FK $\rightarrow$ `tags(id)`, NOT NULL | Link to tag |
| PRIMARY KEY (`blog_id`, `tag_id`) | | | Composite key |

#### `links`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ID |
| `platform` | VARCHAR(50) | NOT NULL | e.g., "LinkedIn", "GitHub" |
| `url` | TEXT | NOT NULL | Full link |
| `icon_class` | VARCHAR(100) | | CSS class for the icon |

### Analytics Tables

#### `visitor_sessions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `session_id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique session ID |
| `first_seen` | TIMESTAMPTZ | DEFAULT now() | Session start |
| `last_seen` | TIMESTAMPTZ | DEFAULT now() | Last heartbeat |
| `user_agent` | TEXT | | Browser/Device info |
| `location_summary` | VARCHAR(255) | | Rough location (City, Country) |

#### `page_views`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| `session_id` | UUID | FK $\rightarrow$ `visitor_sessions(session_id)` | Link to session |
| `path` | TEXT | NOT NULL | Requested URL path |
| `timestamp` | TIMESTAMPTZ | DEFAULT now() | Time of visit |
| `referrer` | TEXT | | Where they came from |

#### `blog_read_events`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| `blog_id` | UUID | FK $\rightarrow$ `blog_posts(id)`, NOT NULL | Link to blog |
| `session_id` | UUID | FK $\rightarrow$ `visitor_sessions(session_id)` | Link to session |
| `seconds_spent` | INTEGER | NOT NULL | Duration in seconds |
| `scroll_depth` | INTEGER | NOT NULL | Percentage (0-100) |
| `timestamp` | TIMESTAMPTZ | DEFAULT now() | Event time |

## 3. Indexing Strategy

### Foreign Key Indexes
To ensure join performance, indexes are created on all foreign keys:
- `skills(category_id)`
- `blog_post_tags(blog_id)`, `blog_post_tags(tag_id)`
- `page_views(session_id)`
- `blog_read_events(blog_id)`, `blog_read_events(session_id)`

### Analytics Indexes
For time-series aggregation (charts/dashboards):
- `page_views(timestamp)` $\rightarrow$ For "Visitors over time" queries.
- `blog_read_events(timestamp)` $\rightarrow$ For "Engagement over time" queries.
- `visitor_sessions(first_seen)` $\rightarrow$ For "New users per day" queries.
