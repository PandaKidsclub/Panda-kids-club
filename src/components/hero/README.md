# Hero Components

Hero UI components belong here:

- `HeroStage`
- `HeroMediaLayer`
- `HeroContent`
- `HeroControlsSlot`

Use `src/features/hero` for state contracts and hooks. `HeroStage` can keep a library page's editorial context separate from the selected programme identity. It exposes Play and More Info for the current selection while cards remain selection-only. Stage 3's `HeroMediaLayer` is the isolated native preview controller: it uses poster-first media, current/staged video slots, muted autoplay, and visibility cleanup. Full programme playback belongs exclusively to `/watch/[slug]`.
