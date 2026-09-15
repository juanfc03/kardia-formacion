# Kardia · Centro de Formación

Web del centro de formación Kardia, en Belicena (Granada). Es un sitio estático
hecho con Astro y Tailwind CSS: no hay servidor ni base de datos.

Los textos de cada sección están escritos dentro de su componente en
`src/components/`; no hay gestor de contenidos.

## Requisitos

- Node 22.12 o superior
- pnpm (el proyecto usa `pnpm-lock.yaml`, no npm ni yarn)

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm install` | Instala las dependencias |
| `pnpm dev` | Servidor de desarrollo en `http://localhost:4321` |
| `pnpm build` | Comprueba los tipos y genera el sitio en `dist/` |
| `pnpm preview` | Sirve `dist/` para ver el resultado real del build |
| `pnpm check` | Solo comprueba los tipos |

`dev` sirve el CSS tal cual está escrito y `preview` sirve el build ya minificado.
Si tocas CSS o animaciones, míralo también en `preview`.

## Estructura

```text
src/
├── assets/       fotos y logo
├── components/   las secciones de la página (Hero, Servicios, Contacto…)
├── layouts/      plantilla HTML común a todas las páginas
├── pages/        una página por ruta (inicio y las tres legales) y la tarjeta Open Graph
├── scripts/      el poco JavaScript de cliente (cookies, tira de imágenes, formulario)
└── styles/       tokens de diseño y estilos globales
public/           favicons, manifiesto y robots.txt
```

## Despliegue

Se publica en Netlify con el comando `pnpm build` y el directorio `dist/`.
El formulario de contacto usa Netlify Forms, así que la detección de formularios
tiene que estar activada en el panel del sitio.

## Licencia

Todos los derechos reservados. Este código es público para consulta y aprendizaje, pero no tiene licencia de uso, modificación o distribución.
