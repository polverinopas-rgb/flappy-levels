import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11', 'safari >= 12'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
  ],
  build: {
    target: 'es2018',      // compatibile Safari 12+
    cssTarget: 'safari13', // compatibile CSS
  }
});