import type { Programme } from "@/lib/content/types";

export function normalizeSearchQuery(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function getAgeRangeSearchText(programme: Programme): string {
  if (!programme.ageRange) {
    return "";
  }

  return programme.ageRange.maximum
    ? `ages ${programme.ageRange.minimum} ${programme.ageRange.maximum}`
    : `ages ${programme.ageRange.minimum}`;
}

function getSearchFields(programme: Programme) {
  const title = normalizeSearchQuery(programme.name);
  const descriptive = normalizeSearchQuery([programme.shortDescription, programme.longDescription].join(" "));
  const metadata = normalizeSearchQuery([
    programme.language,
    getAgeRangeSearchText(programme),
    ...programme.badges,
    programme.isNew ? "new" : "",
    programme.isFeatured ? "featured" : "",
    programme.isPandaPick ? "panda pick" : "",
  ].join(" "));
  const catalogue = normalizeSearchQuery([
    programme.category,
    programme.collection?.slug.replaceAll("-", " ") ?? "",
  ].join(" "));

  return {
    title,
    descriptive,
    metadata,
    catalogue,
    all: `${title} ${descriptive} ${metadata} ${catalogue}`,
  };
}

function getRelevanceScore(fields: ReturnType<typeof getSearchFields>, query: string, tokens: string[]): number {
  let score = 0;

  if (fields.title === query) {
    score += 1000;
  } else if (fields.title.startsWith(query)) {
    score += 800;
  } else if (fields.title.includes(query)) {
    score += 600;
  }

  for (const token of tokens) {
    if (fields.title.includes(token)) {
      score += 50;
    }

    if (fields.descriptive.includes(token) || fields.metadata.includes(token)) {
      score += 15;
    }

    if (fields.catalogue.includes(token)) {
      score += 5;
    }
  }

  return score;
}

export function searchProgrammes(programmes: Programme[], rawQuery: string): Programme[] {
  const query = normalizeSearchQuery(rawQuery);

  if (!query) {
    return [];
  }

  const tokens = query.split(" ");
  const seenSlugs = new Set<string>();
  const matches = programmes.flatMap((programme, index) => {
    if (seenSlugs.has(programme.slug)) {
      return [];
    }

    seenSlugs.add(programme.slug);
    const fields = getSearchFields(programme);

    if (!tokens.every((token) => fields.all.includes(token))) {
      return [];
    }

    return [{ programme, index, score: getRelevanceScore(fields, query, tokens) }];
  });

  return matches
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ programme }) => programme);
}
