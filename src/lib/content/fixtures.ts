import type {
  Collection,
  CollectionRef,
  LibraryPageConfiguration,
  PageSection,
  Programme,
  ProgrammeBadge,
  ProgrammeCategory,
} from "@/lib/content/types";
import {
  activeProductionProgrammes,
  applyProductionProgrammesToSection,
  getFeaturedProductionProgramme,
} from "@/lib/content/production/pilot-manifest";
import type { PilotRoute } from "@/lib/content/production/types";
import { resolveProgrammeMedia } from "@/lib/media/resolve-programme-media";
import type { PageTheme } from "@/lib/theme/page-themes";

const neutralDescription = "Coming Soon";

const collectionRefs = {
  pandaPicks: { id: "collection-panda-picks", slug: "panda-picks" },
  folktales: { id: "collection-folktales", slug: "magical-african-folktales" },
  adventures: { id: "collection-adventures", slug: "laugh-out-loud-adventures" },
  storytimeAdventures: { id: "collection-storytime-adventures", slug: "storytime-adventures" },
  moreStorytimeTitles: { id: "collection-more-storytime-titles", slug: "more-storytime-titles" },
  learnWithPanda: { id: "collection-learn-with-panda", slug: "learn-with-panda" },
  moreLearningTitles: { id: "collection-more-learning-titles", slug: "more-learning-titles" },
  realAfricanHeroes: { id: "collection-real-african-heroes", slug: "real-african-heroes" },
  featuredSpecials: { id: "collection-featured-specials", slug: "featured-specials" },
  monthlyEducationalTitles: { id: "collection-monthly-educational-titles", slug: "monthly-educational-titles" },
  monthlyStorytimeTitles: { id: "collection-monthly-storytime-titles", slug: "monthly-storytime-titles" },
  monthlyHeroesFolktaleTitles: { id: "collection-monthly-heroes-folktale-titles", slug: "monthly-heroes-folktale-titles" },
} as const satisfies Record<string, CollectionRef>;

interface DevelopmentProgrammeConfig {
  category: ProgrammeCategory;
  collection: CollectionRef;
  badges?: ProgrammeBadge[];
  isNew?: boolean;
  isFeatured?: boolean;
  isPandaPick?: boolean;
}

function createDevelopmentProgramme(
  idPrefix: string,
  index: number,
  { category, collection, badges = [], isNew = false, isFeatured = false, isPandaPick = false }: DevelopmentProgrammeConfig,
): Programme {
  const identifier = String(index).padStart(2, "0");
  const programmeId = `${idPrefix}-${identifier}`;

  return {
    id: programmeId,
    slug: programmeId,
    name: `Programme ${index}`,
    shortDescription: neutralDescription,
    longDescription: neutralDescription,
    runtime: null,
    language: null,
    category,
    collection,
    ageRange: null,
    thumbnailImage: null,
    heroPosterImage: null,
    heroPreviewVideo: null,
    fullVideo: null,
    titleLogoImage: null,
    attribution: null,
    badges,
    isNew,
    isFeatured,
    isPandaPick,
  };
}

const homeProgrammeConfigs: DevelopmentProgrammeConfig[] = [
  { category: "stories", collection: collectionRefs.pandaPicks, badges: ["panda-pick"], isPandaPick: true },
  { category: "learn", collection: collectionRefs.pandaPicks },
  { category: "heroes", collection: collectionRefs.pandaPicks },
  { category: "stories", collection: collectionRefs.pandaPicks, badges: ["new"], isNew: true },
  { category: "learn", collection: collectionRefs.pandaPicks },
  { category: "stories", collection: collectionRefs.folktales },
  { category: "stories", collection: collectionRefs.folktales, badges: ["preview"] },
  { category: "stories", collection: collectionRefs.folktales },
  { category: "stories", collection: collectionRefs.folktales, badges: ["panda-pick"], isPandaPick: true },
  { category: "stories", collection: collectionRefs.folktales },
  { category: "stories", collection: collectionRefs.adventures },
  { category: "heroes", collection: collectionRefs.adventures, badges: ["new"], isNew: true },
  { category: "learn", collection: collectionRefs.adventures },
  { category: "stories", collection: collectionRefs.adventures },
  { category: "heroes", collection: collectionRefs.adventures, badges: ["featured"], isFeatured: true },
];

