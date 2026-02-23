import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5006,
    strictPort: true,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '../../shared'
    }
  }
});