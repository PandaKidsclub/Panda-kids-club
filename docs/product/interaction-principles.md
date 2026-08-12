# Interaction Principles

Panda Kids Club should eventually feel like a premium toy-console interface combined with a cinematic streaming platform.

Future controls may have subtle physical depth, soft edge highlights, layered shadows, restrained perspective response, tactile press states, and high-quality micro-interactions.

Core behavior to preserve in the architecture:

- Browsing starts with clear categories and readable programme cards.
- Hover is never the only path. Keyboard focus and touch selection must provide equivalent behavior.
- Library pages use one 400 ms hover and keyboard-focus preview-intent dwell before a card takes over that page's hero. Leaving before the dwell cancels it; leaving after selection does not revert it.
- A direct click or first touch selects the card without navigating to a programme. The hero Play control enters `/watch/[slug]`; the explicit More Info action enters `/title/[slug]` for the currently selected programme.
- Search uses a labelled native search field and updates the canonical `q` parameter with replace-state behavior while results filter locally. Empty queries do not dump the catalogue, results open Title Detail, and typing never moves focus into the results.
- My List is one shared manual saved-state action across the living hero, Title Detail, Search results, and the My List grid. Saved slugs are ordered most-recently-added first on the current browser/device; removing a grid item moves keyboard focus to the next removal control, previous control, or the page heading.
- The selected programme must remain programmatically identifiable through the card selection control without noisy live announcements.
- Reduced-motion preferences must have calm fallbacks.
- Autoplaying media must be muted, use pause and mute controls, and retain an explicit user pause across programme changes.
- Heavy visual effects must never block navigation or content access.

Selection is page-local: Home, Stories, Learn, Heroes, and Specials each initialize from their own configured featured programme. Monthly Updates is editorial rather than programme-led in Stage 5; its cards retain standard focus, hover, touch, rail, and local selected-state behavior without a hidden hero taking over the page. Lightweight hero preview selection does not implement full programme playback or title detail navigation from cards. Stage 8 may add low-amplitude DOM depth feedback and an optional decorative hero scene, but neither changes the selection model or takes over an essential route.

Watch uses a dedicated immersive shell with an internal Back destination. The route accepts only known Panda library paths or the current programme's Title Detail path, and otherwise falls back to that Title Detail route.

Search, My List, and programme playback do not generate search history, viewing history, recommendation signals, analytics, or profile data in Stage 7.

Dimensional feedback is reserved for a fine pointer: cards may lift and tilt slightly, navigation may feel gently pressed into its active state, and a hero can shift its media and atmosphere layers by a few pixels. Keyboard focus stays stable, touch does not depend on tilt, and data-saving or reduced-motion preferences use the complete non-3D experience.
