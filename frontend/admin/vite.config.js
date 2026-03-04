import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5004,
    open: true
  },
  preview: {
    port: 5004,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '../shared'
    }
  }
});
