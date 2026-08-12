import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
export const catalogueRoot = resolve(repositoryRoot, "incoming/catalogue");
export const catalogueManifestPath = resolve(repositoryRoot, "src/lib/content/production/catalogue-manifest.json");
export const pilotManifestPath = resolve(repositoryRoot, "src/lib/content/production/pilot-manifest.json");
export const publicProgrammesRoot = resolve(repositoryRoot, "public/media/programmes");

const catalogueIdPrefix = "catalogue-";
const canonicalMediaPrefix = "/media/programmes/";
const mediaVersionPattern = /^[a-z0-9][a-z0-9._-]{0,127}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const supportedVideoTypes = new Map([
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
]);
const supportedImageExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);
const supportedBadges = new Set(["new", "featured", "panda-pick", "preview"]);
const sectionIdsByRoute = new Map([
  ["home", new Set(["panda-picks", "magical-african-folktales", "laugh-out-loud-adventures"])],
  ["stories", new Set(["storytime-adventures", "more-storytime-titles"])],
  ["learn", new Set(["learn-with-panda", "more-learning-titles"])],
  ["heroes", new Set(["real-african-heroes"])],
  ["specials", new Set(["featured-specials"])],
  ["monthly-updates", new Set(["new-educational-titles", "new-storytime-adventure-titles", "new-heroes-and-folktale-titles"])],
]);
const supportedCategories = new Set(["stories", "learn", "heroes", "specials", "monthly-updates"]);
const attributionFields = [
  "originalTitle",
  "sourceName",
  "author",
  "adapter",
  "translator",
  "illustrator",
  "copyrightNotice",
  "licenseName",
  "licenseUrl",
  "sourceUrl",
  "adaptationNote",
  "attributionText",
];

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isSafeFileName(value) {
  return isNonEmptyString(value)
    && value === basename(value)
    && value !== "."
    && value !== "..";
}

function createResult(directoryName, directory) {
  return {
    assetFiles: [],
    directory,
    directoryName,
    errors: [],
    incomplete: [],
    metadata: null,
    record: null,
    status: "INCOMPLETE",
  };
}

function addError(result, message) {
  result.errors.push(message);
}

function addIncomplete(result, message) {
  result.incomplete.push(message);
}

function finaliseResult(result) {
  result.status = result.errors.length > 0 ? "ERROR" : result.incomplete.length > 0 ? "INCOMPLETE" : "READY";
  return result;
}

function requireString(result, value, label) {
  if (value === undefined || value === null) {
    addIncomplete(result, `${label} is missing.`);
    return false;
  }

  if (!isNonEmptyString(value)) {
    addError(result, `${label} must be a non-empty string.`);
    return false;
  }

  return true;
}

function requireBoolean(result, value, label) {
  if (value === undefined || value === null) {
    addIncomplete(result, `${label} is missing.`);
    return false;
  }

  if (typeof value !== "boolean") {
    addError(result, `${label} must be true or false.`);
    return false;
  }

  return true;
}

function addAssetFile(result, fileName, label, extensions) {
  if (fileName === undefined || fileName === null) {
    addIncomplete(result, `${label} is missing.`);
    return false;
  }

  if (!isSafeFileName(fileName)) {
    addError(result, `${label} must be a file name without path segments.`);
    return false;
  }

  const extension = extname(fileName).toLowerCase();

  if (!extensions.has(extension)) {
    addError(result, `${label} uses unsupported extension ${extension || "(none)"}.`);
    return false;
  }

  const filePath = resolve(result.directory, fileName);

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    addIncomplete(result, `${label} is not present in the staged package.`);
    return false;
  }

  result.assetFiles.push(fileName);
  return true;
}

function validateVideo(result, value, label) {
  if (value === undefined || value === null) {
    addIncomplete(result, `${label} is missing.`);
    return false;
  }

  if (!isRecord(value)) {
    addError(result, `${label} must provide a src and type.`);
    return false;
  }

  const hasSource = addAssetFile(result, value.src, `${label} source`, new Set(supportedVideoTypes.keys()));

  if (value.type === undefined || value.type === null) {
    addIncomplete(result, `${label} MIME type is missing.`);
    return false;
  }

  if (!isNonEmptyString(value.type)) {
    addError(result, `${label} MIME type must be a non-empty string.`);
    return false;
  }

  const expectedType = supportedVideoTypes.get(extname(value.src ?? "").toLowerCase());

  if (expectedType && value.type !== expectedType) {
    addError(result, `${label} MIME type must be ${expectedType}.`);
  }

  return hasSource && value.type === expectedType;
}