const storyProgrammeConfigs: DevelopmentProgrammeConfig[] = [
  { category: "stories", collection: collectionRefs.storytimeAdventures, badges: ["panda-pick"], isPandaPick: true },
  { category: "stories", collection: collectionRefs.storytimeAdventures, badges: ["featured"], isFeatured: true },
  { category: "stories", collection: collectionRefs.storytimeAdventures },
  { category: "stories", collection: collectionRefs.storytimeAdventures, badges: ["new"], isNew: true },
  { category: "stories", collection: collectionRefs.storytimeAdventures },
  { category: "stories", collection: collectionRefs.storytimeAdventures },
  { category: "stories", collection: collectionRefs.storytimeAdventures },
  { category: "stories", collection: collectionRefs.moreStorytimeTitles },
  { category: "stories", collection: collectionRefs.moreStorytimeTitles, badges: ["panda-pick"], isPandaPick: true },
  { category: "stories", collection: collectionRefs.moreStorytimeTitles },
  { category: "stories", collection: collectionRefs.moreStorytimeTitles, badges: ["new"], isNew: true },
  { category: "stories", collection: collectionRefs.moreStorytimeTitles },
  { category: "stories", collection: collectionRefs.moreStorytimeTitles },
  { category: "stories", collection: collectionRefs.moreStorytimeTitles },
];

const learnProgrammeConfigs: DevelopmentProgrammeConfig[] = [
  { category: "learn", collection: collectionRefs.learnWithPanda, badges: ["panda-pick"], isPandaPick: true },
  { category: "learn", collection: collectionRefs.learnWithPanda },
  { category: "learn", collection: collectionRefs.learnWithPanda, badges: ["featured"], isFeatured: true },
  { category: "learn", collection: collectionRefs.learnWithPanda, badges: ["new"], isNew: true },
  { category: "learn", collection: collectionRefs.learnWithPanda },
  { category: "learn", collection: collectionRefs.learnWithPanda },
  { category: "learn", collection: collectionRefs.learnWithPanda },
  { category: "learn", collection: collectionRefs.moreLearningTitles },
  { category: "learn", collection: collectionRefs.moreLearningTitles, badges: ["panda-pick"], isPandaPick: true },
  { category: "learn", collection: collectionRefs.moreLearningTitles },
  { category: "learn", collection: collectionRefs.moreLearningTitles, badges: ["new"], isNew: true },
  { category: "learn", collection: collectionRefs.moreLearningTitles },
  { category: "learn", collection: collectionRefs.moreLearningTitles },
  { category: "learn", collection: collectionRefs.moreLearningTitles },
];

const heroProgrammeConfigs: DevelopmentProgrammeConfig[] = Array.from({ length: 12 }, (_, index) => ({
  category: "heroes",
  collection: collectionRefs.realAfricanHeroes,
  badges: index === 0 ? ["panda-pick"] : index === 2 ? ["featured"] : index === 5 ? ["new"] : [],
  isFeatured: index === 2,
  isNew: index === 5,
  isPandaPick: index === 0,
}));

const specialProgrammeConfigs: DevelopmentProgrammeConfig[] = Array.from({ length: 12 }, (_, index) => ({
  category: "specials",
  collection: collectionRefs.featuredSpecials,
  badges: index === 0 ? ["new"] : index === 1 ? ["featured"] : index === 4 ? ["panda-pick"] : [],
  isFeatured: index === 1,
  isNew: index === 0,
  isPandaPick: index === 4,
}));

const monthlyEducationalProgrammeConfigs: DevelopmentProgrammeConfig[] = Array.from({ length: 5 }, () => ({
  category: "learn",
  collection: collectionRefs.monthlyEducationalTitles,
  badges: ["new"],
  isNew: true,
}));

const monthlyStorytimeProgrammeConfigs: DevelopmentProgrammeConfig[] = Array.from({ length: 5 }, () => ({
  category: "stories",
  collection: collectionRefs.monthlyStorytimeTitles,
  badges: ["new"],
  isNew: true,
}));

const monthlyHeroesFolktaleProgrammeConfigs: DevelopmentProgrammeConfig[] = Array.from({ length: 5 }, () => ({
  category: "heroes",
  collection: collectionRefs.monthlyHeroesFolktaleTitles,
  badges: ["new"],
  isNew: true,
}));

export const developmentProgrammes: Programme[] = homeProgrammeConfigs.map((config, index) =>
  createDevelopmentProgramme("programme", index + 1, config),
);

export const developmentStoryProgrammes: Programme[] = storyProgrammeConfigs.map((config, index) =>
  createDevelopmentProgramme("story-programme", index + 1, config),
);

export const developmentLearnProgrammes: Programme[] = learnProgrammeConfigs.map((config, index) =>
  createDevelopmentProgramme("learn-programme", index + 1, config),
);

export const developmentHeroProgrammes: Programme[] = heroProgrammeConfigs.map((config, index) =>
  createDevelopmentProgramme("hero-programme", index + 1, config),
);

export const developmentSpecialProgrammes: Programme[] = specialProgrammeConfigs.map((config, index) =>
  createDevelopmentProgramme("special-programme", index + 1, config),
);

