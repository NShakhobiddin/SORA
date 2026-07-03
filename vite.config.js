import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // relative base so the built site works from any URL path
  // (GitHub Pages subpath, nested folder on a server, etc.)
  base: './',
  plugins: [react()],
});
