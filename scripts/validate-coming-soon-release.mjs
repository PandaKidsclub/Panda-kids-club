import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const releasePath = resolve(repositoryRoot, "src/lib/content/coming-soon-release.json");
const fixturePath = resolve(repositoryRoot, "src/lib/content/fixtures.ts");
const groupRules = {
  learning: "monthly-learn-programme",
  storytime: "monthly-story-programme",
  heroesFolktales: "monthly-hero-programme",
};

const errors = [];

function report(message) {
  errors.push(message);
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

let release;

try {
  release = JSON.parse(readFileSync(releasePath, "utf8"));
} catch (error) {
  report(`Unable to read Coming Soon release configuration: ${error instanceof Error ? error.message : "unknown error"}`);
}

const fixtureSource = readFileSync(fixturePath, "utf8");

if (!isRecord(release)) {
  report("Coming Soon release configuration must be an object.");
} else {
  const { groups, releaseAt, releaseId, upcomingProgrammeSlugs } = release;

  if (typeof releaseId !== "string" || releaseId.trim().length === 0) {
    report("Coming Soon release needs a releaseId.");
  }

  if (typeof releaseAt !== "string" || !Number.isFinite(Date.parse(releaseAt))) {
    report("Coming Soon release needs a valid releaseAt timestamp.");
  }

  if (!Array.isArray(upcomingProgrammeSlugs) || upcomingProgrammeSlugs.length !== 15) {
    report("Coming Soon release must list exactly 15 upcoming programme slugs.");
  } else if (new Set(upcomingProgrammeSlugs).size !== upcomingProgrammeSlugs.length) {
    report("Coming Soon release programme slugs must be unique.");
  }

  if (!isRecord(groups)) {
    report("Coming Soon release needs category groups.");
  } else {
    const groupSlugs = [];

    Object.entries(groupRules).forEach(([group, prefix]) => {
      const slugs = groups[group];

      if (!Array.isArray(slugs) || slugs.length !== 5) {
        report(`Coming Soon release group ${group} must contain exactly five titles.`);
        return;
      }

      slugs.forEach((slug, index) => {
        const expectedSlug = `${prefix}-${String(index + 1).padStart(2, "0")}`;

        if (slug !== expectedSlug) {
          report(`Coming Soon release group ${group} contains invalid fixture slug ${String(slug)}.`);
        }
      });

      if (!fixtureSource.includes(`createDevelopmentProgramme("${prefix}", index + 1`)) {
        report(`Coming Soon release group ${group} references a fixture family that is not registered.`);
      }

      groupSlugs.push(...slugs);
    });

    if (new Set(groupSlugs).size !== 15 || !Array.isArray(upcomingProgrammeSlugs) || groupSlugs.some((slug) => !upcomingProgrammeSlugs.includes(slug))) {
      report("Coming Soon release groups must partition the ordered title list exactly once.");
    }
  }
}

if (errors.length > 0) {
  errors.forEach((error) => console.error(`Error: ${error}`));
  process.exitCode = 1;
} else {
  console.log("Coming Soon release validation passed: 15 ordered titles across three five-title groups.");
}
