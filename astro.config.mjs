// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

const GLYPH_EXTENSIONS = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.ts',
]);

/** @type {Set<string>} */
const glyphSet = new Set();

/** @type {Set<string>} */
const italicGlyphSet = new Set();

const ITALIC_SOURCE = /italic|oblique|<em\b|<i\b/;

/** @param {string} dir */
function collectGlyphs(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        collectGlyphs(join(dir, entry.name));
      }
      continue;
    }
    if (!GLYPH_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
    const text = readFileSync(join(dir, entry.name), 'utf8');
    const sets = ITALIC_SOURCE.test(text) ? [glyphSet, italicGlyphSet] : [glyphSet];
    for (const char of text) {
      const code = char.codePointAt(0) ?? 0;
      if (code < 32 || code === 127) continue;
      for (const set of sets) set.add(char);
    }
  }
}

collectGlyphs(join(process.cwd(), 'src'));
const glyphs = [...glyphSet].sort().join('');
const italicGlyphs = [...italicGlyphSet].sort().join('');

// Configuración de Astro: https://astro.build/config
export default defineConfig({
  site: 'https://kardiaformacion.es',
  trailingSlash: 'always',
  compressHTML: true,

  // Las fuentes se autoalojan en el build con la API de fuentes de Astro
  // (proveedor Google, con subset de glifos derivado de src/). Para añadir o
  // quitar una familia, edítala aquí, renderiza su <Font /> en
  // src/layouts/Layout.astro y, si quieres, mapéala a un token de Tailwind en
  // src/styles/global.css.
  fonts: [
    {
      // Serif display: voz editorial, itálica real con ejes SOFT + WONK.
      // La recta y la itálica se declaran por separado porque sus glifos se
      // derivan de fuentes distintas: la itálica solo aparece en unos pocos
      // textos (hero, cita de Equipo, rótulo de Sobre), así que su subset es menor.
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      provider: fontProviders.google(),
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      options: {
        experimental: {
          glyphs: [glyphs],
          variableAxis: {
            SOFT: [['0', '100']],
            WONK: [['0', '1']],
          },
        },
      },
      fallbacks: ['Georgia', 'serif'],
    },
    {
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      provider: fontProviders.google(),
      weights: ['100 900'],
      styles: ['italic'],
      subsets: ['latin'],
      options: {
        experimental: {
          glyphs: [italicGlyphs],
          variableAxis: {
            SOFT: [['0', '100']],
            WONK: [['0', '1']],
          },
        },
      },
      fallbacks: ['Georgia', 'serif'],
    },
    {
      // Sans de cuerpo: neutra, para etiquetas en mayúsculas y texto largo.
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.google(),
      weights: ['100 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      options: {
        experimental: {
          glyphs: [glyphs],
        },
      },
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
