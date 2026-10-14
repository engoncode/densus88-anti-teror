import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  publicDir: false,
  build: {
    outDir: 'docs/.guide-build',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve('guide-entry.html'),
      output: { inlineDynamicImports: true },
    },
  },
});
