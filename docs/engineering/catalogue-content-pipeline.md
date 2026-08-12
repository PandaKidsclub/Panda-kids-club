# Catalogue Content Pipeline

The catalogue pipeline promotes approved staged packages through a deliberate local workflow:

```text
incoming/catalogue/<title-slug>/
        |
pnpm content:scan
        |
READY / INCOMPLETE / ERROR
        |
pnpm content:publish -- --dry-run <title-slug>
        |
human approval
        |
pnpm content:publish -- <title-slug>
        |
live in the shared catalogue
```

## Staged Package Contract

Each package lives at `incoming/catalogue/<title-slug>/` and contains `metadata.json` plus the files referenced by its `assets` object. Required metadata is the approved name, matching lowercase slug, short and long descriptions, language, category, collection, badge array, editorial booleans, placement, card artwork, hero poster, distinct preview video, and full-programme video. Optional runtime, age range, title-logo, caption tracks, attribution, and a lower-case `mediaVersion` cache revision are included only when supplied.

The package directory and metadata slug must match. Asset references must be simple local filenames, not paths or URLs. Supported artwork formats are AVIF, JPEG, JPG, PNG, and WebP; supported videos are MP4 and WebM with matching MIME types. Placements must use an existing route and collection pairing. A supplied preview and full programme must name different files.

Caption tracks, when supplied as `assets.captionTracks`, need local VTT files plus `srcLang`, label, and optional `default`. Attribution accepts only the existing Programme attribution fields and validates paired licence name and URL values.

## Readiness

Run:

```bash
pnpm content:scan
pnpm content:report
```

- `READY`: the package has complete, internally consistent metadata and every declared local asset exists.
- `INCOMPLETE`: metadata or a required asset is absent. No files are changed.
- `ERROR`: metadata is malformed, unsafe, unsupported, conflicting, or has invalid route, collection, MIME, or preview/full data. The command exits non-zero when any package has this state.

`content:scan` never reads `incoming/pilot/`, copies assets, writes manifests, or publishes a title.

`content:report` is the same read-only readiness information in a compact operational summary. It never modifies staged or live content and exits non-zero only when a package is in `ERROR`.

## Review And Publish

For a single READY package, produce the exact no-write plan:

```bash
pnpm content:publish -- --dry-run <title-slug>
```

The dry run verifies that the title does not already exist in the Stage 9 pilot or the live catalogue, that its canonical public directory is unused, and lists each asset copy and rail placement. It then stops for human approval.

After approval, run:

```bash
pnpm content:publish -- <title-slug>
```

The publish command copies only declared assets into `public/media/programmes/<slug>/`, adds the generated Programme record to `src/lib/content/production/catalogue-manifest.json`, and runs the same content validator before reporting `LIVE`. It never overwrites a live title or public media directory. If validation fails, it restores the previous catalogue manifest and removes the just-created canonical asset directory.

For production CDN readiness, each published programme record receives a `mediaVersion`. A supplied valid revision is retained; otherwise the publisher derives a short SHA-256 revision from the approved files while publishing. The Stage 11 media resolver adds that revision only to remote media URLs, keeping local development URLs unchanged. When replacing approved media in a future release, publish a new revision so CDN cache keys cannot serve the prior immutable object.

The live catalogue manifest is separate from the Stage 9A pilot manifest. This preserves the pilot's exact-three validation rule while allowing later approved titles to join the shared registry and therefore their configured rails, hero selection, Search, Title Detail, My List, and Watch.