function validateCaptionTracks(result, tracks) {
  if (tracks === undefined || tracks === null) {
    return;
  }

  if (!Array.isArray(tracks)) {
    addError(result, "Caption tracks must be an array when supplied.");
    return;
  }

  tracks.forEach((track, index) => {
    const label = `Caption track ${index + 1}`;

    if (!isRecord(track)) {
      addError(result, `${label} must be an object.`);
      return;
    }

    addAssetFile(result, track.src, `${label} source`, new Set([".vtt"]));
    requireString(result, track.srcLang, `${label} language`);
    requireString(result, track.label, `${label} label`);

    if (track.default !== undefined && typeof track.default !== "boolean") {
      addError(result, `${label} default must be true or false.`);
    }
  });
}

function validateAttribution(result, attribution) {
  if (attribution === undefined || attribution === null) {
    return;
  }

  if (!isRecord(attribution)) {
    addError(result, "Attribution must be an object when supplied.");
    return;
  }

  attributionFields.forEach((field) => {
    if (attribution[field] !== undefined && !isNonEmptyString(attribution[field])) {
      addError(result, `Attribution ${field} must be a non-empty string when supplied.`);
    }
  });

  const hasLicenseName = isNonEmptyString(attribution.licenseName);
  const hasLicenseUrl = isNonEmptyString(attribution.licenseUrl);

  if (hasLicenseName !== hasLicenseUrl) {
    addError(result, "Attribution licenseName and licenseUrl must be supplied together.");
  }

  ["licenseUrl", "sourceUrl"].forEach((field) => {
    if (!isNonEmptyString(attribution[field])) {
      return;
    }

    try {
      const url = new URL(attribution[field]);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        addError(result, `Attribution ${field} must use http or https.`);
      }
    } catch {
      addError(result, `Attribution ${field} must be a valid URL.`);
    }
  });
}

function validateOptionalRuntime(result, runtime) {
  if (runtime === undefined || runtime === null) {
    return;
  }

  if (!isRecord(runtime) || !Number.isFinite(runtime.minutes) || runtime.minutes <= 0) {
    addError(result, "runtime must contain a positive minutes value when supplied.");
  }
}

function validateOptionalAgeRange(result, ageRange) {
  if (ageRange === undefined || ageRange === null) {
    return;
  }

  if (!isRecord(ageRange) || !Number.isFinite(ageRange.minimum) || ageRange.minimum < 0) {
    addError(result, "ageRange must contain a non-negative minimum when supplied.");
    return;
  }

  if (ageRange.maximum !== undefined && (!Number.isFinite(ageRange.maximum) || ageRange.maximum < ageRange.minimum)) {
    addError(result, "ageRange maximum must be greater than or equal to minimum when supplied.");
  }
}

function validateOptionalMediaVersion(result, mediaVersion) {
  if (mediaVersion === undefined || mediaVersion === null) {
    return;
  }

  if (typeof mediaVersion !== "string" || !mediaVersionPattern.test(mediaVersion)) {
    addError(result, "mediaVersion must use lowercase letters, numbers, dots, underscores, or hyphens when supplied.");
  }
}

function validatePlacement(result, placement) {
  if (placement === undefined || placement === null) {
    addIncomplete(result, "placement is missing.");
    return;
  }

  if (!isRecord(placement)) {
    addError(result, "placement must be an object.");
    return;
  }

  if (!Array.isArray(placement.pages) || placement.pages.length === 0) {
    addIncomplete(result, "placement.pages needs at least one route.");
    return;
  }

  if (!Array.isArray(placement.collections) || placement.collections.length === 0) {
    addIncomplete(result, "placement.collections needs at least one collection.");
    return;
  }

  if (placement.position !== undefined && placement.position !== "start" && placement.position !== "end") {
    addError(result, "placement.position must be start or end when supplied.");
  }

  placement.pages.forEach((route) => {
    if (!sectionIdsByRoute.has(route)) {
      addError(result, `placement route ${String(route)} is unsupported.`);
      return;
    }

    if (route !== "home" && isNonEmptyString(result.metadata?.category) && route !== result.metadata.category) {
      addError(result, `placement route ${route} must match category ${result.metadata.category}.`);
    }

    if (!placement.collections.some((sectionId) => sectionIdsByRoute.get(route).has(sectionId))) {
      addError(result, `placement route ${route} has no matching collection.`);
    }
  });

  placement.collections.forEach((sectionId) => {
    if (!isNonEmptyString(sectionId)) {
      addError(result, "placement collection values must be non-empty strings.");
      return;
    }

    if (!placement.pages.some((route) => sectionIdsByRoute.get(route)?.has(sectionId))) {
      addError(result, `placement collection ${sectionId} has no matching route.`);
    }
  });
}

