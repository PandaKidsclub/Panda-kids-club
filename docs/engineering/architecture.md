# Architecture

Stage 0 uses a lean Next.js App Router foundation with React, TypeScript, strict type checking, semantic HTML, and CSS custom properties.

Directory responsibilities:

- `src/app` - route shells and root layout
- `src/components/shell` - global application frame
- `src/components/layout` - page and section layout primitives
- `src/components/hero` - hero presentation components
- `src/components/content` - section, rail, and programme-card components
- `src/components/ui` - reusable controls
- `src/components/placeholder` - neutral development-only placeholders
- `src/lib/content` - CMS-ready content contracts and neutral fixtures
- `src/lib/theme` - theme names shared by routes and components
- `src/features/hero` - reusable library HeroStage state boundaries
- `src/features/interaction` - browser-only, requestAnimationFrame-throttled pointer-depth hooks

Prefer server components by default. Add client components only when local interactivity, browser APIs, or React state require them.

Avoid global state libraries until there is a clear need. `LibraryHeroPreviewProvider` uses a small React context for a page-local selected programme, centralized preview intent, playback preferences, and visibility state; it does not introduce a global-state dependency.

Do not add databases, authentication, CMS integrations, analytics, payments, GSAP, or a video player dependency. Three.js and React Three Fiber are limited to the optional Stage 8 hero-depth enhancement; no other route or feature may depend on a Canvas for essential UI.

Hero composition is split into `HeroMediaLayer`, `HeroAtmosphere`, `HeroScrim`, `HeroContent`, and `HeroControlsSlot`. Shell stacking uses page environment, hero, sticky navigation, then transient control surfaces; components should use the named z-index tokens rather than arbitrary values.

Home, Stories, and Learn remain server-rendered while `ContentRail` provides a small client boundary for native scroll position, resize-aware previous/next availability, selected-card presentation, and preview-intent forwarding. `ContentSection` owns collection semantics and destinations; `ProgrammeCard` owns card geometry and interaction presentation.

`LibraryPage` composes the shared hero provider, `HeroStage`, and data-driven `ContentSection` records for normal category routes. Home uses the same provider directly; Stories, Learn, Heroes, and Specials reuse `LibraryPage`. Each route passes an explicit featured fixture, so selection never leaks across page changes. `ComingSoonPage` is deliberately separate: its server layer resolves the single release configuration while `ComingSoonShowcase` owns the bounded, interactive 15-title deck, independent countdown, and two-layer background crossfade. The legacy `/monthly-updates` route permanently redirects to it. The fixture registry exposes shared ID and slug lookups for neutral Home, Story, Learn, Hero, Special, and Monthly records. `HeroMediaLayer` owns the native media DOM, poster-first rendering, media events, and bounded two-slot switching; it guards each event with the latest source/generation so an obsolete preview cannot take over. Cards remain video-free, and `HeroStage` remains the only browser-preview surface.

`TitleDetailPage` is server-rendered from the same Programme registry and provides static programme context, Play, and a shared My List control. `WatchPlayer` is a focused client boundary with a separate controls component and formatting utility; it is the only full-programme media surface. `AppShell` removes the global header only for `/watch/[slug]`, keeping the change local without duplicating the existing shell. Shared Watch-link helpers create and validate internal return paths.

`SearchCatalogue` is a focused client boundary that derives its index from `allDevelopmentProgrammes`; it has no remote API, media preload, or separate catalogue copy. Its canonical URL parameter is `q`, and result cards link to Title Detail rather than driving a library hero. `MyListProvider` is the one shared client state boundary for saved programmes. It persists only known programme slugs in `panda-kids-club.my-list.v1` as `{ version: 1, slugs: string[] }`, reads before any write, tolerates unavailable or malformed storage with in-memory state, and listens for browser `storage` events to synchronize other tabs. The provider is intentionally small so future authenticated profile storage can replace this persistence layer without rewriting controls. My List remains device-local in Stage 7; it has no profiles, account API, viewing history, recommendations, or search-history storage.

Stage 8 keeps dimensional interaction DOM-first. `usePointerDepthSurface` writes scoped CSS variables from fine-pointer events without React state in the hot path. The earlier optional Hero depth module is intentionally unmounted so programme previews remain visually clear; no route mounts a decorative Canvas. Search, My List, Title Detail, Monthly Updates, and Watch remain Canvas-free.

Stage 9 adds `src/lib/content/production` as the single production-pilot source. Its JSON manifest is read by both the typed registry seam and the Node content validator. Production records join the shared registry and use declarative route/section placement; page components never inspect incoming folders or title-specific conditions. `incoming/pilot` remains staging only. The active three-record pilot serves approved files from `public/media/programmes/<slug>/`; the validator enforces the exact record count and keeps every other staged package out of the application.

Stage 11 adds `src/lib/media` below the content registry. `media-config.ts` validates the only public media-origin configuration and `resolve-programme-media.ts` maps every programme-owned asset coherently before a route or client boundary receives it. This preserves stable programme identity and canonical source paths while allowing direct CDN delivery later. Next Image and CSP both read the same validated configuration; no UI component reads a media-host environment variable.

The post-pilot catalogue pipeline keeps this invariant by writing later approved records to a separate `catalogue-manifest.json`. `content:scan` reads only `incoming/catalogue/<title-slug>/`; `content:publish` converts a READY package into canonical public files and a typed record only after an explicit non-dry-run command. The shared registry combines pilot and live catalogue records, while its validation rejects duplicate ids or slugs across both manifests.
