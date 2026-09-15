/*
 * La tira de instalaciones se puede arrastrar con el dedo y aun así no tiene
 * final. El track lleva tres copias idénticas, de modo que desplazar el scroll
 * exactamente una copia equivale a no moverlo: el visitante no lo nota.
 *
 * La banda segura de scroll es [copia − ancho visible, 2·copia − ancho visible],
 * que mide exactamente una copia. Ese límite sale de que la animación desplaza
 * el track hasta una copia más: la ventana visible siempre cabe dentro del track
 * mientras el scroll no se salga de ahí. Y como la banda mide una copia justa,
 * el salto de ±1 copia no puede escaparse por el otro lado: no hay rebotes.
 */
let viewport: HTMLElement | null = null;
let track: HTMLElement | null = null;
let copyWidth = 0;
let bandMin = 0;
let bandMax = 0;
let loopable = false;

function measure(): void {
  if (!viewport || !track) return;

  // Una copia es un grupo de placas (incluye su padding de separación).
  const groups = [...track.children].filter(group => getComputedStyle(group).display !== 'none');
  const first = groups[0];
  copyWidth = first instanceof HTMLElement ? first.getBoundingClientRect().width : 0;

  bandMin = copyWidth - viewport.clientWidth;
  bandMax = copyWidth * 2 - viewport.clientWidth;
  // Con `prefers-reduced-motion` sólo queda una copia visible: no hay bucle.
  loopable = groups.length >= 3 && copyWidth > 0 && bandMax > 0;
}

// Punto de partida: el centro de la banda, con recorrido libre hacia los lados.
function home(): number {
  return (bandMin + bandMax) / 2;
}

function wrap(): void {
  if (!viewport || !loopable) return;

  if (viewport.scrollLeft < bandMin) viewport.scrollLeft += copyWidth;
  else if (viewport.scrollLeft > bandMax) viewport.scrollLeft -= copyWidth;
}

function reset(): void {
  measure();
  if (viewport && loopable) viewport.scrollLeft = home();
}

function initFilmstrip(): void {
  viewport = document.querySelector<HTMLElement>('[data-filmstrip]');
  track = viewport?.querySelector<HTMLElement>('.filmstrip-track') ?? null;

  if (!viewport || !track) return;

  if (viewport.dataset.filmstripReady !== 'true') {
    viewport.dataset.filmstripReady = 'true';
    viewport.addEventListener('scroll', wrap, { passive: true });
    // El observer dispara ya en su primera observación, con el layout hecho.
    new ResizeObserver(reset).observe(viewport);
  }

  reset();
}

initFilmstrip();

// Los scripts empaquetados se ejecutan una sola vez: hay que rearmarlo en cada
// navegación con view transitions, como en cookies.ts.
document.addEventListener('astro:page-load', initFilmstrip);
