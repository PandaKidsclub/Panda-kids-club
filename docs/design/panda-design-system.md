# Panda Kids Club Design System v1

Design System v1 is the approved shared visual language for Panda Kids Club. Future UI work should extend the existing tokens and components instead of creating route-specific visual systems. This is a consistency rule, not a barrier to deliberate product improvements.

## 01 Brand Principles

Make discovery feel cinematic, warm, clear, tactile, and child-friendly. Programme artwork is the primary source of atmosphere; interface materials make that artwork easy to explore.

## 02 Signature Visual DNA

The four signature ideas are cinematic African programme artwork, dark tactile Panda controls, a subtle bamboo Hero edge, and warm physical response. No route introduces a competing visual language.

## 03 Colour

Use semantic `--color-*` tokens. Shared dark navy surfaces anchor the product; route themes only vary ambient illumination and the warm accent. Warm accent is reserved for Play, selection, and clear engagement.

## 04 Typography

Use the semantic display, Hero title, section title, body, metadata, button, and label roles. Hero type is shared across library routes and naturally wraps to one or two lines where content permits.

## 05 Layout Grid

`--layout-page-width`, `--layout-navigation-width`, and `--layout-gutter` align navigation, Hero content, rails, Search, My List, and Title Detail. Use shared gutters rather than route-specific left offsets.

## 06 Spacing

Use the existing 4px-based `--space-*` scale. Small gaps connect related controls, medium gaps separate content groups, and large gaps separate page regions.

## 07 Geometry / Radius

Use small radii for compact utilities, medium for controls and cards, panel radius for large bounded surfaces, navigation radius for the header, and pills only for actions, badges, and circular controls.

## 08 Dark Neumorphic Material System

Level 0 is the cinematic environment. Level 1 is a recessed input or well. Level 2 is a raised utility or secondary action. Level 3 is Play, selected, focused, or engaged state. Boundaries, contrast, labels, and focus always communicate interactivity in addition to depth.

## 09 Elevation

Use `--depth-rest`, `--depth-pressed`, `--depth-raised`, `--depth-floating`, and `--depth-hero`. Shadows imply a soft upper-left light source with lower-right depth. Do not stack several depth treatments on one control.

## 10 Buttons

Shared button physics are rest, small hover elevation, visible focus, compressed press, explicit selected state, and clear disabled state. Play is warm and strongest; More Info and My List remain restrained. A saved My List control is visibly engaged and carries an explicit label.

## 11 Navigation

The shared header keeps brand left, central route navigation, and Search/Profile utilities right. The active destination has shape, depth, contrast, and an accent border, not colour alone.

## 12 Programme Cards

Artwork is the face. Card materials are limited to frame, rest depth, selected state, and tiny fine-pointer tilt. Rails retain native scroll, snap, partial next-card discovery, edge controls, and touch swipe.

## 13 Hero

Heroes stay open cinematic environments. Copy remains semantic DOM inside the shared safe area, controls use the shared material language, and there is no oversized information panel. Desktop and tablet library Heroes remain sticky while their content scrolls in its approved layer; mobile Heroes remain in normal flow.

## 14 Bamboo

`BambooEdge` is one decorative, `aria-hidden` shared Hero element for Home, Stories, Learn, Heroes, and Specials. It is a subdued desktop/tablet background layer, has no interactive role, and is disabled on narrow screens and reduced motion. Do not add bamboo to rails, cards, Search, My List, or Watch.

## 15 Content Rails

Section headings and rails share the page grid. Typography and whitespace do the hierarchy work; rails are not nested inside decorative panels. Keep the cinematic Hero fade visually connected to the first rail.

## 16 Search

Search is the clearest Level 1 recessed surface. Keep it editable-looking, high contrast, keyboard accessible, and visually quiet. Result cards navigate to Title Detail and never trigger Hero preview.

## 17 My List

My List is a quiet personal catalogue, not a dashboard. Keep device-local persistence, semantic add/remove controls, `aria-pressed`, and a simple empty state with one useful action.

## 18 Coming Soon

The release message, countdown, and central programme art lead. The side cards and compact physical controls remain subordinate. Preserve rotation, pause, hover/focus pause, Save-Data, offscreen, and reduced-motion behaviour.

## 19 Title Detail

Artwork remains dominant, actions are tactile, and Credits & Source are readable secondary content. Do not place programme context into large embossed information containers.

## 20 Watch

Watch is the content-first exception. No header, bamboo, Hero treatment, or player shell competes with the video. When controls appear, their depth is deliberately restrained and the timeline remains a shallow functional track.

## 21 Motion

Use the semantic press, quick, surface, settle, cinematic, and hover-dwell tokens. Motion communicates interaction, selection, or continuity. Preserve the 400ms Hero preview dwell; do not add decorative perpetual motion.

## 22 Responsive Behaviour

Desktop is spatial and cinematic, tablet compresses the same hierarchy, and mobile is content-first with less simultaneous chrome. At `<= 560px`, raised, floating, and Hero shadows are simplified to avoid muddy materials. Targets remain at least approximately 44px.

## 23 Focus & Accessibility

Use semantic buttons, links, labels, `aria-pressed` where applicable, clear disabled states, and global `:focus-visible` rings. No interaction can depend on colour or shadow alone. Hover enhancements must preserve focus and touch paths.

## 24 Performance Rules

Keep card rest states cheap, avoid large moving shadows and broad blur over rails, and keep the Hero DOM-first. No route mounts a decorative Canvas. Respect reduced motion and Save-Data.

## 24.1 Shop

Shop is a guardian-facing retail destination only. Product photography leads a `ShopProductCard`; tactile material stays on its frame, labels, selectors, cart controls, and checkout hierarchy. Variant selectors have explicit available, selected, and unavailable states. Add to Cart is strongest on Product Detail, and Checkout is strongest inside the cart. Retail does not appear in Programme cards, Search, My List, Watch, or children's play flows.

## 25 Do

- Use shared layout, type, radius, depth, and motion tokens.
- Let approved programme artwork carry the visual story.
- Use theme tokens for ambient route distinction.
- Verify focus, touch, reduced motion, and mobile before shipping visible changes.

## 26 Don't

- Do not create a new UI trend, route-specific design system, or generic card grid.
- Do not turn Hero copy into a large panel or Watch into a styled product surface.
- Do not scatter bamboo or warm primary accents.
- Do not add motion, Canvas, or dependencies merely for decoration.

## Future UI Checklist

- Uses the shared grid, typography, material level, and button behaviour.
- Respects page themes, reduced motion, focus visibility, and touch targets.
- Keeps artwork stronger than interface treatment.
- Does not introduce a new visual language.

## Freeze

PANDA KIDS CLUB DESIGN SYSTEM V1 — FROZEN. Future visible UI work should use this established language and make deliberate, documented decisions before changing its global material philosophy, navigation, or type hierarchy.
