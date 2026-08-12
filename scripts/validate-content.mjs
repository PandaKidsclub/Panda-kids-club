import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pilotManifestPath = resolve(repositoryRoot, "src/lib/content/production/pilot-manifest.json");
const catalogueManifestPath = resolve(repositoryRoot, "src/lib/content/production/catalogue-manifest.json");
const canonicalMediaPrefix = "/media/programmes/";
const mediaVersionPattern = /^[a-z0-9][a-z0-9._-]{0,127}$/;
const supportedVideoTypes = new Map([
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
]);
const supportedImageExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);
const supportedRoutes = new Set(["home", "stories", "learn", "heroes", "specials", "monthly-updates"]);
const supportedCategories = new Set(["stories", "learn", "heroes", "specials", "monthly-updates"]);
const sectionIdsByRoute = new Map([
  ["home", new Set(["panda-picks", "magical-african-folktales", "laugh-out-loud-adventures"])],
  ["stories", new Set(["storytime-adventures", "more-storytime-titles"])],
  ["learn", new Set(["learn-with-panda", "more-learning-titles"])],
  ["heroes", new Set(["real-african-heroes"])],
  ["specials", new Set(["featured-specials"])],
  ["monthly-updates", new Set(["new-educational-titles", "new-storytime-adventure-titles", "new-heroes-and-folktale-titles"])],
]);
const reservedNeutralSlugPatterns = [
  /^programme-\d{2}$/,
  /^story-programme-\d{2}$/,
  /^learn-programme-\d{2}$/,
  /^hero-programme-\d{2}$/,
  /^special-programme-\d{2}$/,
  /^monthly-learn-programme-\d{2}$/,
  /^monthly-story-programme-\d{2}$/,
  /^monthly-hero-programme-\d{2}$/,
];

const errors = [];
const warnings = [];

function reportError(message) {
  errors.push(message);
}

function reportWarning(message) {
  warnings.push(message);
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function extensionFor(source) {
  const normalized = source.split("?")[0].toLowerCase();
  const index = normalized.lastIndexOf(".");
  return index >= 0 ? normalized.slice(index) : "";
}

function validateCanonicalAsset(source, slug, label, supportedExtensions) {
  if (!isNonEmptyString(source)) {
    reportError(`${slug}: ${label} is missing a local source path.`);
    return;
  }

  const expectedPrefix = `${canonicalMediaPrefix}${slug}/`;
  if (!source.startsWith(expectedPrefix)) {
    reportError(`${slug}: ${label} must use ${expectedPrefix}, not ${source}.`);
    return;
  }

  if (!supportedExtensions.has(extensionFor(source))) {
    reportError(`${slug}: ${label} uses unsupported extension ${extensionFor(source) || "(none)"}.`);
  }

  const localPath = resolve(repositoryRoot, "public", `.${source}`);
  if (!existsSync(localPath)) {
    reportError(`${slug}: ${label} does not exist at ${localPath}.`);
  }
}

function getVideoSources(videoAsset) {
  if (!isRecord(videoAsset)) {
    return [];
  }

  const primarySource = isNonEmptyString(videoAsset.src) ? [{ src: videoAsset.src, type: videoAsset.type }] : [];
  const alternativeSources = Array.isArray(videoAsset.sources) ? videoAsset.sources : [];

  return [...primarySource, ...alternativeSources];
}

function validateVideoAsset(videoAsset, slug, label) {
  if (!isRecord(videoAsset) || !isNonEmptyString(videoAsset.src) || !isNonEmptyString(videoAsset.type)) {
    reportError(`${slug}: ${label} requires a primary src and type.`);
    return;
  }

  const sources = getVideoSources(videoAsset);

  if (sources.length === 0) {
    reportError(`${slug}: ${label} requires at least one source.`);
    return;
  }

  sources.forEach((source, index) => {
    if (!isRecord(source) || !isNonEmptyString(source.type)) {
      reportError(`${slug}: ${label} source ${index + 1} needs src and type.`);
      return;
    }

    const sourceExtension = extensionFor(source.src);
    const expectedType = supportedVideoTypes.get(sourceExtension);
    validateCanonicalAsset(source.src, slug, `${label} source ${index + 1}`, new Set(supportedVideoTypes.keys()));

    if (!expectedType || source.type !== expectedType) {
      reportError(`${slug}: ${label} source ${index + 1} type must match ${sourceExtension || "its extension"}.`);
    }
  });

  if (Array.isArray(videoAsset.captionTracks)) {
    videoAsset.captionTracks.forEach((track, index) => {
      if (!isRecord(track) || !isNonEmptyString(track.src) || !isNonEmptyString(track.srcLang) || !isNonEmptyString(track.label)) {
        reportError(`${slug}: caption track ${index + 1} needs src, srcLang, and label.`);
        return;
      }

      validateCanonicalAsset(track.src, slug, `caption track ${index + 1}`, new Set([".vtt"]));
    });
  }
}

function validateAttribution(attribution, slug) {
  if (attribution === null || attribution === undefined) {
    return;
  }

  if (!isRecord(attribution)) {
    reportError(`${slug}: attribution must be an object or null.`);
    return;
  }

  const hasLicenceName = isNonEmptyString(attribution.licenseName);
  const hasLicenceUrl = isNonEmptyString(attribution.licenseUrl);

  if (hasLicenceName !== hasLicenceUrl) {
    reportError(`${slug}: licenseName and licenseUrl must be supplied together when either is declared.`);
  }

  if (hasLicenceUrl) {
    try {
      const url = new URL(attribution.licenseUrl);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        reportError(`${slug}: licenseUrl must use http or https.`);
      }
    } catch {
      reportError(`${slug}: licenseUrl must be a valid URL.`);
    }
  }
}

