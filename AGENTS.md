# AGENTS.md

Astro 7 static site. Notes below are repo-specific; don't guess around them.

## Commands
- Package manager is **pnpm** (lockfile + `pnpm-workspace.yaml`). Do not use npm/yarn.
- `astro` is not on PATH here — always prefix with `pnpm astro`.
- Dev server runs in the background (native CLI support):
  - `pnpm astro dev --background`
  - `pnpm astro dev status` / `pnpm astro dev logs [--follow]` / `pnpm astro dev stop`
- `pnpm check` — type-check only (`astro check`).
- `pnpm build` — runs `astro check && astro build`; type errors fail the build. Output: `dist/`.
- `pnpm preview` — serve `dist/`.
- No lint/format scripts. Style source is `.prettierrc` (`singleQuote`, `arrowParens: avoid`).
- **`pnpm dev` serves CSS as authored; `pnpm preview` serves the minified build.** Anything touching CSS or animation must be checked in `preview` too — the `cssMinify` bug below stayed invisible for exactly that reason.
- On Windows PowerShell, `pnpm build 2>&1 | Select-Object -First N` **aborts the build** when the pipeline closes early. Filter with `-Last N`, or don't truncate.

## Config that changes how you write code
- `astro.config.mjs` sets `site`, required by `@astrojs/sitemap` and `astro-og-canvas`.
- `trailingSlash: 'always'` → all internal links and generated routes must end in `/`.
- `build.inlineStylesheets: 'always'` → all CSS is inlined into every page (no shared CSS cache).
- **`vite.build.cssMinify` is pinned to `'esbuild'` on purpose — do not revert it to the default.** Astro's default (lightningcss) rewrites two things into CSS that current browsers reject:
  - it folds `animation-timeline` into the `animation` shorthand (`animation: linear both foo scroll()`). That form is in the spec but **no engine implements it yet**, so the browser drops the whole declaration. Measured in Chrome 152: `CSS.supports('animation-timeline', 'scroll()')` → true, `CSS.supports('animation', 'linear both foo scroll()')` → false.
  - it deletes the unprefixed `backdrop-filter` and keeps only `-webkit-backdrop-filter`, which Chrome does not support (only Safari does), so the blur disappears.
  - Blast radius when reverted: the header loses its blur and its scroll-driven solidify plus the bottom hairline, `.reveal` stops animating, and the Equipo parallax stops moving. All of them degrade to static content, so the only visible symptom is the header looking different from `dev`.
- esbuild does no vendor prefixing, so write the prefixed line yourself when Safari needs it. Current hand-written prefixes: `backdrop-filter` + `-webkit-backdrop-filter` (Header), `-webkit-mask-image` + `mask-image` (Instalaciones, as arbitrary properties), `-webkit-text-size-adjust` (global.css).
- Tailwind v4 via the `@tailwindcss/vite` Vite plugin (not `@astrojs/tailwind`). Entry: `src/styles/global.css`, imported once in `src/layouts/Layout.astro`.
- Tailwind v4 is CSS-first: tokens go in an `@theme` block in `src/styles/global.css`. There is no `tailwind.config.js` and none should be created.
- Import alias `@/*` → `src/*` defined in `tsconfig.json` `paths` (native Astro aliasing). Use it instead of relative paths; do not add a Vite `resolve.alias`.
- TS preset `astro/tsconfigs/strict` enables `verbatimModuleSyntax` → use `import type` for type-only imports.
- Dependency build scripts are allowlisted in `pnpm-workspace.yaml` (`allowBuilds`) and `package.json` (`allowScripts`). Add entries there if a new native dep's install script is skipped.

## Fonts
- Self-hosted via Astro's Fonts API (`fonts` in `astro.config.mjs`), Fontsource provider. No runtime Google Fonts request; `.woff2` files are emitted under `dist/_astro/fonts/`.
- Families: `Fraunces` (display, variable `wght` + real italic, SOFT/WONK axes) → `--font-fraunces`; `Inter` (body/labels, variable) → `--font-inter`.
- To add a family: add an entry to `fonts` in `astro.config.mjs`, render `<Font cssVariable="--font-x" />` in `src/layouts/Layout.astro`, and (optionally) map it in the `@theme inline` block of `src/styles/global.css`. Use `<Font ... preload />` only for fonts visible above the fold; never add `@fontsource-variable/*` imports to components — the provider is the single loading mechanism.
- Tailwind utilities: `font-sans` → Inter, `font-display` → Fraunces. The Fraunces SOFT/WONK axes ride on the `font-display` utility itself (`--font-display--font-variation-settings` in the `@theme inline` block). There is no `--display-variation-settings` variable and no `.font-display` class: use the utility.

