import {
  catalogueAssetDestination,
  catalogueManifestPath,
  isCatalogueManifest,
  pilotManifestPath,
  publicProgrammesRoot,
  readJsonFile,
  scanCatalogue,
} from "./content-pipeline.mjs";
import {
  copyFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

function fail(message) {
  console.error(`Content publish failed: ${message}`);
  process.exitCode = 1;
}

function parseArguments(argumentsList) {
  const normalizedArguments = argumentsList.filter((argument) => argument !== "--");
  const dryRun = normalizedArguments.includes("--dry-run");
  const titleArguments = normalizedArguments.filter((argument) => argument !== "--dry-run");

  if (titleArguments.length !== 1 || titleArguments[0].startsWith("-")) {
    throw new Error("Usage: pnpm content:publish -- [--dry-run] <title-slug>");
  }

  return { dryRun, title: titleArguments[0] };
}

function programmeIdentities(manifest) {
  return Array.isArray(manifest?.programmes)
    ? manifest.programmes.map(({ programme }) => ({ id: programme?.id, slug: programme?.slug }))
    : [];
}

function validatePublishTarget(result, catalogueManifest, pilotManifest) {
  if (result.status !== "READY" || !result.record) {
    throw new Error(`${result.directoryName} is ${result.status}; resolve scan findings before publishing.`);
  }

  if (!isCatalogueManifest(catalogueManifest)) {
    throw new Error("The live catalogue manifest is invalid.");
  }

  const identities = [...programmeIdentities(pilotManifest), ...programmeIdentities(catalogueManifest)];
  const { id, slug } = result.record.programme;

  if (identities.some((identity) => identity.id === id || identity.slug === slug)) {
    throw new Error(`${slug} is already live; publishing never overwrites a programme.`);
  }

  if (existsSync(catalogueAssetDestination(slug))) {
    throw new Error(`public/media/programmes/${slug} already exists; publishing never overwrites media.`);
  }
}

function printDryRun(result) {
  const { programme, placements } = result.record;

  console.log(`READY ${result.directoryName}`);
  console.log(`Would copy ${result.assetFiles.length} approved asset(s) to public/media/programmes/${programme.slug}/`);
  placements.forEach((placement) => console.log(`Would place ${programme.name} in ${placement.route}/${placement.sectionId} (${placement.position})`));
  console.log("Would register the programme in src/lib/content/production/catalogue-manifest.json");
  console.log("Would retain the supplied mediaVersion or generate a content-derived revision for remote cache keys.");
  console.log("Dry run complete. No files changed. Obtain human approval before the non-dry-run command.");
}

function createMediaVersion(result) {
  const digest = createHash("sha256");
  const buffer = Buffer.allocUnsafe(1_024 * 1_024);

  [...result.assetFiles]
    .sort()
    .forEach((fileName) => {
      const fileDescriptor = openSync(resolve(result.directory, fileName), "r");
      digest.update(fileName);
      digest.update("\0");
      let bytesRead = 0;

      try {
        do {
          bytesRead = readSync(fileDescriptor, buffer, 0, buffer.length, null);
          digest.update(buffer.subarray(0, bytesRead));
        } while (bytesRead > 0);
      } finally {
        closeSync(fileDescriptor);
      }

      digest.update("\0");
    });

  return `sha256-${digest.digest("hex").slice(0, 24)}`;
}

function withMediaVersion(result) {
  const { programme } = result.record;

  return {
    ...result.record,
    programme: {
      ...programme,
      mediaVersion: programme.mediaVersion ?? createMediaVersion(result),
    },
  };
}

function writeManifestAtomically(manifest) {
  const temporaryManifestPath = `${catalogueManifestPath}.${process.pid}.tmp`;
  writeFileSync(temporaryManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  renameSync(temporaryManifestPath, catalogueManifestPath);
}

function publish(result, catalogueManifest) {
  const record = withMediaVersion(result);
  const { programme } = record;
  const destination = catalogueAssetDestination(programme.slug);
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "panda-kids-club-content-"));
  const stagedDestination = resolve(temporaryDirectory, programme.slug);
  const nextManifest = {
    ...catalogueManifest,
    programmes: [...catalogueManifest.programmes, record],
  };
  let destinationPublished = false;

  try {
    mkdirSync(stagedDestination, { recursive: true });
    result.assetFiles.forEach((fileName) => {
      copyFileSync(resolve(result.directory, fileName), resolve(stagedDestination, fileName));
    });

    mkdirSync(publicProgrammesRoot, { recursive: true });
    renameSync(stagedDestination, destination);
    destinationPublished = true;
    writeManifestAtomically(nextManifest);

    const validation = spawnSync(process.execPath, ["scripts/validate-content.mjs"], {
      cwd: resolve(dirname(catalogueManifestPath), "../../../../"),
      encoding: "utf8",
    });

    if (validation.status !== 0) {
      throw new Error(validation.stderr || validation.stdout || "content validation failed after publish.");
    }
  } catch (error) {
    if (destinationPublished && existsSync(destination)) {
      rmSync(destination, { force: true, recursive: true });
    }

    writeManifestAtomically(catalogueManifest);
    throw error;
  } finally {
    rmSync(temporaryDirectory, { force: true, recursive: true });
  }

  console.log(`LIVE ${programme.name} (${programme.slug})`);
  console.log(`Registered in catalogue-manifest.json and copied ${result.assetFiles.length} asset(s) to public/media/programmes/${programme.slug}/`);
  console.log("The shared content registry now exposes the programme to its approved rails, hero selection, Search, Title Detail, My List, and Watch.");
}

try {
  const { dryRun, title } = parseArguments(process.argv.slice(2));
  const scan = scanCatalogue();
  const result = scan.packages.find((candidate) => candidate.directoryName === title);

  if (!result) {
    throw new Error(`No staged package named ${title} exists in incoming/catalogue/.`);
  }

  const catalogueManifest = readJsonFile(catalogueManifestPath, "the live catalogue manifest");
  const pilotManifest = readJsonFile(pilotManifestPath, "the pilot manifest");
  validatePublishTarget(result, catalogueManifest, pilotManifest);

  if (dryRun) {
    printDryRun(result);
  } else {
    publish(result, catalogueManifest);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : "unknown error");
}