function validateMetadata(result) {
  const metadata = result.metadata;

  if (!isRecord(metadata)) {
    return;
  }

  ["name", "slug", "shortDescription", "longDescription", "language", "category", "collection"].forEach((field) => {
    requireString(result, metadata[field], field);
  });

  if (isNonEmptyString(metadata.slug) && (!slugPattern.test(metadata.slug) || metadata.slug !== result.directoryName)) {
    addError(result, "slug must be a lowercase URL-safe match for the package directory.");
  }

  if (isNonEmptyString(metadata.category) && !supportedCategories.has(metadata.category)) {
    addError(result, `category ${metadata.category} is unsupported.`);
  }

  if (isNonEmptyString(metadata.collection) && !Array.from(sectionIdsByRoute.values()).some((sections) => sections.has(metadata.collection))) {
    addError(result, `collection ${metadata.collection} is unsupported.`);
  }

  if (metadata.badges === undefined || metadata.badges === null) {
    addIncomplete(result, "badges is missing.");
  } else if (!Array.isArray(metadata.badges) || metadata.badges.some((badge) => !supportedBadges.has(badge))) {
    addError(result, "badges must contain only supported badge values.");
  }

  ["isFeatured", "isPandaPick", "isNew"].forEach((field) => requireBoolean(result, metadata[field], field));
  validateOptionalRuntime(result, metadata.runtime);
  validateOptionalAgeRange(result, metadata.ageRange);
  validateOptionalMediaVersion(result, metadata.mediaVersion);
  validatePlacement(result, metadata.placement);
  validateAttribution(result, metadata.attribution);

  if (isNonEmptyString(metadata.collection)
    && isRecord(metadata.placement)
    && Array.isArray(metadata.placement.collections)
    && !metadata.placement.collections.includes(metadata.collection)) {
    addError(result, "collection must be included in placement.collections.");
  }

  if (metadata.assets === undefined || metadata.assets === null) {
    addIncomplete(result, "assets is missing.");
    return;
  }

  if (!isRecord(metadata.assets)) {
    addError(result, "assets must be an object.");
    return;
  }

  addAssetFile(result, metadata.assets.cardImage, "Card artwork", supportedImageExtensions);
  addAssetFile(result, metadata.assets.heroPosterImage, "Hero poster", supportedImageExtensions);
  validateVideo(result, metadata.assets.heroPreviewVideo, "Hero preview");
  validateVideo(result, metadata.assets.fullVideo, "Full programme");

  if (isNonEmptyString(metadata.assets.heroPreviewVideo?.src)
    && metadata.assets.heroPreviewVideo.src === metadata.assets.fullVideo?.src) {
    addError(result, "Hero preview and full programme must reference distinct files.");
  }

  if (metadata.assets.titleLogoImage !== undefined && metadata.assets.titleLogoImage !== null) {
    addAssetFile(result, metadata.assets.titleLogoImage, "Title logo", supportedImageExtensions);
  }

  validateCaptionTracks(result, metadata.assets.captionTracks);
}

function canonicalAssetSource(slug, fileName) {
  return `${canonicalMediaPrefix}${slug}/${fileName}`;
}

function buildCaptionTracks(slug, tracks) {
  if (!Array.isArray(tracks)) {
    return undefined;
  }

  return tracks.map((track) => ({
    default: track.default,
    label: track.label,
    src: canonicalAssetSource(slug, track.src),
    srcLang: track.srcLang,
  }));
}

function buildAttribution(attribution) {
  if (!isRecord(attribution)) {
    return null;
  }

  return Object.fromEntries(attributionFields
    .filter((field) => isNonEmptyString(attribution[field]))
    .map((field) => [field, attribution[field]]));
}

function buildPlacements(metadata) {
  const placements = [];

  metadata.placement.pages.forEach((route) => {
    metadata.placement.collections.forEach((sectionId) => {
      if (sectionIdsByRoute.get(route)?.has(sectionId)) {
        placements.push({
          position: metadata.placement.position ?? "end",
          route,
          sectionId,
        });
      }
    });
  });

  return placements;
}

