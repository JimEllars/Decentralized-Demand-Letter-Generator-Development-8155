import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    historyApiFallback: true,
  },
   build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion', 'react-icons'],
          // Combine pdfmake and its fonts into one chunk to ensure they stay linked
          pdf: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts'],
        },
      },
    },
    chunkSizeWarningLimit: 2000, // Increased limit since fonts are large
  },
});