# Panda Kids Club

Panda Kids Club is the foundation for a premium children's streaming and video-library web application. Stage 0 establishes the repository architecture, documentation, routing, tokens, and future-facing content contracts only. It intentionally contains no production programme content, real titles, artwork, videos, authentication, CMS, analytics, payments, or video player.

## Stack

- Next.js App Router
- React
- TypeScript
- CSS custom properties for design tokens and page themes
- Three.js and React Three Fiber for one lazy, decorative hero-depth enhancement
- ESLint and TypeScript validation
- pnpm package management

## Getting Started

```bash
pnpm install
pnpm dev
```

## Development Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm validate:content
pnpm content:scan
pnpm content:report
pnpm content:publish -- --dry-run <title-slug>
pnpm content:publish -- <title-slug>
pnpm test:content
pnpm test:media
pnpm production:check
pnpm test:shop
pnpm shopify:check
pnpm media:check -- https://media.<panda-domain>
```

## Architecture Overview

- `src/app` contains App Router route shells.
- `src/components/shell` contains the global application frame.
- `src/components/layout` contains page and section primitives.
- `src/components/hero` contains the DOM-first hero plus its optional lazy depth-scene boundary.
- `src/components/content` contains section, rail, programme-card, and result-card components.
- `src/components/ui` contains small reusable controls.
- `src/lib/content` contains CMS-ready TypeScript content models and neutral development fixtures.
- `src/lib/theme` contains typed page-theme names.
- `src/features/hero` contains future HeroStage state interfaces and a lightweight hook boundary.
- `src/features/search` derives local catalogue search results from the shared programme registry.
- `src/features/my-list` owns device-local saved-slug persistence and shared My List state.
- `src/features/interaction` owns requestAnimationFrame-throttled DOM pointer-depth behavior.
- `src/lib/content/production` contains the typed, JSON-backed Stage 9 pilot manifest and registry seam.
- `scripts/content-scan.mjs` and `scripts/content-publish.mjs` provide the staged catalogue readiness and human-approved publication workflow.
- `docs` contains durable product, design, and engineering rules.

## Routes

- `/` - Home
- `/stories` - Stories
- `/learn` - Learn
- `/heroes` - Heroes
- `/specials` - Specials
- `/my-list` - Device-local saved programme collection
- `/coming-soon` - Cinematic upcoming-title release event
- `/monthly-updates` - Permanent redirect to `/coming-soon`
- `/search` - Local catalogue Search, with shareable `q` query state
- `/shop` - Guardian-oriented Panda Shop; Shopify-backed when configured, deliberate demo mode otherwise
- `/shop/[handle]` - Merchandise product detail and Shopify Cart entry point
- `/title/[slug]` - Programme title detail
- `/watch/[slug]` - Dedicated programme playback shell

## Project Rules

Start with [AGENTS.md](AGENTS.md), then read the relevant documentation in `docs/` before making product, design, or engineering changes.

The Stage 9A pilot has exactly three active production Programmes: Ant and Elephant, Honey, and Sello speaks Sign Language. `incoming/pilot/` remains staging only; their approved files are served from `public/media/programmes/<slug>/`, and `pnpm validate:content` enforces the three-record activation limit.

Stage 11 keeps canonical programme paths local by default and resolves them through one production-media boundary only when `NEXT_PUBLIC_MEDIA_BASE_URL` is configured. The app never proxies programme videos. Read [Production Media Deployment](docs/engineering/production-deployment.md) and the [Cloudflare R2 Media Operator Guide](docs/operations/cloudflare-r2-media.md) before configuring a real media origin.

Later approved catalogue packages enter through `incoming/catalogue/<title-slug>/`. Run `pnpm content:scan`, review a READY package with `pnpm content:publish -- --dry-run <title-slug>`, then publish only after human approval with `pnpm content:publish -- <title-slug>`. See [Catalogue Content Pipeline](docs/engineering/catalogue-content-pipeline.md).

The Stage 8 depth scene is an enhancement, not an application surface: it is lazy, demand-rendered, restricted to eligible hero routes, and absent from search, saved-list, title-detail, editorial, and watch experiences. The DOM remains the accessible source of truth.
