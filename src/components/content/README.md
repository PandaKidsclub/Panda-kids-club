# Content Components

- `ContentSection` owns a labelled collection heading, optional metadata/icon slot, and real "See all" destination.
- `ContentRail` owns native horizontal scrolling, proximity scroll snap, rail edge state, and previous/next controls. It never hijacks vertical wheel scrolling or advances automatically.
- `ProgrammeCard` owns 16:9 artwork geometry, small optional badge display, physical hover/focus response, selected styling, and preview-intent callbacks.
- `ProgrammeResultCard` owns the distinct catalogue-result pattern for Search and My List: its primary link opens Title Detail and its optional My List control is a sibling rather than a nested interactive element.

Use `src/lib/content` models so a future CMS or API can replace development fixtures without rewriting UI components. On living library pages, rails send card intent to `LibraryHeroPreviewProvider`; cards never own video elements or navigate directly to full programme playback. Monthly Updates uses the same rail and card primitives with page-local visual selection only, because its editorial masthead does not represent a selected programme.
