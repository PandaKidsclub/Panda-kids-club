import releaseData from "@/lib/content/coming-soon-release.json";
import { getProgrammeBySlug } from "@/lib/content/fixtures";
import { COMING_SOON_ROTATION_MS } from "@/lib/coming-soon/constants";
import type { Programme } from "@/lib/content/types";

export { COMING_SOON_ROTATION_MS };

export type ComingSoonReleaseGroup = "learning" | "storytime" | "heroesFolktales";

export interface ComingSoonRelease {
  releaseId: string;
  releaseAt: string;
  upcomingProgrammeSlugs: string[];
  groups: Record<ComingSoonReleaseGroup, string[]>;
}

export const comingSoonRelease = releaseData as ComingSoonRelease;

export function getComingSoonBackdropSource(programme: Programme): string | null {
  return programme.heroPosterImage?.src ?? programme.thumbnailImage?.src ?? null;
}

export function validateComingSoonRelease(release: ComingSoonRelease = comingSoonRelease): void {
  const groups = Object.values(release.groups);
  const groupSlugs = groups.flat();
  const uniqueSlugs = new Set(release.upcomingProgrammeSlugs);

  if (!release.releaseId.trim()) {
    throw new Error("Coming Soon release needs a releaseId.");
  }

  if (!Number.isFinite(Date.parse(release.releaseAt))) {
    throw new Error("Coming Soon release needs a valid releaseAt timestamp.");
  }

  if (release.upcomingProgrammeSlugs.length !== 15) {
    throw new Error("Coming Soon release must contain exactly 15 upcoming programmes.");
  }

  if (uniqueSlugs.size !== release.upcomingProgrammeSlugs.length) {
    throw new Error("Coming Soon release programme slugs must be unique.");
  }

  if (groups.some((group) => group.length !== 5)) {
    throw new Error("Coming Soon release must contain five programmes in every category group.");
  }

  if (new Set(groupSlugs).size !== 15 || groupSlugs.some((slug) => !uniqueSlugs.has(slug))) {
    throw new Error("Coming Soon release groups must partition the fifteen upcoming programmes exactly once.");
  }

  const unknownSlug = release.upcomingProgrammeSlugs.find((slug) => !getProgrammeBySlug(slug));

  if (unknownSlug) {
    throw new Error(`Coming Soon release references an unknown programme: ${unknownSlug}.`);
  }
}

validateComingSoonRelease();

export function getComingSoonProgrammes(): Programme[] {
  return comingSoonRelease.upcomingProgrammeSlugs.map((slug) => {
    const programme = getProgrammeBySlug(slug);

    if (!programme) {
      throw new Error(`Coming Soon release references an unknown programme: ${slug}.`);
    }

    return programme;
  });
}
