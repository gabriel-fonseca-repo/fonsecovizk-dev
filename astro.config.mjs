import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://fonsecovizk.dev',
  trailingSlash: "always",
  integrations: [mdx(), sitemap({
    changefreq: 'weekly',
    priority: 0.7,
  }), tailwind()]
});