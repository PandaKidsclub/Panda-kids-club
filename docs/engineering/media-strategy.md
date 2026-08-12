# Media Strategy

The finished product will contain many visual assets and video previews, so media architecture must stay deliberate.

Principles:

- Use static poster fallbacks for every future video preview. Poster and metadata update immediately; video only becomes visible after playback succeeds.
- `heroPreviewVideo` is a lightweight browsing asset, expected in production to be roughly 15-30 seconds and loopable. `fullVideo` belongs only to the future `/watch/[slug]` experience.
- Do not preload an entire catalogue or create card video elements. The hero owns at most two bounded native video slots for current/staged media.
- Selected previews use `preload="metadata"`; inactive catalogue entries do not download preview video.
- Only one major hero preview should play at steady state. Stale media events must be rejected by the current selection generation/source before they can update the stage.
- Lazy-load non-critical media and pause previews when the hero is offscreen or the document is hidden.
- Respect reduced-motion and data-constrained contexts: show poster-first discovery and require an explicit preview request before motion begins.
- Muted autoplay is the default. If unmuted playback is rejected, retry once muted and keep the control state accurate.
- Full video files belong behind the future playback experience, not in card grids.
- Title Detail remains static and does not load browsing previews or full programmes.
- Watch consumes `fullVideo` only, begins with `preload="metadata"`, uses native `<video>` with `playsInline`, does not loop, and does not force mute. A rejected full-programme `play()` request remains paused and visible; it never retries muted.
- Future caption tracks live on `VideoAsset.captionTracks` and render as native WebVTT `<track kind="captions">` elements. Caption language selection remains intentionally simple until real tracks exist.
- Adaptive streaming, DRM, Picture-in-Picture controls, Media Session integration, and playback persistence are deferred pending approved media delivery requirements.
- Future WebGL or 3D layers must degrade gracefully.

Stages 3 through 6 contain no production artwork or footage. No local synthetic development clip was added because the repository had no neutral media asset and `ffmpeg` was unavailable; fixture media remains optional and flows through the content model. Autoplay, buffering, canplay transitions, failed-media handling, media races, full-programme controls, caption rendering, fullscreen behavior, and sound-policy behavior still require approved playable media for end-to-end browser verification.

Stage 9 introduces a production-ready media contract without publishing incomplete staging assets. `VideoAsset` retains its primary `src`/`type` pair and can declare `sources` only for real alternative variants; production records must never manufacture WebM or preview files. A preview is distinct from `fullVideo`, and approved media is served only from `public/media/programmes/<slug>/`. The active Stage 9A pilot contains exactly three approved packages with distinct previews and full programmes; local production QA confirmed preview selection, Watch playback, and byte-range delivery. See `docs/engineering/production-content-pilot.md` for the inventory and measured media facts.

Stage 11 preserves that local contract while adding one resolver for a future direct CDN/object origin. Manifests continue to hold canonical `/media/programmes/<slug>/...` paths. With no configured origin, the browser uses local public assets. With `NEXT_PUBLIC_MEDIA_BASE_URL` configured, every programme-owned image, preview, full MP4, poster, alternative source, and caption track resolves to the exact trusted `/programmes/<slug>/...` URL on that HTTPS origin. The Hero, cards, title pages, WatchPlayer, Search, My List, and Coming Soon all receive resolved `Programme` data and never make separate storage decisions.

The current direct-MP4 baseline remains native `<video>` with Range support. A media origin must return `206 Partial Content`, `Content-Range`, `Content-Length`, and the correct MIME type for preview and full MP4 requests. Future R2/CDN cache entries use each programme's `mediaVersion` query key; local URLs stay unchanged. HLS, DASH, DRM, and proxy streaming remain deferred. See [Production Media Deployment](production-deployment.md) for deployment and Safari QA requirements.
