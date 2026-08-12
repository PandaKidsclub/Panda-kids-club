# Motion Principles

Motion should be restrained, cinematic, and purposeful.

Use shared motion tokens for:

- immediate interaction
- quick transition
- standard transition
- cinematic transition
- hover dwell delay

Stage 8 separates three interaction tempos: immediate press feedback, a short surface response, and a slower settle. Pointer tracking is throttled to one `requestAnimationFrame` write and transforms are intentionally small. Hero copy, controls, focus rings, and layout stay still while nearby decorative layers respond.

Do not scatter arbitrary timings through components. Home preview intent is centralized at 400 ms, while hero poster/video switching uses the cinematic transition token (currently 560 ms). Card focus states and physical button responses should draw from the same shared timing vocabulary.

Respect `prefers-reduced-motion`. Reduced-motion users receive stable poster states, direct selection changes, and no automatic continuous preview motion; explicit preview playback remains available.

Stage 3 uses CSS opacity and transform transitions only. Do not add GSAP or another motion library for hero preview switching. The optional Stage 8 WebGL scene is demand-rendered: it invalidates only for pointer movement and its brief settle, never as a permanent idle animation. Reduced-motion users receive no hover tilt, hero parallax, or Canvas scene.
