# Performance Budget

Panda Kids Club must remain fast even after video previews and selected 3D effects arrive.

Stage 3 performance rules:

- Keep the dependency surface lean.
- Avoid unnecessary client components.
- Do not add large libraries for future possibilities.
- Use semantic CSS and simple layout primitives.
- Keep route shells lightweight.
- Build media systems around lazy loading and poster fallbacks.
- Do not fetch preview media for card grids. Only the currently eligible hero selection may prepare media, and it should start from `preload="metadata"`.
- Pause hero playback outside the visible hero region and while the document is hidden. Do not add custom media caches in the application layer.
- Keep the hero video implementation to native browser media and no more than two bounded media slots.
- Keep category-page composition server-rendered. Stories, Learn, Heroes, and Specials reuse the one library-preview provider and hero rather than creating a media engine per rail. Monthly Updates remains a static editorial masthead with card-only rails.
- Do not preload `fullVideo` from libraries or Title Detail. Watch begins only after an explicit user journey into that route and uses metadata preload rather than speculative full-file download.
- Search filters the existing in-memory registry without per-keystroke network calls, search libraries, hidden media nodes, or media preloads. My List stores only slug identifiers and resolves those through the same registry without loading video.
- Stage 8 permits at most one optional hero Canvas, and only on the Home, Stories, Learn, Heroes, and Specials hero routes. It must be dynamically imported after eligibility checks for WebGL, no reduced motion, no Save-Data preference, a wide viewport, and a fine pointer.
- The optional scene must use 4-12 simple untextured meshes, `frameloop="demand"`, a DPR cap of 1.5, no shadows, and no post-processing. It may invalidate for pointer input and a short settle only; it must not run a continuous idle frame loop.
- Canvas failures, import failures, unsupported contexts, and context loss must remove the enhancement silently while the DOM hero continues to render. Never route navigation, readable content, search, saved-list behavior, title detail, or Watch through WebGL.

Future budgets should define concrete limits for JavaScript, media preload size, image dimensions, and video preview bitrates before those systems are expanded.

Heavy effects must never block core navigation, readable content, or route rendering.

For Stage 9 production media, the content validator accepts only canonical local media references under `public/media/programmes/<slug>/`. Browsing must keep card grids video-free and load at most the selected preview's metadata; full-programme bytes remain a Watch-only request. Do not treat large source-file size as permission to transcode or prefetch. The active three-programme pilot was verified locally with `206 video/mp4` range responses; delivery performance beyond this localhost check remains a deployment concern.
