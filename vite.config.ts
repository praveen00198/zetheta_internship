import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
          upload: ['react-dropzone'],
          signature: ['react-signature-canvas'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-hook-form', 'zod'],
  },
});
