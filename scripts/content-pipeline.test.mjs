import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { tmpdir } from "node:os";
import { scanCatalogue } from "./content-pipeline.mjs";

function readyMetadata(slug) {
  return {
    assets: {
      cardImage: "card.png",
      fullVideo: { src: "full.mp4", type: "video/mp4" },
      heroPosterImage: "hero.png",
      heroPreviewVideo: { src: "preview.mp4", type: "video/mp4" },
    },
    badges: [],
    category: "stories",
    collection: "more-storytime-titles",
    isFeatured: false,
    isNew: false,
    isPandaPick: false,
    language: "English",
    longDescription: "A neutral test programme description.",
    name: "Test Programme",
    placement: {
      collections: ["more-storytime-titles"],
      pages: ["stories"],
    },
    shortDescription: "A neutral test programme.",
    slug,
  };
}

function writePackage(root, slug, metadata, files = ["card.png", "hero.png", "preview.mp4", "full.mp4"]) {
  const directory = join(root, slug);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  files.forEach((fileName) => writeFileSync(join(directory, fileName), "fixture", "utf8"));
}

function withCatalogueRoot(run) {
  const root = mkdtempSync(join(tmpdir(), "panda-kids-club-catalogue-"));

  try {
    run(root);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("content scan marks a complete package READY and creates its live record", () => {
  withCatalogueRoot((root) => {
    writePackage(root, "test-programme", readyMetadata("test-programme"));

    const [result] = scanCatalogue(root).packages;

    assert.equal(result.status, "READY");
    assert.equal(result.record.programme.id, "catalogue-test-programme");
    assert.equal(result.record.programme.fullVideo.src, "/media/programmes/test-programme/full.mp4");
    assert.deepEqual(result.record.placements, [{ position: "end", route: "stories", sectionId: "more-storytime-titles" }]);
  });
});

test("content scan marks a missing required asset INCOMPLETE", () => {
  withCatalogueRoot((root) => {
    writePackage(root, "missing-full", readyMetadata("missing-full"), ["card.png", "hero.png", "preview.mp4"]);

    const [result] = scanCatalogue(root).packages;

    assert.equal(result.status, "INCOMPLETE");
    assert.ok(result.incomplete.some((message) => message.includes("Full programme source is not present")));
  });
});

test("content scan rejects a package that reuses the preview as its full programme", () => {
  withCatalogueRoot((root) => {
    const metadata = readyMetadata("reused-preview");
    metadata.assets.fullVideo = { src: "preview.mp4", type: "video/mp4" };
    writePackage(root, "reused-preview", metadata, ["card.png", "hero.png", "preview.mp4"]);

    const [result] = scanCatalogue(root).packages;

    assert.equal(result.status, "ERROR");
    assert.ok(result.errors.includes("Hero preview and full programme must reference distinct files."));
  });
});