## CSS conventions (utility first)
- Markup carries the utilities; component `<style>` blocks keep **only** what utilities cannot express. Those exceptions are deliberate: decorative `::before`/`::after`, `@keyframes`, `:target` state (mobile menu, confirmation modal), `:nth-child` stagger delays, scroll-driven animation wiring, `[data-consent]` state, descendant rules that need a parent hook, the JS-created `.map-frame` iframe, and `.prose-editorial` (long-form child-selector scope, the `@tailwindcss/typography` pattern).
- **No dead classes.** A class stays on a tag only while some CSS rule selects it: `site-header`, `nav-link`, `menu-panel/top/link/foot`, `hero`, `hero-stack/plate/kicker/title/sub/actions/media`, `sobre-sign`, `equipo-quote`, `consent-title`, `consent-state`, `map`, `confirm*`, `footer-link`, plus the shared `reveal`, `parallax-frame`, `rotate-stack` and `filmstrip-viewport/track`. The utilities-first pass deleted ~1,700 lines of scoped CSS and every wrapper class that came with them — don't reintroduce them.
- Tokens live in `@theme` in `src/styles/global.css` (OKLCH colors, `--radius-plate/control`, `--ease-*`, `--breakpoint-xs: 26rem`). Prefer the generated utilities (`bg-paper-2`, `text-ink-soft`, `border-line`, `rounded-plate`, `ease-out-strong`, `xs:`) over arbitrary values; arbitrary values are fine for one-off geometry (`text-[1.35rem]`, `gap-[0.9rem]`).
- Opacity modifiers (`border-ink/34`, `border-line/70`) compile to the same `color-mix(in oklab, …)` as the hand-written values they replaced, so they are exact, not approximations.
- Tailwind's `hover:` compiles to `@media (hover: hover)`, while the pre-refactor CSS used `(hover: hover) and (pointer: fine)`. Identical on phones and desktops; don't assume `pointer: fine` gating comes with `hover:`.
- A base rule in `global.css` gives `pointer` to `button`, `label`, `summary`, `[role=button]` and checkboxes; links get it from the browser. Don't add per-component cursor rules.

## Motion
- Scroll-driven (`@media (prefers-reduced-motion: no-preference)` + `@supports (animation-timeline: …)`, degrading to visible static content): `.reveal` / `.reveal-slow` on `view()`, `.parallax-frame img` on `k-parallax / view()`, and the header's `::before` (solidify) and `::after` (hairline) on `scroll()`. All four depend on the `cssMinify: 'esbuild'` pin above.

## LCP / critical path (mobile is the constraint)
- **Never animate the opacity or transform of an ancestor of the LCP image.** Chrome will not report the image as painted while a container is fading in, and it costs about a second: the hero's `hero-rise` on `.hero-media` made the mobile LCP 2.1 s; removing it (keeping the animation on the copy) took it to ~1.0 s. Same reason `.rotate-stack > :first-child` is a static base: the plates 2 and 3 crossfade *on top of it*.
- Image priorities in the hero (`Hero.astro`): the first plate is `loading="eager" fetchpriority="high"` with all widths; the other two are `fetchpriority="low"` with `widths: [480, 768]` because they are only visible from second 8 and second 16 — 250 KB of decorative plates used to compete with the LCP image.
- `sizes` for the hero is `(min-width: 1024px) 46vw, 62vw`. The 62vw is deliberate: at 88vw a 2.6x phone picks the 1100w candidate (143 KB) where 768w (60 KB) is enough for a 364 px slot.
- The filmstrip is `loading="lazy" fetchpriority="low"`. It sits 5,000 px down the page; loading its 18 images eagerly cost ~300 KB of the LCP's bandwidth (and 6 requests once the duplicates are cached).
- Fonts: only the upright Fraunces is preloaded (`preload={[{ subset: 'latin', style: 'normal' }]}`). Preloading the italic too added 146 KB to the critical path for one word of the hero title.
- Measure LCP with the built output (`pnpm preview`, not `dev`) under Slow 4G + 4x CPU throttling, reading the LCP element from a `PerformanceObserver` — the element and its `renderTime` vs `loadTime` tell you whether you are network-bound (bytes) or render-bound (animation).

- Filmstrip (Instalaciones): the track holds **three identical copies** of the six plates because two only stay covered while the viewport is narrower than one copy. `k-marquee` travels exactly one copy (`translate3d(calc(-100% / 3))`), so changing the copy count means changing the keyframe **and** the multiples in `src/scripts/filmstrip.ts`.
- The first copy is `loading="eager"` so the duplicates render from cache; measured, 18 `<img>` produce 6 network requests. The strip is draggable on purpose (`overflow-x: auto`) and `filmstrip.ts` keeps `scrollLeft` inside `[copy − viewport, 2·copy − viewport]`, wrapping by one copy. That band is not arbitrary: `2·copy − viewport` is the coverage limit once the animation's one-copy shift is added, and widening it makes blank track visible.

