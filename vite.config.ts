import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // 必须使用相对路径，否则在 Android Capacitor 环境下会导致白屏，同时兼顾 GitHub Pages
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
