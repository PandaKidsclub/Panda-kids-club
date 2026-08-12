# Panda Kids Club Agent Notes

Panda Kids Club is a premium children's streaming and video-library product. The long-term experience should feel cinematic, dimensional, polished, welcoming, and highly visual without copying Netflix, Disney+, Apple, or any other proprietary trade dress.

Permanent product documentation lives in:

- [docs/product/vision.md](docs/product/vision.md)
- [docs/product/information-architecture.md](docs/product/information-architecture.md)
- [docs/product/interaction-principles.md](docs/product/interaction-principles.md)
- [docs/design/design-system.md](docs/design/design-system.md)
- [docs/design/motion-principles.md](docs/design/motion-principles.md)
- [docs/design/responsive-principles.md](docs/design/responsive-principles.md)
- [docs/engineering/architecture.md](docs/engineering/architecture.md)
- [docs/engineering/media-strategy.md](docs/engineering/media-strategy.md)
- [docs/engineering/performance-budget.md](docs/engineering/performance-budget.md)
- [docs/engineering/accessibility.md](docs/engineering/accessibility.md)

Development commands:

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

Architecture conventions:

- Use Next.js App Router, React, TypeScript, semantic HTML, and CSS custom properties.
- Keep most components server-rendered unless interactivity requires a client boundary.
- Put reusable layout and shell primitives in `src/components`.
- Put durable content contracts in `src/lib/content`.
- Put future hero selection state boundaries in `src/features/hero`.
- Use semantic page-theme tokens instead of hard-coded component colors.

Product guardrails:

- Do not invent real Panda Kids Club programme titles, artwork, video assets, subscriptions, CMS data, analytics, or payment flows.
- Use neutral development fixtures such as `programme-01` and visible labels such as "Programme", "Preview", and "Coming Soon".
- Later stages should read the relevant docs before editing and should extend the existing architecture rather than replacing working foundations casually.
- Before making visible Panda Kids Club UI changes, read `docs/design/panda-design-system.md` and preserve its shared tokens, responsive rules, material hierarchy, and signature elements.
- Accessibility and performance are required: keyboard access, visible focus, adequate contrast, reduced-motion support, lean dependencies, and lazy media strategy.
- Run the available checks before declaring work complete.
