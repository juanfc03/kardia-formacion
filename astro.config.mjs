// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kardiaformacion.es',
  trailingSlash: 'always',
  compressHTML: true,

  // Fonts are self-hosted at build time via Astro's Fonts API (Fontsource provider).
  // Add/remove a family here, then render its <Font /> in src/layouts/Layout.astro
  // and (optionally) map it to a Tailwind token in src/styles/global.css.
  fonts: [
    {
      // Display serif: editorial voice, real italic with SOFT + WONK axes.
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      provider: fontProviders.fontsource(),
      weights: ['100 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      // Body sans: neutral, uppercase labels and long-form text.
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.fontsource(),
      weights: ['100 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],

  build: {
    inlineStylesheets: 'always',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});