function validateProgrammeRecord(record, index, seenIds, seenSlugs, manifestLabel) {
  if (!isRecord(record) || !isRecord(record.programme)) {
    reportError(`${manifestLabel} record ${index + 1} must contain a programme object.`);
    return;
  }

  const { programme, placements } = record;
  const { id, slug } = programme;

  if (!isNonEmptyString(id) || !isNonEmptyString(slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    reportError(`Pilot record ${index + 1} needs a stable lowercase URL-safe id and slug.`);
    return;
  }

  if (seenIds.has(id) || seenSlugs.has(slug)) {
    reportError(`${slug}: duplicate pilot id or slug.`);
  }

  if (reservedNeutralSlugPatterns.some((pattern) => pattern.test(slug))) {
    reportError(`${slug}: conflicts with the neutral fixture slug namespace.`);
  }

  seenIds.add(id);
  seenSlugs.add(slug);

  ["name", "shortDescription", "longDescription"].forEach((field) => {
    if (!isNonEmptyString(programme[field])) {
      reportError(`${slug}: ${field} is required.`);
    }
  });

  if (!isNonEmptyString(programme.mediaVersion) || !mediaVersionPattern.test(programme.mediaVersion)) {
    reportError(`${slug}: mediaVersion must use lowercase letters, numbers, dots, underscores, or hyphens.`);
  }

  if (!supportedCategories.has(programme.category)) {
    reportError(`${slug}: category must be a supported Panda library category.`);
  }

  if (!isRecord(programme.collection) || !isNonEmptyString(programme.collection.id) || !isNonEmptyString(programme.collection.slug)) {
    reportError(`${slug}: collection id and slug are required.`);
  }

  validateCanonicalAsset(programme.thumbnailImage?.src, slug, "card artwork", supportedImageExtensions);
  validateCanonicalAsset(programme.heroPosterImage?.src, slug, "hero poster", supportedImageExtensions);

  if (programme.titleLogoImage !== null && programme.titleLogoImage !== undefined) {
    validateCanonicalAsset(programme.titleLogoImage?.src, slug, "title logo", supportedImageExtensions);
  }

  validateVideoAsset(programme.heroPreviewVideo, slug, "hero preview");
  validateVideoAsset(programme.fullVideo, slug, "full programme");
  validateAttribution(programme.attribution, slug);

  if (!Array.isArray(placements) || placements.length === 0) {
    reportError(`${slug}: at least one registry placement is required.`);
    return;
  }

  placements.forEach((placement, placementIndex) => {
    if (!isRecord(placement) || !supportedRoutes.has(placement.route) || !isNonEmptyString(placement.sectionId)) {
      reportError(`${slug}: placement ${placementIndex + 1} needs a supported route and sectionId.`);
      return;
    }

    if (!sectionIdsByRoute.get(placement.route)?.has(placement.sectionId)) {
      reportError(`${slug}: placement ${placementIndex + 1} references an unknown section.`);
    }
  });
}

function readManifest(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    reportError(`Unable to read ${label}: ${error instanceof Error ? error.message : "unknown error"}`);
    return null;
  }
}

