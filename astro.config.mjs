// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify({
    // En local el emulador Deno de Edge Functions falla; en Netlify (producción) sigue igual
    devFeatures: {
      environmentVariables: false,
      images: true,
      edgeFunctions: false,
    },
  }),
  vite: {
    plugins: [tailwindcss()]
  }
});