## Scripts and view transitions
- `<ClientRouter />` (in `src/layouts/Layout.astro`) enables client-side navigation. Bundled module scripts execute **once**, so anything that must survive a swap re-arms on `astro:page-load` (`src/scripts/cookies.ts`, `src/scripts/filmstrip.ts`) and delegates events on `document` for controls that get replaced.
- **The router also intercepts `<form>` submits** (GET and POST, `multipart/form-data` for POST) and swaps the response into the page. Any real form submission needs `data-astro-reload` on the `<form>`, or the router swallows the POST and its own fetch navigates away. Same attribute opts a link out on `<a>`.
- Consent: `cookies.ts` is the only gate for the Google Maps iframe (`[data-map]` + `[data-map-placeholder]`) — accepting loads it, rejecting tears it down — and mirrors the choice on `<html data-consent>`; the visible wording of that state is CSS (`[data-consent-label]::after`), not text patched from JS.
- Contact form (`contact-form.ts`) posts to Netlify over AJAX so the site keeps its own `:target` confirmation modal: a native POST would be redirected to a Netlify page, and `action` cannot be a fragment. Flow: prevent default → `fetch('/')` url-encoded → reset the form → `location.hash = '#solicitud-enviada'` (the hash is the only thing that opens the modal; `history.pushState` updates the URL but **not** `:target`). On failure it reveals `[data-contact-error]` instead, and `action="/"` is the no-JS fallback.
- No other client JS. `contenido-kardia.md` is the single source of truth for copy: don't rewrite it.

## Netlify forms
- The form is detected by parsing the **deployed HTML**, so every control needs a unique `name` and the `<form>` needs `name` + `method="POST"` + `data-netlify="true"` (`data-netlify` is stripped from the served HTML, so never select the form by it — the hook is `data-contact-form`). Renaming a field or the form silently empties the submissions.
- `form-name` and the `bot-field` honeypot are written by hand: the hidden input is what makes the AJAX body valid regardless of the build step, and the honeypot wrapper is `class="hidden" aria-hidden="true"` (`autocomplete="off"` so browsers don't autofill it — a filled honeypot drops the submission as spam without any visible error).
- `netlify-honeypot="bot-field"` is read by Netlify at deploy time; form detection must also be enabled in the site panel (Forms → Enable form detection) or every POST 404s. Neither can be rehearsed locally: `serve-post.cjs` in the temp dir is the stand-in that captures the request body.


## Repo state / gotchas
- No longer the starter template: `src/pages/index.astro` only renders `<Layout />`. Brand assets live in `src/assets/` (`logo.png` + `kardia-*.jpeg` photos); favicons and `site.webmanifest` in `public/`. No content collections or UI framework yet.
- Keep the `Sitemap:` URL in `public/robots.txt` in sync with `site` in `astro.config.mjs`.
- `.opencode/` holds the `design-taste` skill (with its own `package.json`/`node_modules`) and `.opencode/commands/`; `skills-lock.json` pins installed skills. Don't edit these by hand.

## Open Graph image
- `src/pages/open-graph/[...route].ts` renders one 1200×630 card with `astro-og-canvas` (CanvasKit, at build time) served at `/open-graph/kardia.png`; `Layout.astro` points `og:image` at it for every page. The card's `title`/`description` are its own copy, not the page's `description` prop.
- **pnpm needs `canvaskit-wasm` as a direct dependency** — the package resolves its own wasm through `__dirname`, so without the top-level entry the build dies with `__dirname is not defined`. Do not remove it.
- Card fonts are vendored as `.ttf` in `src/assets/fonts/` (latin subsets from Fontsource) because CanvasKit cannot read the `.woff2` files Astro's Fonts API emits. They duplicate the families in `astro.config.mjs`; if you add a family to the OG card, download its `.ttf` yourself.
- The renderer does **not** bottom-align the text: with a `logo` it clamps the paragraph to the band right below it (top ≈ `padding + logoHeight + padding`), so a short paragraph leaves the bottom third empty and a long one runs off the card. Copy, font sizes and `padding` are tuned against that. Note `logo.size` scales the whole 500×500 canvas — the drawing only fills its middle ~64%, so ask for ~1.5x the size you want to see.
- Both the logo and the fonts are hashed into the cache key in `node_modules/.astro-og-canvas`, so editing them or any option regenerates the image. Colours in the route are the OKLCH tokens converted to RGB, not new palette values.

## Docs
- Astro docs MCP is configured in `opencode.json` ("Astro docs") — prefer it over guessing. Full docs: https://docs.astro.build
