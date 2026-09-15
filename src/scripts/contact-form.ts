/*
 * Netlify intercepta el POST del formulario y redirige a una página suya: el
 * `action` no admite un fragmento, así que el modal `:target` no sobreviviría a
 * un envío nativo. Enviando por AJAX conservamos el modal del sitio, y el
 * `action="/"` queda como plan B si el script no llega a cargar.
 *
 * El detector de formularios de Netlify lee el HTML estático del deploy: los
 * `name` de los campos y el `name` del propio formulario son suyos, no renombrar.
 */
const ENDPOINT = '/';

function payload(form: HTMLFormElement): string {
  const body = new URLSearchParams();

  new FormData(form).forEach((value, key) => {
    if (typeof value === 'string') body.append(key, value);
  });

  return body.toString();
}

function showError(form: HTMLFormElement, visible: boolean): void {
  form.querySelector<HTMLElement>('[data-contact-error]')?.classList.toggle('hidden', !visible);
}

function showSent(): void {
  // El hash abre el modal por `:target`; el enlace de cerrar lo limpia solo.
  window.location.hash = '#solicitud-enviada';
}

// Delegado en document: el formulario se reemplaza en cada navegación y, como
// cookies.ts, un módulo empaquetado sólo se ejecuta una vez.
document.addEventListener('submit', event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.hasAttribute('data-contact-form')) return;

  event.preventDefault();

  const submit = form.querySelector<HTMLButtonElement>('[data-contact-submit]');
  submit?.setAttribute('disabled', '');

  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload(form),
  })
    .then(response => {
      if (!response.ok) throw new Error(String(response.status));

      showError(form, false);
      form.reset();
      showSent();
    })
    .catch(() => {
      showError(form, true);
    })
    .finally(() => {
      submit?.removeAttribute('disabled');
    });
});
