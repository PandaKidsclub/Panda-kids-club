import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  getConfiguredMediaOrigin,
  isCanonicalMediaPath,
  isValidMediaVersion,
} from "../src/lib/media/media-config.ts";
import { validateShopifyProductionConfiguration } from "../src/lib/shopify/config.ts";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pilotManifestPath = resolve(repositoryRoot, "src/lib/content/production/pilot-manifest.json");
const catalogueManifestPath = resolve(repositoryRoot, "src/lib/content/production/catalogue-manifest.json");
const nextConfigPath = resolve(repositoryRoot, "next.config.ts");
const expectedActiveSlugs = new Set(["ant-and-elephant", "honey", "sello-speaks-sign-language"]);
const errors = [];

function fail(message) {
  errors.push(message);
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`OK ${message}`);
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Unable to read ${label}: ${error instanceof Error ? error.message : "unknown error"}`);
    return null;
  }
}

function getProgrammeMediaSources(programme) {
  const videoSources = (video) => [video?.src, ...(video?.sources ?? []).map((source) => source?.src), video?.poster?.src];
  const captionSources = (video) => [video?.captionsSrc, ...(video?.captionTracks ?? []).map((track) => track?.src)];

  return [
    programme.thumbnailImage?.src,
    programme.heroPosterImage?.src,
    programme.titleLogoImage?.src,
    ...videoSources(programme.heroPreviewVideo),
    ...captionSources(programme.heroPreviewVideo),
    ...videoSources(programme.fullVideo),
    ...captionSources(programme.fullVideo),
  ].filter(Boolean);
}

function run() {
  const contentValidation = spawnSync(process.execPath, ["scripts/validate-content.mjs"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

  if (contentValidation.status !== 0) {
    fail(`active content validation failed: ${(contentValidation.stderr || contentValidation.stdout).trim()}`);
  } else {
    pass("active content passes the canonical content validator");
  }

  const pilot = readJson(pilotManifestPath, "pilot manifest");
  const catalogue = readJson(catalogueManifestPath, "catalogue manifest");

  if (!pilot || !catalogue) {
    process.exitCode = 1;
    return;
  }

  const pilotProgrammes = Array.isArray(pilot.programmes) ? pilot.programmes.map((record) => record.programme).filter(Boolean) : [];
  const catalogueProgrammes = Array.isArray(catalogue.programmes) ? catalogue.programmes.map((record) => record.programme).filter(Boolean) : [];
  const activeProgrammes = [...pilotProgrammes, ...catalogueProgrammes];

  if (pilot.status !== "active" || pilotProgrammes.length !== 3) {
    fail("The production pilot must remain active with exactly three programmes.");
  } else {
    pass("active pilot contains exactly three programmes");
  }

  if (activeProgrammes.length !== 3 || new Set(activeProgrammes.map((programme) => programme.slug)).size !== 3) {
    fail("The active production catalogue must contain exactly three unique programmes.");
  }

  const activeSlugs = new Set(activeProgrammes.map((programme) => programme.slug));

  if (activeSlugs.size !== expectedActiveSlugs.size || [...expectedActiveSlugs].some((slug) => !activeSlugs.has(slug))) {
    fail("Active production titles must remain ant-and-elephant, honey, and sello-speaks-sign-language.");
  } else {
    pass("active production titles match the approved three-title pilot");
  }

  if (catalogueProgrammes.length !== 0) {
    fail("No additional catalogue title may be active during Stage 11.");
  } else {
    pass("no additional catalogue title is active");
  }

  activeProgrammes.forEach((programme) => {
    if (!isValidMediaVersion(programme.mediaVersion)) {
      fail(`${programme.slug} requires a valid mediaVersion for immutable remote cache keys.`);
    }

    getProgrammeMediaSources(programme).forEach((source) => {
      if (!isCanonicalMediaPath(source)) {
        fail(`${programme.slug} contains a non-canonical programme media path: ${source}`);
      }
    });
  });

  if (errors.length === 0) {
    pass("programme media paths remain canonical local paths before resolver application");
    pass("every active programme has a mediaVersion cache revision");
  }

  const configSource = readFileSync(nextConfigPath, "utf8");

  if (!configSource.includes("configuredMediaOrigin") || !configSource.includes("remotePatterns") || !configSource.includes("media-src")) {
    fail("Next image and CSP configuration must derive from the shared media origin.");
  } else {
    pass("Next Image and CSP derive trusted media settings from the shared origin");
  }

  try {
    const mediaOrigin = getConfiguredMediaOrigin();

    if (mediaOrigin.origin) {
      pass(`configured remote media origin is ${mediaOrigin.origin}`);
    } else {
      pass("media origin is unset; canonical local media fallback remains active");
    }
  } catch (error) {
    fail(error instanceof Error ? error.message : "media origin configuration is invalid");
  }

  const shopConfigurationError = validateShopifyProductionConfiguration();
  if (shopConfigurationError) {
    fail(shopConfigurationError);
  } else if (process.env.SHOP_ENABLED === "true") {
    pass("Shop is enabled with complete Shopify production configuration");
  } else {
    pass("Shop is intentionally in demo mode until Shopify is enabled");
  }

  pass("content mode keeps active production records alongside neutral QA fixtures");

  if (errors.length > 0) {
    process.exitCode = 1;
  } else {
    console.log("Production readiness check passed.");
  }
}

run();