export const developmentMonthlyEducationalProgrammes: Programme[] = monthlyEducationalProgrammeConfigs.map((config, index) =>
  createDevelopmentProgramme("monthly-learn-programme", index + 1, config),
);

export const developmentMonthlyStorytimeProgrammes: Programme[] = monthlyStorytimeProgrammeConfigs.map((config, index) =>
  createDevelopmentProgramme("monthly-story-programme", index + 1, config),
);

export const developmentMonthlyHeroesFolktaleProgrammes: Programme[] = monthlyHeroesFolktaleProgrammeConfigs.map((config, index) =>
  createDevelopmentProgramme("monthly-hero-programme", index + 1, config),
);

export const developmentCollections: Collection[] = [
  {
    ...collectionRefs.pandaPicks,
    name: "Panda Picks",
    description: neutralDescription,
    theme: "home",
    programmeIds: developmentProgrammes.slice(0, 5).map((programme) => programme.id),
  },
  {
    ...collectionRefs.folktales,
    name: "Magical African Folktales",
    description: neutralDescription,
    theme: "home",
    programmeIds: developmentProgrammes.slice(5, 10).map((programme) => programme.id),
  },
  {
    ...collectionRefs.adventures,
    name: "Laugh Out Loud Adventures",
    description: neutralDescription,
    theme: "home",
    programmeIds: developmentProgrammes.slice(10, 15).map((programme) => programme.id),
  },
];

export const developmentStoryPageSections: PageSection[] = [
  {
    id: "storytime-adventures",
    kind: "rail",
    heading: "Storytime Adventures",
    theme: "stories",
    programmeIds: developmentStoryProgrammes.slice(0, 7).map((programme) => programme.id),
    collectionId: collectionRefs.storytimeAdventures.id,
  },
  {
    id: "more-storytime-titles",
    kind: "rail",
    heading: "More Storytime Titles",
    theme: "stories",
    programmeIds: developmentStoryProgrammes.slice(7).map((programme) => programme.id),
    collectionId: collectionRefs.moreStorytimeTitles.id,
  },
];

export const developmentLearnPageSections: PageSection[] = [
  {
    id: "learn-with-panda",
    kind: "rail",
    heading: "Learn with Panda",
    theme: "learn",
    programmeIds: developmentLearnProgrammes.slice(0, 7).map((programme) => programme.id),
    collectionId: collectionRefs.learnWithPanda.id,
  },
  {
    id: "more-learning-titles",
    kind: "rail",
    heading: "More Learning Titles",
    theme: "learn",
    programmeIds: developmentLearnProgrammes.slice(7).map((programme) => programme.id),
    collectionId: collectionRefs.moreLearningTitles.id,
  },
];

export const developmentHeroesPageSections: PageSection[] = [
  {
    id: "real-african-heroes",
    kind: "rail",
    heading: "Real African Heroes",
    theme: "heroes",
    programmeIds: developmentHeroProgrammes.map((programme) => programme.id),
    collectionId: collectionRefs.realAfricanHeroes.id,
    accent: "playful",
  },
];

export const developmentSpecialsPageSections: PageSection[] = [
  {
    id: "featured-specials",
    kind: "rail",
    heading: "Featured Specials",
    theme: "specials",
    programmeIds: developmentSpecialProgrammes.map((programme) => programme.id),
    collectionId: collectionRefs.featuredSpecials.id,
    accent: "warm",
  },
];

export const developmentMonthlyUpdatesPageSections: PageSection[] = [
  {
    id: "new-educational-titles",
    kind: "rail",
    heading: "New Educational Titles",
    theme: "monthly-updates",
    programmeIds: developmentMonthlyEducationalProgrammes.map((programme) => programme.id),
    collectionId: collectionRefs.monthlyEducationalTitles.id,
    accent: "default",
  },
  {
    id: "new-storytime-adventure-titles",
    kind: "rail",
    heading: "New Storytime Adventure Titles",
    theme: "monthly-updates",
    programmeIds: developmentMonthlyStorytimeProgrammes.map((programme) => programme.id),
    collectionId: collectionRefs.monthlyStorytimeTitles.id,
    accent: "playful",
  },
  {
    id: "new-heroes-and-folktale-titles",
    kind: "rail",
    heading: "New Heroes and Folktale Titles",
    theme: "monthly-updates",
    programmeIds: developmentMonthlyHeroesFolktaleProgrammes.map((programme) => programme.id),
    collectionId: collectionRefs.monthlyHeroesFolktaleTitles.id,
    accent: "warm",
  },
];

