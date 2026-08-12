# Production Media Deployment

Panda Kids Club keeps application delivery and programme-media delivery separate. The Next.js application renders catalogue and playback UI; browsers request programme images, preview MP4s, full MP4s, and caption tracks directly from the configured media origin. The application never proxies a film through an API route.

## Media Resolver

Catalogue records always retain canonical local paths such as:

```text
/media/programmes/honey/full.mp4
```

`src/lib/media/media-config.ts` is the sole owner of the public media-origin setting. When `NEXT_PUBLIC_MEDIA_BASE_URL` is unset, that local path is returned untouched and the repository's `public/media/programmes/` files remain the development origin. When it is configured, `src/lib/media/resolve-programme-media.ts` resolves every programme-owned image, preview, full video, poster, source alternative, and caption track to the matching remote path:

```text
https://media.<panda-domain>/programmes/honey/full.mp4
```

The production registry applies that resolver before any route receives a `Programme`. HeroStage, ProgrammeCard, Search, My List, Title Detail, WatchPlayer, and the Coming Soon showcase therefore use the same resolved record without reading environment variables or making storage decisions.

`NEXT_PUBLIC_MEDIA_BASE_URL` is a non-secret build configuration. It must be a root HTTPS origin without a path, query, hash, or credentials. HTTP is accepted only for `localhost`, `127.0.0.1`, or `[::1]` local testing. Unsafe schemes such as `javascript:`, `data:`, and `file:` are rejected.

## Images, CSP, And CORS

`next.config.ts` derives Next Image `remotePatterns` from the same validated origin. It permits only that exact hostname, port, protocol, and `/programmes/**` path, never a wildcard host. The Content Security Policy derives `img-src`, `media-src`, and `connect-src` from that same origin; local app assets remain permitted through `'self'`.

For a deployed media domain, configure R2/Cloudflare CORS narrowly for the Panda application origin. The initial policy should allow only the real app origin and explicit local development origins, with `GET`, `HEAD`, and `OPTIONS`; allow the `Range` request header; and expose `Accept-Ranges`, `Content-Length`, `Content-Range`, and `Content-Type`. Do not use an unrestricted `*` production origin policy. Local development only needs the explicit local app origins that are actually used.

## Direct MP4 Contract

Stage 11 retains native `<video>` and direct MP4 delivery. Preview and full MP4 URLs go straight from the browser to the CDN/object origin. No API media proxy, HLS, DASH, hls.js, Shaka, Stream SDK, or DRM is part of this stage.

The media origin must respond to a request such as:

```http
Range: bytes=0-1
```

with `206 Partial Content`, a valid `Content-Range`, `Content-Length`, and `Content-Type: video/mp4`. Byte-range delivery is an origin/CDN deployment contract, not a Next.js server responsibility.

## Cache Revision Strategy

Each active programme carries a `mediaVersion`. Remote programme URLs receive it as a `?v=<mediaVersion>` cache key; local development URLs deliberately do not change. The current approved pilot uses the stable `stage9a-pilot-v1` revision. Future catalogue packages may supply a valid lower-case revision in `metadata.json`; otherwise the local publisher calculates a content-derived `sha256-...` revision from the approved package files at publish time.

When replacing any card, hero, preview, full programme, or caption file:

1. Upload the replacement object to the canonical programme path.
2. Change the programme `mediaVersion` to the new content-derived revision in the published manifest.
3. Deploy the application manifest change with Cloudflare configured to include the query string in its cache key.
4. Cache versioned responses as immutable for a long TTL. Do not serve an asset with a new revision at an old immutable URL.

This gives every changed asset a fresh URL while allowing the previous immutable response to age out naturally.

## Readiness Commands

```bash
pnpm test:media
pnpm production:check
pnpm media:check
pnpm media:check -- https://media.<panda-domain>
```

`test:media` is a pure URL-resolution suite. It performs no remote requests. `production:check` validates active-title count, canonical local source paths, cache revisions, media-origin safety, and the Next Image/CSP linkage. It succeeds with the media origin unset and reports that the local fallback remains active.

`media:check` is read-only. With no configured or supplied origin it reports `REMOTE MEDIA NOT CONFIGURED — SKIPPED`. With a future media origin it inspects every active card and hero using `HEAD`, and every preview/full video using a two-byte Range request. It reports availability, Content-Type, Content-Range, Content-Length, cache headers, and relevant CORS headers, and fails if video Range handling is not `206`.

## Required Post-CDN QA

Do not mark real CDN media delivery complete until `media:check` passes against the deployed custom domain and the three active titles are checked in Chrome, Firefox, Safari on macOS, and Safari on iPhone/iPad. Safari QA must cover initial MP4 playback, seeking, resume, correct Range responses, and the absence of a black-screen failure.

Adaptive streaming remains a later decision. If the programme catalogue or network requirements eventually justify it, assess HLS/DASH separately from this direct-MP4 baseline; do not add it opportunistically to the current player.
