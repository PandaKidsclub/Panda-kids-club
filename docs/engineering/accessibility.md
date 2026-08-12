# Accessibility

Accessibility is mandatory.

Foundational expectations:

- Use semantic landmarks for header, navigation, main content, and sections.
- Provide visible focus states.
- Maintain adequate contrast across page themes.
- Use labelled controls.
- Preserve keyboard navigation.
- Make touch targets comfortable.
- Respect `prefers-reduced-motion`.
- Provide labelled, keyboard-accessible pause and mute controls for autoplaying media.
- Ensure hover interactions have keyboard-focus and touch equivalents. Library-page focus selection uses the same 400 ms intent dwell as pointer selection, while touch selects immediately without starting full programme playback.
- Keep preview autoplay muted and expose no noisy live announcements while people explore cards.
- Preserve a user's explicit pause decision across programme changes; automatic offscreen and document-hidden pauses are separate from that preference.
- Category page H1 describes the route identity, while a selected programme may be the cinematic hero's H2. Visible collection headings identify their native sections and rail regions. Monthly Updates has one visible page H1, a semantic 15-title release summary, and visible H2 rail headings for its three release groups.
- Title Detail has a programme H1 and explicit Play/My List actions. Watch has a dedicated Back link, labelled native range controls, visible focus, an accurate unavailable/error status, and no continuously updating live region for playback time. Keyboard shortcuts supplement visible controls: Space/K, arrow keys, M, F, and C apply only within the player and never hijack Tab or Escape.
- Watch caption support is native WebVTT track architecture. Fullscreen is progressive enhancement, and control auto-hide never hides a focused control.
- Search has one H1, a labelled `type="search"` field in a search landmark, an explicit keyboard-accessible Clear action, restrained polite result-count updates, and result links that do not trigger preview media or move focus automatically.
- My List defers its empty-state claim until local storage hydration completes. Its saved cards keep Title Detail links and separate accessible remove controls, while the shared save controls expose clear add/remove names and `aria-pressed` state.
- Stage 8 Canvas scenes are decorative only, `aria-hidden`, and excluded from keyboard interaction. Hero headings, copy, preview controls, navigation, and programme actions remain semantic DOM in the same order whether the scene is present or not.
- Fine-pointer tilt is optional polish. Keyboard focus keeps a stable readable focus state, touch preserves the existing direct-selection path, and reduced-motion or data-saver preferences receive the normal DOM hero without parallax or WebGL.
- Production attribution is optional and renders as a lower-page Credits & Source section only when supplied. The active Stage 9A records render supplied credits and source links, while their absent title-logo art falls back to the semantic programme-name heading. No caption tracks were supplied, so Watch omits caption controls rather than presenting a non-functional option; real-media Title Detail, Search, My List, and mobile routes were verified with the active pilot.

Future TV-style directional navigation should build on the same focusable structure rather than creating a separate inaccessible interaction layer.