export const developmentPageSections: PageSection[] = [
  {
    id: "panda-picks",
    kind: "rail",
    heading: "Panda Picks",
    theme: "home",
    programmeIds: developmentCollections[0].programmeIds,
    collectionId: collectionRefs.pandaPicks.id,
    href: "/stories",
    accent: "default",
  },
  {
    id: "magical-african-folktales",
    kind: "rail",
    heading: "Magical African Folktales",
    theme: "home",
    programmeIds: developmentCollections[1].programmeIds,
    collectionId: collectionRefs.folktales.id,
    href: "/stories",
    accent: "warm",
  },
  {
    id: "laugh-out-loud-adventures",
    kind: "rail",
    heading: "Laugh Out Loud Adventures",
    theme: "home",
    programmeIds: developmentCollections[2].programmeIds,
    collectionId: collectionRefs.adventures.id,
    href: "/stories",
    accent: "playful",
  },
];

export const storiesLibraryPage: LibraryPageConfiguration = {
  id: "stories-library",
  title: "Stories",
  theme: "stories",
  heroEyebrow: "Stories",
  heroDescription: "Magical worlds, courageous children and unforgettable African tales.",
  featuredProgrammeId: "story-programme-02",
  sections: developmentStoryPageSections,
};

export const learnLibraryPage: LibraryPageConfiguration = {
  id: "learn-library",
  title: "Learn",
  theme: "learn",
  heroEyebrow: "Learn",
  heroDescription: "Languages, numbers, science, safety and everyday discoveries.",
  featuredProgrammeId: "learn-programme-03",
  sections: developmentLearnPageSections,
};

export const heroesLibraryPage: LibraryPageConfiguration = {
  id: "heroes-library",
  title: "Heroes",
  theme: "heroes",
  heroEyebrow: "Heroes",
  heroDescription: "Meet the scientists, leaders, athletes and innovators who changed our world.",
  featuredProgrammeId: "hero-programme-03",
  sections: developmentHeroesPageSections,
};

export const specialsLibraryPage: LibraryPageConfiguration = {
  id: "specials-library",
  title: "Specials",
  theme: "specials",
  heroEyebrow: "Specials",
  heroDescription: "Stories that help children understand our past, our people and the values that connect us.",
  featuredProgrammeId: "special-programme-02",
  sections: developmentSpecialsPageSections,
};

export const allDevelopmentProgrammes = [
  ...developmentProgrammes,
  ...developmentStoryProgrammes,
  ...developmentLearnProgrammes,
  ...developmentHeroProgrammes,
  ...developmentSpecialProgrammes,
  ...developmentMonthlyEducationalProgrammes,
  ...developmentMonthlyStorytimeProgrammes,
  ...developmentMonthlyHeroesFolktaleProgrammes,
];

export const allProgrammes = [
  ...allDevelopmentProgrammes.map((programme) => resolveProgrammeMedia(programme)),
  ...activeProductionProgrammes,
];

function assertUniqueProgrammeIdentity(programmes: Programme[]): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  programmes.forEach((programme) => {
    if (ids.has(programme.id) || slugs.has(programme.slug)) {
      throw new Error(`Duplicate programme identity: ${programme.id} (${programme.slug})`);
    }

    ids.add(programme.id);
    slugs.add(programme.slug);
  });
}

assertUniqueProgrammeIdentity(allProgrammes);

const programmesById = new Map(allProgrammes.map((programme) => [programme.id, programme]));
const programmesBySlug = new Map(allProgrammes.map((programme) => [programme.slug, programme]));

export function getProgrammeById(programmeId: string): Programme | null {
  return programmesById.get(programmeId) ?? null;
}

export function getProgrammeBySlug(slug: string): Programme | null {
  return programmesBySlug.get(slug) ?? null;
}

export function getDevelopmentProgrammes(programmeIds: string[]): Programme[] {
  return programmeIds.flatMap((programmeId) => {
    const programme = getProgrammeById(programmeId);
    return programme ? [programme] : [];
  });
}

export function getProgrammesForSection(
  route: PilotRoute,
  sectionId: string,
  programmeIds: string[],
): Programme[] {
  return applyProductionProgrammesToSection(route, sectionId, getDevelopmentProgrammes(programmeIds));
}

export function getPilotRouteForTheme(theme: PageTheme): PilotRoute | null {
  return theme === "home" || theme === "stories" || theme === "learn" || theme === "heroes" || theme === "specials" || theme === "monthly-updates"
    ? theme
    : null;
}

export function getFeaturedProgrammeForRoute(route: PilotRoute, fallbackProgrammeId: string): Programme {
  return getFeaturedProductionProgramme(route) ?? getProgrammeById(fallbackProgrammeId) ?? developmentProgrammes[0];
}

export function getFeaturedDevelopmentProgramme(): Programme {
  return getFeaturedProgrammeForRoute("home", developmentProgrammes.find((programme) => programme.isFeatured)?.id ?? developmentProgrammes[0].id);
}
