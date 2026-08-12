import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getMediaOriginConfiguration, resolveMediaUrl } from "../src/lib/media/media-config.ts";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pilotManifestPath = resolve(repositoryRoot, "src/lib/content/production/pilot-manifest.json");
const catalogueManifestPath = resolve(repositoryRoot, "src/lib/content/production/catalogue-manifest.json");
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

function parseBaseUrl(argumentsList) {
  const values = argumentsList.filter((argument) => argument !== "--");

  if (values.length > 1 || values.some((argument) => argument.startsWith("-"))) {
    throw new Error("Usage: pnpm media:check -- [https://media.your-domain]");
  }

  return values[0] ?? process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
}

function readManifest(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read ${label}: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function getActiveProgrammes() {
  const pilot = readManifest(pilotManifestPath, "pilot manifest");
  const catalogue = readManifest(catalogueManifestPath, "catalogue manifest");
  const records = [...(pilot.programmes ?? []), ...(catalogue.programmes ?? [])];
  return records.map((record) => record.programme).filter(Boolean);
}

function header(response, name) {
  return response.headers.get(name) ?? "(not sent)";
}

function reportResponse(label, response) {
  console.log(`${label}: status=${response.status} type=${header(response, "content-type")} length=${header(response, "content-length")} range=${header(response, "content-range")} cache=${header(response, "cache-control")} cors=${header(response, "access-control-allow-origin")}`);
}

async function inspectArtwork(label, source) {
  try {
    const response = await fetch(source, { method: "HEAD", redirect: "error" });
    reportResponse(label, response);

    if (!response.ok) {
      fail(`${label} returned HTTP ${response.status}.`);
    }

    if (!header(response, "content-type").startsWith("image/")) {
      fail(`${label} must return an image Content-Type.`);
    }
  } catch (error) {
    fail(`${label} could not be inspected: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

async function inspectVideo(label, source) {
  try {
    const response = await fetch(source, {
      headers: { Range: "bytes=0-1" },
      redirect: "error",
    });
    await response.arrayBuffer();
    reportResponse(label, response);

    if (response.status !== 206) {
      fail(`${label} must return 206 to a byte-range request.`);
    }

    if (!header(response, "content-type").startsWith("video/")) {
      fail(`${label} must return a video Content-Type.`);
    }

    if (header(response, "content-range") === "(not sent)" || header(response, "content-length") === "(not sent)") {
      fail(`${label} must include Content-Range and Content-Length for a byte-range response.`);
    }
  } catch (error) {
    fail(`${label} could not be inspected: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

async function run() {
  const configuration = getMediaOriginConfiguration(parseBaseUrl(process.argv.slice(2)));

  if (!configuration.origin) {
    console.log("REMOTE MEDIA NOT CONFIGURED — SKIPPED");
    return;
  }

  console.log(`Checking direct media delivery from ${configuration.origin}`);

  for (const programme of getActiveProgrammes()) {
    const version = programme.mediaVersion;
    const card = programme.thumbnailImage?.src;
    const hero = programme.heroPosterImage?.src;
    const preview = programme.heroPreviewVideo?.src;
    const full = programme.fullVideo?.src;

    if (card) {
      await inspectArtwork(`${programme.slug} card`, resolveMediaUrl(card, configuration, version));
    }

    if (hero) {
      await inspectArtwork(`${programme.slug} hero`, resolveMediaUrl(hero, configuration, version));
    }

    if (preview) {
      await inspectVideo(`${programme.slug} preview`, resolveMediaUrl(preview, configuration, version));
    }

    if (full) {
      await inspectVideo(`${programme.slug} full`, resolveMediaUrl(full, configuration, version));
    }
  }

  if (failures.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("Remote media check passed.");
}

run().catch((error) => {
  console.error(`Media check failed: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
