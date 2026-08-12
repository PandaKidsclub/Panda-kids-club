# Production Content Pilot

Stage 9A activates exactly three approved production Programmes. The pilot manifest is [src/lib/content/production/pilot-manifest.json](../../src/lib/content/production/pilot-manifest.json), and its current `active` status deliberately registers no more and no fewer than three records.

## Activation Contract

When three approved packages are available, each manifest record must provide a stable programme id and slug, approved metadata, collection placement, card artwork, hero poster, a distinct hero preview, a full-programme source, and optional title-logo, caption, and attribution data. Production records are injected into configured rails and may become a route hero only when editorial `isFeatured` data says so. Neutral fixtures remain alongside them.

Copy approved assets once into `public/media/programmes/<slug>/`; `incoming/pilot/` is staging only and must never be served directly. Video sources declare a primary `src` and MIME `type`; add `sources` only for supplied alternatives. Preview and full-programme video remain separate assets.

Run `pnpm validate:content` before activating a pilot. In active mode it requires exactly three records, checks canonical local files, source types, URL-safe unique slugs, fixture-namespace collisions, placement data, caption shape, and paired `licenseName`/`licenseUrl` values. The shared registry also rejects duplicate ids or slugs at application load.

## Rights And Credits

`Programme.attribution` is optional. It can hold only supplied original-title, source, contributor, copyright, licence, source-link, adaptation-note, and free-form attribution values. Title Detail renders a quiet **Credits & Source** section only when at least one value exists; no missing rights data is inferred or displayed as a placeholder.

## Activated Inventory

| Programme | Slug and placement | Canonical assets | Browser-verified media |
| --- | --- | --- | --- |
| Ant and Elephant | `ant-and-elephant`; Stories, More Storytime Titles | `card.png` and `hero.png` are each 1672 x 941 and 3,125,614 bytes. `preview.mp4` is 14,785,402 bytes; `full.mp4` is 447,746,270 bytes. | Preview: 1920 x 1080, 7.633s. Full programme: 1920 x 1080, 184.767s. |
| Honey | `honey`; Learn, Learn with Panda | `card.png` and `hero.png` are each 1672 x 941 and 3,048,942 bytes. `preview.mp4` is 8,270,986 bytes; `full.mp4` is 405,842,900 bytes. | Preview: 1280 x 720, 8.875s. Full programme: 1280 x 720, 148.208s. |
| Sello speaks Sign Language | `sello-speaks-sign-language`; Learn, More Learning Titles | `card.png` and `hero.png` are each 1672 x 941 and 2,448,578 bytes. `preview.mp4` is 8,413,465 bytes; `full.mp4` is 485,121,746 bytes. | Preview: 1280 x 720, 9.458s. Full programme: 1280 x 720, 178.083s. |

All activated files were copied unchanged from their respective `incoming/pilot/<slug>/` packages into `public/media/programmes/<slug>/`. The supplied metadata called the artwork `card.jpg` and `hero.jpg`, while the actual approved files are PNGs; the manifest uses those verified `.png` filenames. No external content was acquired, and no asset was transcoded or recompressed.

The remaining complete packages, `asnath-mahapa-flies-high` and `tito-and-the-fireflies`, remain in staging and are deliberately unregistered so that the pilot stays at exactly three active Programmes. Other incoming folders remain untouched.

## QA Status

`pnpm validate:content` passes with `status=active, activeProgrammes=3`. Production-browser QA confirmed the supplied card and hero art on Stories and Learn, muted autoplay previews, preview pause/resume, and a Honey-to-Sello rapid selection race: Sello remained the active playing slot while Honey was paused. The three full programmes loaded from their actual Watch links; Ant was also tested through pause, resume, mute, seek, and end-to-Replay states. Local range requests to every activated MP4 returned `206 video/mp4`.

No caption tracks were supplied, so Watch correctly exposes no caption control. Title Detail uses text-name fallback because no title-logo files were supplied; it renders each supplied Credits & Source record. Search found all three local records, and My List add/remove was verified with Honey. At 390px, the Stories and Learn real-media routes had no page overflow and no Canvas. The Stage 8 WebGL policy is unchanged: the lazy Canvas remains absent on mobile and on Search, My List, Title Detail, Monthly Updates, and Watch.

## Stage 11 Delivery Baseline

The same three active records now carry the `stage9a-pilot-v1` media revision for future remote cache keys. Their manifest paths remain canonical local paths, so Stage 11 with no configured media origin still serves the approved `public/media/programmes/` files. Stage 11 confirmed the local Honey `full.mp4` baseline with `Range: bytes=0-1`: `206 Partial Content`, `Content-Type: video/mp4`, `Content-Range: bytes 0-1/405842900`, and `Content-Length: 2`. Remote CDN/Safari delivery remains untested until a real custom media origin exists.
