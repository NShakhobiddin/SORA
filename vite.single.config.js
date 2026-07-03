import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Standalone build: one self-contained HTML file (JS, CSS and images
// inlined) that can be opened by double-clicking — no server needed.
// Also copied to the repo-root index.html for GitHub Pages (see package.json).
export default defineConfig({
  root: 'web',
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: '../dist-single',
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
  },
});
