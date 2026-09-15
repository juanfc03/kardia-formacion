const STORAGE_KEY = 'kardia-consent';

type Choice = 'accepted' | 'rejected';

function readChoice(): Choice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

function writeChoice(choice: Choice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Puede que el almacenamiento no esté disponible (modo privado); simplemente
    // no se recuerda la elección.
  }
}

function syncChoice(choice: Choice | null): void {
  const html = document.documentElement;

  if (choice) html.dataset.consent = choice;
  else delete html.dataset.consent;

  document.querySelectorAll<HTMLElement>('[data-consent-action]').forEach(control => {
    const isActive = choice !== null && control.dataset.consentAction === (choice === 'accepted' ? 'accept' : 'reject');
    control.dataset.active = String(isActive);
  });
}

// Google Maps es el único contenido de terceros, y solo existe mientras hay
// consentimiento: rechazar después de aceptar desmonta el iframe y repone la nota.
function syncMaps(choice: Choice | null): void {
  const accepted = choice === 'accepted';

  document.querySelectorAll<HTMLElement>('[data-map]').forEach(container => {
    const frame = container.querySelector<HTMLIFrameElement>('iframe.map-frame');
    const placeholder = container.querySelector<HTMLElement>('[data-map-placeholder]');

    if (!accepted) {
      frame?.remove();
      delete container.dataset.loaded;
      if (placeholder) placeholder.hidden = false;
      return;
    }

    if (container.dataset.loaded === 'true') return;

    const src = container.dataset.mapSrc;
    if (!src) return;

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.loading = 'lazy';
    iframe.title = container.dataset.mapTitle ?? 'Mapa de ubicación';
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.className = 'map-frame';

    container.append(iframe);
    container.dataset.loaded = 'true';
    if (placeholder) placeholder.hidden = true;
  });
}

function apply(choice: Choice | null): void {
  syncChoice(choice);
  syncMaps(choice);
}

function init(): void {
  const choice = readChoice();
  const banner = document.querySelector<HTMLElement>('[data-consent-root]');

  apply(choice);
  if (banner && choice === null) banner.dataset.visible = 'true';
}

init();

// Los módulos empaquetados se ejecutan una sola vez, así que hay que reconstruir
// el estado a mano tras cada navegación cliente. `astro:page-load` también salta
// en la primera carga.
document.addEventListener('astro:page-load', init);

// Delegado en document: los controles van y vienen con cada swap, así que se
// engancha una sola vez.
document.addEventListener('click', event => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const control = target.closest<HTMLElement>('[data-consent-action]');
  const action = control?.dataset.consentAction;
  if (action !== 'accept' && action !== 'reject') return;

  const choice: Choice = action === 'accept' ? 'accepted' : 'rejected';

  writeChoice(choice);
  apply(choice);

  document.querySelector<HTMLElement>('[data-consent-root]')?.removeAttribute('data-visible');
});
