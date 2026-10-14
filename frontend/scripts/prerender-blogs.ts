import fs from 'fs-extra';
import path from 'path';
import { renderToString } from 'react-dom/server';
import React from 'react';

async function generateHTML(blogData: any, meta: any) {
  const title = meta.title || blogData.title;
  const description = meta.description || blogData.intro || '';
  const slug = blogData.slug;

  // Simple JSON-LD for BlogPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "datePublished": blogData.published_at,
    "author": {
      "@type": "Person",
      "name": "Suresh Khadka"
    }
  };

  // Construct the HTML shell
  // Since we are in a build script, we generate the HTML structure that Vite will later use 
  // or that we can just save as static files.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <link rel="stylesheet" href="/assets/index-NRoAjPya.css">
</head>
<body>
  <div id="root">
    <!-- Minimal SSR content for crawlers -->
    <article>
      <h1>${title}</h1>
      <p>${description}</p>
      <div class="blog-content">
        ${blogData.sections.map((s: any) => `<h2>${s.title}</h2>`).join('')}
      </div>
    </article>
  </div>
  <script src="/assets/index-CvSt-sD6.js"></script>
  <script>window.__INITIAL_DATA__ = ${JSON.stringify(blogData)};</script>
</body>
</html>`;
}

async function run() {
  try {
    const blogsDir = path.resolve('public/data/blogs');
    const files = await fs.readdir(blogsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && !f.endsWith('.meta.json'));

    await fs.ensureDir('dist/blogs');

    for (const file of jsonFiles) {
      const slug = path.basename(file, '.json');
      const blogData = await fs.readJson(path.join(blogsDir, file));
      const meta = await fs.readJson(path.join(blogsDir, `${slug}.meta.json`));

      const html = await generateHTML(blogData, meta);
      
      const outputDir = path.join('dist/blogs', slug);
      await fs.ensureDir(outputDir);
      await fs.writeFile(path.join(outputDir, 'index.html'), html);
      
      console.log(`Pre-rendered: /blogs/${slug}`);
    }
    console.log('Pre-rendering completed successfully!');
  } catch (err) {
    console.error('Pre-rendering failed:', err);
    process.exit(1);
  }
}

run();
