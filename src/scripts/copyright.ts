function setYear(): void {
  document.querySelectorAll<HTMLElement>('[data-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
}

setYear();

// Los módulos empaquetados se ejecutan una sola vez, así que hay que reescribir
// el año tras cada navegación cliente. `astro:page-load` también salta en la
// primera carga.
document.addEventListener('astro:page-load', setYear);
