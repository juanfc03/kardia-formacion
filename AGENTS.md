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

## Config that changes how you write code
- `astro.config.mjs` sets `site`, required by `@astrojs/sitemap` and `astro-og-canvas`.
- `trailingSlash: 'always'` → all internal links and generated routes must end in `/`.
- `build.inlineStylesheets: 'always'` → all CSS is inlined into every page (no shared CSS cache).
- Tailwind v4 via the `@tailwindcss/vite` Vite plugin (not `@astrojs/tailwind`). Entry: `src/styles/global.css`, imported once in `src/layouts/Layout.astro`.
- Tailwind v4 is CSS-first: tokens go in an `@theme` block in `src/styles/global.css` (today just `@import "tailwindcss";`). There is no `tailwind.config.js` and none should be created.
- Import alias `@/*` → `src/*` defined in `tsconfig.json` `paths` (native Astro aliasing). Use it instead of relative paths; do not add a Vite `resolve.alias`.
- TS preset `astro/tsconfigs/strict` enables `verbatimModuleSyntax` → use `import type` for type-only imports.
- Dependency build scripts are allowlisted in `pnpm-workspace.yaml` (`allowBuilds`) and `package.json` (`allowScripts`). Add entries there if a new native dep's install script is skipped.

## Repo state / gotchas
- No longer the starter template: `src/pages/index.astro` only renders `<Layout />`. Brand assets live in `src/assets/` (`logo.png` + `kardia-*.jpeg` photos); favicons and `site.webmanifest` in `public/`. No content collections or UI framework yet.
- `astro-og-canvas` is installed but there is no `src/pages/open-graph/` route yet.
- Keep the `Sitemap:` URL in `public/robots.txt` in sync with `site` in `astro.config.mjs`.
- `.opencode/` holds the `design-taste` skill (with its own `package.json`/`node_modules`) and `.opencode/commands/`; `skills-lock.json` pins installed skills. Don't edit these by hand.

## Docs
- Astro docs MCP is configured in `opencode.json` ("Astro docs") — prefer it over guessing. Full docs: https://docs.astro.build
