# Cloudflare R2 Media Operator Guide

This is a future manual runbook. Stage 11 creates no R2 bucket, DNS record, token, Worker, Stream account, upload, or deployment.

## Target Architecture

Use Cloudflare R2 as the programme object origin, a Panda-owned custom media domain, and Cloudflare cache. Do not place full movies in Cloudflare Pages static assets.

```text
Panda browser
  -> Panda Next.js application
  -> media.<panda-domain> (Cloudflare cache + R2)
```

The media bucket should use this object structure:

```text
programmes/
  ant-and-elephant/
    card.png
    hero.png
    preview.mp4
    full.mp4
  honey/
    card.png
    hero.png
    preview.mp4
    full.mp4
  sello-speaks-sign-language/
    card.png
    hero.png
    preview.mp4
    full.mp4
```

Approved upcoming titles can use the same `programmes/<slug>/` layout when their content records become real. The Coming Soon surface will then use the shared resolver automatically.

## Manual Deployment Sequence

1. Create a private R2 bucket for Panda programme media.
2. Connect a Panda-owned custom media domain to the bucket. Use HTTPS and do not finalize the hostname until the Panda domain is approved.
3. Configure restrictive CORS for the Panda application origin and explicit localhost development origins. Allow `GET`, `HEAD`, and `OPTIONS`, permit `Range`, and expose `Accept-Ranges`, `Content-Length`, `Content-Range`, and `Content-Type`.
4. Configure Cloudflare cache to key on the full query string. Apply long immutable caching only to a versioned `?v=` media URL.
5. Upload approved programme objects to `programmes/<slug>/` with the MIME types matching their extensions. Do not upload staging folders or unapproved packages.
6. Set the non-secret application build variable `NEXT_PUBLIC_MEDIA_BASE_URL` to the custom HTTPS origin.
7. Run `pnpm media:check -- https://media.<panda-domain>` from the application repository.
8. Confirm preview and full MP4 checks report `206`, `Content-Range`, `Content-Length`, `video/mp4`, and sensible cache/CORS headers.
9. Test Chrome, Firefox, Safari macOS, and Safari iPhone/iPad: initial playback, seeking, resume, and no black screen.
10. Deploy the Panda application only after those checks pass, then verify a browser requests video directly from the media domain rather than a Next.js API route.

## Replacing Assets

Use the current programme folder paths, upload the new approved asset set, and publish a new `mediaVersion` in the catalogue manifest. The remote resolver adds that version as a query parameter, allowing the CDN to cache the new object separately from the prior immutable response. Never silently replace an object while retaining an old immutable cache key.

No R2 API credential belongs in `NEXT_PUBLIC_MEDIA_BASE_URL` or any client-visible environment variable. Upload credentials remain an operator concern outside the Panda application repository.
