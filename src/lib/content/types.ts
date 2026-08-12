import type { PageTheme } from "@/lib/theme/page-themes";

export type ProgrammeCategory =
  | "stories"
  | "learn"
  | "heroes"
  | "specials"
  | "monthly-updates";

export interface Runtime {
  minutes: number;
}

export interface AgeRange {
  minimum: number;
  maximum?: number;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface CaptionTrack {
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
}

export interface VideoSource {
  src: string;
  type: string;
}

export interface VideoAsset {
  src: string;
  type?: string;
  sources?: VideoSource[];
  poster?: ImageAsset;
  durationSeconds?: number;
  captionsSrc?: string;
  captionTracks?: CaptionTrack[];
}

export interface ProgrammeAttribution {
  originalTitle?: string;
  sourceName?: string;
  author?: string;
  adapter?: string;
  translator?: string;
  illustrator?: string;
  copyrightNotice?: string;
  licenseName?: string;
  licenseUrl?: string;
  sourceUrl?: string;
  adaptationNote?: string;
  attributionText?: string;
}

export function getVideoSources(video: VideoAsset | null | undefined): VideoSource[] {
  if (!video) {
    return [];
  }

  const primarySource = { src: video.src, type: video.type ?? "video/mp4" };
  const alternativeSources = video.sources ?? [];

  return [primarySource, ...alternativeSources].filter((source, index, sources) => (
    sources.findIndex((candidate) => candidate.src === source.src && candidate.type === source.type) === index
  ));
}

export function getPrimaryVideoSource(video: VideoAsset | null | undefined): VideoSource | null {
  return getVideoSources(video)[0] ?? null;
}

export interface CollectionRef {
  id: string;
  slug: string;
}

export type ProgrammeBadge = "new" | "featured" | "panda-pick" | "preview";

export interface Programme {
  id: string;
  slug: string;
  /**
   * Content-derived revision used only for immutable remote-media cache keys.
   * Local development URLs intentionally remain unchanged.
   */
  mediaVersion?: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  runtime: Runtime | null;
  language: string | null;
  category: ProgrammeCategory;
  collection: CollectionRef | null;
  ageRange: AgeRange | null;
  thumbnailImage: ImageAsset | null;
  heroPosterImage: ImageAsset | null;
  heroPreviewVideo: VideoAsset | null;
  fullVideo: VideoAsset | null;
  titleLogoImage: ImageAsset | null;
  attribution: ProgrammeAttribution | null;
  badges: ProgrammeBadge[];
  isNew: boolean;
  isFeatured: boolean;
  isPandaPick: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  theme: PageTheme;
  programmeIds: string[];
}

export type PageSectionKind = "hero" | "rail" | "feature" | "placeholder";

export type PageSectionAccent = "default" | "warm" | "playful";

export interface PageSection {
  id: string;
  kind: PageSectionKind;
  heading: string;
  theme: PageTheme;
  programmeIds: string[];
  collectionId?: string;
  href?: string;
  accent?: PageSectionAccent;
}

export interface LibraryPageConfiguration {
  id: string;
  title: string;
  theme: PageTheme;
  heroEyebrow: string;
  heroDescription: string;
  featuredProgrammeId: string;
  sections: PageSection[];
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  theme: PageTheme;
}

export type HeroSelectionSource = "initial" | "hover" | "focus" | "touch" | "route" | "manual";

export interface HeroSelection {
  programmeId: string | null;
  source: HeroSelectionSource;
  dwellStartedAt: number | null;
}
