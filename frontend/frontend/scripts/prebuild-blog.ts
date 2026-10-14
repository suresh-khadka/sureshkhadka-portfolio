import { createClient } from '@supabase/supabase-js';
import fs from 'fs-extra';
import path from 'path';
import { Sitemap } from 'sitemap';
import RSS from 'rss';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY is missing in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchNotebooks() {
  console.log('Fetching blog metadata...');
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select(`
      id, title, intro, cover_image_url, published_at, slug,
      tags(name, slug),
      sections(
        id, title, slug, order,
        notebooks(id, title, storage_path, order)
      )
    `);

  if (error) throw error;
  return blogs;
}

async function processNotebook(blog: any, notebook: any) {
  const slug = blog.slug || 'unknown';
  const storagePath = notebook.storage_path;

  console.log(`Downloading notebook: ${notebook.title}...`);
  const { data, error } = await supabase.storage
    .from('portfolio-assets')
    .download(storagePath);

  if (error) throw error;

  const content = await data.text();
  const json = JSON.parse(content);

  // Process images in cells
  for (const cell of json.cells) {
    if (cell.cell_type === 'code' && cell.outputs) {
      for (const output of cell.outputs) {
        if (output.output_type === 'display_data' && output.data['image/png']) {
          const base64 = output.data['image/png'];
          const imgName = `img_${Math.random().toString(36).substring(7)}.png`;
          const imgPath = `blog-assets/${slug}/${imgName}`;
          const fullPath = path.resolve('frontend/public', imgPath);

          await fs.ensureDir(path.dirname(fullPath));
          const buffer = Buffer.from(base64.startsWith('data:image')
            ? base64.split(',')[1]
            : base64, 'base64');
          await fs.writeFile(fullPath, buffer);

          output.data['image/png'] = `/${imgPath}`;
        }
      }
    }
  }

  return json;
}

async function generateSEO(blog: any, notebooks: any[]) {
  let meta = {
    title: blog.title,
    description: blog.intro,
    date: blog.published_at,
    tags: blog.tags.map((t: any) => t.name)
  };

  if (notebooks.length > 0) {
    const firstNb = notebooks[0];
    const firstCell = firstNb.cells.find((c: any) => c.cell_type === 'markdown');
    if (firstCell) {
      const content = Array.isArray(firstCell.source) ? firstCell.source.join('') : firstCell.source;
      const match = content.match(/^---\s*([\s\S]*?)\s*---/);
      if (match) {
        const yaml = match[1];
        const lines = yaml.split('\n');
        lines.forEach(line => {
          const [key, ...val] = line.split(':');
          if (key && val) {
            const k = key.trim().toLowerCase();
            const v = val.join(':').trim();
            if (k === 'title') meta.title = v;
            if (k === 'description') meta.description = v;
          }
        });
      }
    }
  }
  return meta;
}

async function run() {
  try {
    const blogs = await fetchNotebooks();
    const sitemap = new Sitemap('https://yourdomain.com');
    const rssFeed = new RSS({
      title: 'Suresh Khadka Portfolio Blog',
      site_url: 'https://yourdomain.com',
      feed_url: 'https://yourdomain.com/rss.xml',
    });

    await fs.ensureDir('frontend/public/data/blogs');

    for (const blog of blogs) {
      const slug = blog.slug || 'unknown';
      console.log(`Processing blog: ${blog.title}...`);

      const processedNotebooks = [];
      for (const section of blog.sections) {
        for (const notebook of section.notebooks) {
          const processed = await processNotebook(blog, notebook);
          processedNotebooks.push(processed);
        }
      }

      const meta = await generateSEO(blog, processedNotebooks);

      await fs.writeJson(`frontend/public/data/blogs/${slug}.json`, {
        ...blog,
        notebooks: processedNotebooks
      });
      await fs.writeJson(`frontend/public/data/blogs/${slug}.meta.json`, meta);

      sitemap.addUrl(`/blogs/${slug}`);
      rssFeed.item({
        title: meta.title,
        description: meta.description,
        url: `https://yourdomain.com/blogs/${slug}`,
        date: new Date(blog.published_at),
      });
    }

    await fs.writeFile('frontend/public/sitemap.xml', sitemap.toString());
    await fs.writeFile('frontend/public/rss.xml', rssFeed.xml());
    await fs.writeFile('frontend/public/robots.txt', 'User-agent: *\nAllow: /');

    console.log('Pre-build blog pipeline completed successfully!');
  } catch (err) {
    console.error('Pre-build failed:', err);
    process.exit(1);
  }
}

run();
