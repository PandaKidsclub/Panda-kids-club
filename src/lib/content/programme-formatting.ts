import type { Programme, ProgrammeBadge } from "@/lib/content/types";

const badgeLabels: Record<ProgrammeBadge, string> = {
  new: "New",
  featured: "Featured",
  "panda-pick": "Panda Pick",
  preview: "Coming Soon",
};

export function formatProgrammeMetadata(programme: Programme): string | null {
  const ageRange = programme.ageRange
    ? programme.ageRange.maximum
      ? `Ages ${programme.ageRange.minimum}-${programme.ageRange.maximum}`
      : `Ages ${programme.ageRange.minimum}+`
    : null;
  const metadata = [
    programme.runtime ? `${programme.runtime.minutes} min` : null,
    programme.language,
    ageRange,
  ].filter((item): item is string => Boolean(item));

  return metadata.length > 0 ? metadata.join(" - ") : null;
}

export function getProgrammeBadgeLabels(programme: Programme): string[] {
  const badges = new Set(programme.badges);

  if (programme.isPandaPick) {
    badges.add("panda-pick");
  }

  if (programme.isFeatured) {
    badges.add("featured");
  }

  if (programme.isNew) {
    badges.add("new");
  }

  return [...badges].map((badge) => badgeLabels[badge]);
}
