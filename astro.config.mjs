// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// Configuración de Astro: https://astro.build/config
export default defineConfig({
  site: 'https://kardiaformacion.es',
  trailingSlash: 'always',
  compressHTML: true,

  // Las fuentes se autoalojan en el build con la API de fuentes de Astro
  // (proveedor Fontsource). Para añadir o quitar una familia, edítala aquí,
  // renderiza su <Font /> en src/layouts/Layout.astro y, si quieres, mapéala a un
  // token de Tailwind en src/styles/global.css.
  fonts: [
    {
      // Serif display: voz editorial, itálica real con ejes SOFT + WONK.
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      provider: fontProviders.fontsource(),
      weights: ['100 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      // Sans de cuerpo: neutra, para etiquetas en mayúsculas y texto largo.
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
    // esbuild y no lightningcss: lightningcss pliega `animation-timeline` dentro
    // del shorthand `animation` y borra el `backdrop-filter` sin prefijo, y las
    // dos declaraciones resultantes son inválidas en el Chrome actual. esbuild
    // las deja tal cual se escribieron, así que sobreviven las animaciones por
    // scroll y el desenfoque de la cabecera.
    build: {
      cssMinify: 'esbuild',
    },
    plugins: [tailwindcss()],
  },

  integrations: [
    // Las páginas legales se quedan fuera del sitemap: no interesa indexarlas.
    sitemap({
      serialize(item) {
        if (
          /aviso-legal|politica-de-cookies|politica-de-privacidad/.test(
            item.url,
          )
        ) {
          return undefined;
        }
        return item;
      },
    }),
  ],
});
