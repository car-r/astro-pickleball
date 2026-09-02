import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.pickleballr.io',
  integrations: [
    tailwind(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/indexOld'),
    }),
  ],
  redirects: {
    '/blog/selkirk-vangaurd-air-power-invikta-review': {
      status: 301,
      destination: '/blog/selkirk-vanguard-air-power-invikta-review',
    },
  },
});
