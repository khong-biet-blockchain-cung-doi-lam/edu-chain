





import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5003,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '../../shared'
    }
  }
});