export function buildCatalogueRecord(result) {
  if (result.status !== "READY" || !isRecord(result.metadata)) {
    throw new Error(`Cannot create a record for ${result.directoryName} while it is ${result.status}.`);
  }

  const { metadata } = result;
  const { assets, slug } = metadata;
  const captionTracks = buildCaptionTracks(slug, assets.captionTracks);
  const fullVideo = {
    src: canonicalAssetSource(slug, assets.fullVideo.src),
    type: assets.fullVideo.type,
  };

  if (captionTracks) {
    fullVideo.captionTracks = captionTracks;
  }

  return {
    placements: buildPlacements(metadata),
    programme: {
      ageRange: metadata.ageRange ?? null,
      attribution: buildAttribution(metadata.attribution),
      badges: metadata.badges,
      category: metadata.category,
      collection: {
        id: `collection-${metadata.collection}`,
        slug: metadata.collection,
      },
      fullVideo,
      heroPosterImage: {
        alt: "",
        src: canonicalAssetSource(slug, assets.heroPosterImage),
      },
      heroPreviewVideo: {
        src: canonicalAssetSource(slug, assets.heroPreviewVideo.src),
        type: assets.heroPreviewVideo.type,
      },
      id: `${catalogueIdPrefix}${slug}`,
      isFeatured: metadata.isFeatured,
      isNew: metadata.isNew,
      isPandaPick: metadata.isPandaPick,
      language: metadata.language,
      longDescription: metadata.longDescription,
      ...(metadata.mediaVersion ? { mediaVersion: metadata.mediaVersion } : {}),
      name: metadata.name,
      runtime: metadata.runtime ?? null,
      shortDescription: metadata.shortDescription,
      slug,
      thumbnailImage: {
        alt: "",
        src: canonicalAssetSource(slug, assets.cardImage),
      },
      titleLogoImage: assets.titleLogoImage
        ? { alt: "", src: canonicalAssetSource(slug, assets.titleLogoImage) }
        : null,
    },
  };
}

function scanPackage(directoryName, root) {
  const directory = resolve(root, directoryName);
  const result = createResult(directoryName, directory);
  const metadataPath = resolve(directory, "metadata.json");

  if (!slugPattern.test(directoryName)) {
    addError(result, "Package directory must be a lowercase URL-safe slug.");
    return finaliseResult(result);
  }

  if (!existsSync(metadataPath)) {
    addIncomplete(result, "metadata.json is missing.");
    return finaliseResult(result);
  }

  try {
    result.metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  } catch (error) {
    addError(result, `metadata.json cannot be parsed: ${error instanceof Error ? error.message : "unknown error"}`);
    return finaliseResult(result);
  }

  validateMetadata(result);
  result.assetFiles = [...new Set(result.assetFiles)];
  return finaliseResult(result);
}

export function scanCatalogue(root = catalogueRoot) {
  if (!existsSync(root)) {
    return { packages: [], rootExists: false };
  }

  const packages = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => scanPackage(entry.name, root));
  const slugOccurrences = new Map();

  packages.forEach((result) => {
    const slug = result.metadata?.slug;

    if (isNonEmptyString(slug)) {
      slugOccurrences.set(slug, [...(slugOccurrences.get(slug) ?? []), result]);
    }
  });

  slugOccurrences.forEach((results, slug) => {
    if (results.length > 1) {
      results.forEach((result) => addError(result, `Duplicate staged slug ${slug}.`));
    }
  });

  packages.forEach((result) => {
    finaliseResult(result);

    if (result.status === "READY") {
      result.record = buildCatalogueRecord(result);
    }
  });

  return { packages, rootExists: true };
}

export function formatScanReport(scan) {
  if (!scan.rootExists || scan.packages.length === 0) {
    return ["No catalogue packages found at incoming/catalogue."];
  }

  const lines = [];

  scan.packages.forEach((result) => {
    lines.push(`${result.status.padEnd(10)} ${result.directoryName}`);
    [...result.incomplete, ...result.errors].forEach((message) => lines.push(`  - ${message}`));
  });

  const counts = scan.packages.reduce((summary, result) => ({
    ...summary,
    [result.status]: summary[result.status] + 1,
  }), { ERROR: 0, INCOMPLETE: 0, READY: 0 });

  lines.push(`Summary: READY=${counts.READY} INCOMPLETE=${counts.INCOMPLETE} ERROR=${counts.ERROR}`);
  return lines;
}

export function readJsonFile(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read ${label}: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

export function isCatalogueManifest(value) {
  return isRecord(value)
    && value.version === 1
    && value.status === "active"
    && Array.isArray(value.programmes);
}

export function catalogueAssetDestination(slug) {
  return resolve(publicProgrammesRoot, slug);
}
