import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  // During local / AI Studio development server, always serve at root '/'
  if (command === 'serve') {
    return {
      base: '/',
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
      server: {
        // HMR is disabled in AI Studio via DISABLE_HMR env var.
        // Do not modify—file watching is disabled to prevent flickering during agent edits.
        hmr: process.env.DISABLE_HMR !== 'true',
        // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
    };
  }

  // During production build:
  // 1. Explicit VITE_BASE_PATH overrides everything if set
  // 2. Render environment (RENDER=true) uses '/'
  // 3. Default build targets GitHub Pages repository subpath: '/Innovators-HK26-0048/'
  let base = process.env.VITE_BASE_PATH;
  if (!base) {
    if (process.env.RENDER === 'true') {
      base = '/';
    } else {
      base = '/Innovators-HK26-0048/';
    }
  }

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
