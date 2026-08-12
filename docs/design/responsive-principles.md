# Responsive Principles

The application must support large desktop, laptop, tablet, mobile, touch devices, keyboard navigation, and potential TV-style directional navigation later.

Use responsive CSS rather than fixed mockup coordinates:

- fluid containers
- min and max constraints
- CSS grid and flexbox
- stable aspect ratios for cards and media
- touch-friendly hit targets
- readable type and spacing at small widths

Hero media will eventually need wide cinematic presentation. Programme artwork should be prepared around a 16:9 card geometry unless a later approved design system changes that.

Do not assume one fixed 1920x1080 canvas, and do not use absolute positioning copied from presentation mockups.

Stage 1 keeps all six primary destinations available on small screens with a horizontal, touch-scrollable section navigation below the compact brand, search, and profile bar. The active destination is scrolled into view on route changes.

Stage 2 library rails preserve one large 16:9 card with a partial next card on narrow screens. They use native horizontal gestures and proximity scroll snap; previous/next controls remain available without converting vertical wheel movement into horizontal scrolling.

Title Detail keeps a large static backdrop and stacked metadata at narrow widths. Watch uses safe-area-aware controls, retains touch-sized Back and playback controls, and collapses only the volume slider on the smallest screens rather than shrinking essential controls.
