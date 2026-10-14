# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## 📚 Blog Content Workflow

This portfolio uses a build-time pre-rendering system for blog posts based on Jupyter Notebooks.

### Adding a New Post
1. Create a Jupyter Notebook (`.ipynb`) in VS Code.
2. Ensure the first markdown cell contains a YAML frontmatter block for SEO:
   \`\`\`markdown
   ---
   title: My Awesome Post
   description: A deep dive into Perceptrons and Neural Networks.
   ---
   \`\`\`
3. Upload the `.ipynb` file to the `portfolio-assets` bucket in Supabase.
4. The build pipeline will automatically:
   - Download the notebook.
   - Extract and optimize images to `/public/blog-assets/`.
   - Generate a static HTML page with SEO meta tags and JSON-LD.
   - Update the sitemap and RSS feed.

### Triggering a Rebuild
- **Locally:** Run `npm run build`. This triggers the `prebuild` script and the `prerender` step.
- **Deployment:** Set up a deploy hook (Webhook) from your CMS or Supabase to trigger a new build on your hosting provider (e.g., Vercel, Netlify) whenever a notebook is updated.
