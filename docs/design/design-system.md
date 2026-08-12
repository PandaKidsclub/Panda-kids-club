# Design System

Panda Kids Club should combine cinematic streaming-library clarity, premium family-entertainment polish, tactile three-dimensional controls, playful physical depth, restrained cinematic motion, excellent readability, and highly visual discovery.

Use an original design system. Do not copy proprietary assets, icons, layouts, exact trade dress, or protected typography from other entertainment services.

The shared Panda system defines semantic CSS custom properties for:

- background
- surface
- elevated surface
- foreground
- muted foreground
- accent
- secondary accent
- focus
- border
- overlay
- hero scrim
- spacing
- radii
- depth
- motion
- typography hierarchy

The common layout grid uses `--layout-page-width`, `--layout-navigation-width`, and `--layout-gutter`. Hero copy, rails, search, My List, navigation, and Title Detail consume these shared measurements. At narrow widths only the gutter token changes; pages should preserve hierarchy rather than use one-off offsets.

The material language has four intentional levels: cinematic environment, recessed input/control wells, raised utility controls, and primary or selected controls. Use the existing radius, depth, and motion families rather than introducing a new visual treatment for each page. Warm accents signal primary actions and selected states; programme artwork carries the visual atmosphere.

Stage 8 adds a DOM-first depth language. Fine-pointer surfaces may use `--pointer-x`, `--pointer-y`, and bounded tilt variables for edge light, artwork perspective, and small elevation changes. The hero layers use separate media, atmosphere, and depth offsets so the readable copy never moves with the pointer. This is a physical accent, not a replacement for content, navigation, or focus treatment.

Use the shared depth and motion tokens for shallow press feedback, surface response, and settling. Keep forms broad, softly lit, and partially cropped when they sit behind a hero; do not add decorative blur fields, neon, or endlessly moving visual noise.

Page themes must be semantic. Components should consume tokens such as `--color-background` and `--color-accent` rather than hard-coded page-specific values.

Avoid excessive glassmorphism, neon, gradients, bouncing animation, cartoon clutter, floating emojis, excessive shadows, and random rounded rectangles.