const pilotManifest = readManifest(pilotManifestPath, "pilot manifest");
const catalogueManifest = readManifest(catalogueManifestPath, "live catalogue manifest");
const seenIds = new Set();
const seenSlugs = new Set();

if (isRecord(pilotManifest)) {
  if (pilotManifest.version !== 1) {
    reportError("Pilot manifest version must be 1.");
  }

  if (pilotManifest.status !== "blocked" && pilotManifest.status !== "active") {
    reportError("Pilot manifest status must be blocked or active.");
  }

  if (!Array.isArray(pilotManifest.programmes)) {
    reportError("Pilot manifest programmes must be an array.");
  } else if (pilotManifest.status === "active" && pilotManifest.programmes.length !== 3) {
    reportError("An active Stage 9 pilot must contain exactly three programmes.");
  } else if (pilotManifest.status === "blocked" && pilotManifest.programmes.length !== 0) {
    reportError("A blocked pilot must not register incomplete programmes.");
  }

  if (!Array.isArray(pilotManifest.inventory) || pilotManifest.inventory.length === 0) {
    reportError("Pilot manifest needs a readiness inventory.");
  }

  if (pilotManifest.status === "active" && Array.isArray(pilotManifest.programmes)) {
    pilotManifest.programmes.forEach((record, index) => validateProgrammeRecord(record, index, seenIds, seenSlugs, "Pilot"));
  }

  if (pilotManifest.status === "blocked") {
    reportWarning("Pilot remains blocked: no supplied set of three complete approved programme packages is available.");
  }
}

if (isRecord(catalogueManifest)) {
  if (catalogueManifest.version !== 1) {
    reportError("Live catalogue manifest version must be 1.");
  }

  if (catalogueManifest.status !== "active") {
    reportError("Live catalogue manifest status must be active.");
  }

  if (!Array.isArray(catalogueManifest.programmes)) {
    reportError("Live catalogue manifest programmes must be an array.");
  } else {
    catalogueManifest.programmes.forEach((record, index) => validateProgrammeRecord(record, index, seenIds, seenSlugs, "Live catalogue"));
  }
}

warnings.forEach((message) => console.warn(`Warning: ${message}`));

if (errors.length > 0) {
  errors.forEach((message) => console.error(`Error: ${message}`));
  process.exitCode = 1;
} else {
  const pilotStatus = pilotManifest?.status ?? "invalid";
  const pilotCount = Array.isArray(pilotManifest?.programmes) ? pilotManifest.programmes.length : 0;
  const catalogueCount = Array.isArray(catalogueManifest?.programmes) ? catalogueManifest.programmes.length : 0;
  console.log(`Content validation passed: pilotStatus=${pilotStatus}, pilotProgrammes=${pilotCount}, liveCatalogueProgrammes=${catalogueCount}.`);
}
