import { OGImageRoute } from 'astro-og-canvas';

/*
 * Tarjeta Open Graph del sitio: 1200×630 generada en el build con CanvasKit.
 * Layout.astro la publica en `og:image`.
 *
 * Los colores son los tokens de src/styles/global.css (OKLCH) convertidos a RGB,
 * y las tipografías son las mismas de la web: Fraunces para el titular e Inter
 * para el pie. Van en .ttf dentro de src/assets/fonts porque CanvasKit no sabe
 * leer los .woff2 que genera la API de fuentes de Astro, y tenerlas en el repo
 * evita que el build dependa de la red.
 */
type RGB = [number, number, number];

const PAPEL_CLARO: RGB = [252, 250, 244];
const PAPEL: RGB = [241, 234, 222];
const TINTA: RGB = [53, 37, 27];
const TINTA_SUAVE: RGB = [98, 81, 71];
const TERRACOTA: RGB = [180, 85, 45];

const tarjetas = {
  kardia: {
    title: 'Bienvenido a Kardia',
    description: 'Donde la educación nace de dentro y llega muy lejos. Centro de formación en Belicena, Granada.',
  },
};

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: tarjetas,

  getImageOptions: (_clave, tarjeta) => ({
    title: tarjeta.title,
    description: tarjeta.description,

    // Papel de arriba abajo, como la luz cálida de las secciones de la web.
    bgGradient: [PAPEL_CLARO, PAPEL],
    border: { color: TERRACOTA, width: 8, side: 'block-end' },
    padding: 72,

    logo: {
      path: './src/assets/logo.png',
      // La ilustración sólo ocupa el centro de su lienzo: 144 deja la marca en ~92.
      size: [144],
    },

    fonts: ['./src/assets/fonts/fraunces-600.ttf', './src/assets/fonts/inter-400.ttf'],
    font: {
      title: {
        families: ['Fraunces'],
        weight: 'SemiBold',
        size: 72,
        lineHeight: 1,
        color: TINTA,
      },
      description: {
        families: ['Inter'],
        weight: 'Normal',
        size: 38,
        lineHeight: 1.4,
        color: TINTA_SUAVE,
      },
    },
  }),
});
