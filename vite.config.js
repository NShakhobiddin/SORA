import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// App source lives in web/; the repo root holds the built site
// (root index.html) so GitHub Pages "deploy from branch" serves it as-is.
export default defineConfig({
  root: 'web',
  // relative base so the built site works from any URL path
  // (GitHub Pages subpath, nested folder on a server, etc.)
  base: './',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
