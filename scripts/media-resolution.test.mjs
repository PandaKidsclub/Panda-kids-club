import assert from "node:assert/strict";
import test from "node:test";
import {
  getMediaOriginConfiguration,
  resolveMediaUrl,
} from "../src/lib/media/media-config.ts";

test("keeps canonical programme media local when no media origin is configured", () => {
  const local = getMediaOriginConfiguration("");

  assert.equal(resolveMediaUrl("/media/programmes/honey/preview.mp4", local), "/media/programmes/honey/preview.mp4");
  assert.equal(resolveMediaUrl("/media/programmes/honey/captions.en.vtt", local), "/media/programmes/honey/captions.en.vtt");
});

test("resolves images, videos, and captions from a normalized HTTPS media origin", () => {
  const remote = getMediaOriginConfiguration("https://media.example.com///");

  assert.equal(resolveMediaUrl("/media/programmes/honey/card.png", remote), "https://media.example.com/programmes/honey/card.png");
  assert.equal(resolveMediaUrl("/media/programmes/honey/hero.png", remote), "https://media.example.com/programmes/honey/hero.png");
  assert.equal(resolveMediaUrl("/media/programmes/honey/preview.mp4", remote), "https://media.example.com/programmes/honey/preview.mp4");
  assert.equal(resolveMediaUrl("/media/programmes/honey/full.mp4", remote), "https://media.example.com/programmes/honey/full.mp4");
  assert.equal(resolveMediaUrl("/media/programmes/honey/captions.en.vtt", remote), "https://media.example.com/programmes/honey/captions.en.vtt");
  assert.equal(resolveMediaUrl("/media/programmes/honey//preview.mp4", remote), "https://media.example.com/programmes/honey/preview.mp4");
});

test("adds a manifest cache revision only to remote programme URLs", () => {
  const remote = getMediaOriginConfiguration("https://media.example.com/");
  const local = getMediaOriginConfiguration(undefined);

  assert.equal(
    resolveMediaUrl("/media/programmes/honey/full.mp4", remote, "stage9a-pilot-v1"),
    "https://media.example.com/programmes/honey/full.mp4?v=stage9a-pilot-v1",
  );
  assert.equal(
    resolveMediaUrl("/media/programmes/honey/full.mp4", local, "stage9a-pilot-v1"),
    "/media/programmes/honey/full.mp4",
  );
});

test("allows localhost HTTP only for local media testing", () => {
  const localhost = getMediaOriginConfiguration("http://localhost:8787/");

  assert.equal(localhost.origin, "http://localhost:8787");
  assert.throws(() => getMediaOriginConfiguration("http://media.example.com"), /HTTPS/);
});

test("rejects unsafe media-origin protocols and malformed cache versions", () => {
  ["javascript:alert(1)", "data:text/plain,media", "file:///tmp/media"].forEach((value) => {
    assert.throws(() => getMediaOriginConfiguration(value), /HTTPS/);
  });

  assert.throws(
    () => resolveMediaUrl("/media/programmes/honey/full.mp4", getMediaOriginConfiguration("https://media.example.com"), "Not Safe"),
    /mediaVersion/,
  );
});
