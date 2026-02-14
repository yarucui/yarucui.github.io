import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://yarucui.github.io', 
  base: '/my-aesthetic-site/', // Change this to '/repo-name/' ONLY if your repo is NOT 'username.github.io'
  // markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});