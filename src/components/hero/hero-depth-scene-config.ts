import type { PageTheme } from "@/lib/theme/page-themes";

export interface HeroDepthSceneConfig {
  primary: string;
  secondary: string;
  accent: string;
  ambientIntensity: number;
  directionalIntensity: number;
}

const heroDepthSceneConfigs: Partial<Record<PageTheme, HeroDepthSceneConfig>> = {
  home: {
    primary: "#1d7598",
    secondary: "#4bc3d4",
    accent: "#f7c84b",
    ambientIntensity: 0.4,
    directionalIntensity: 0.46,
  },
  stories: {
    primary: "#9a6436",
    secondary: "#7bc47f",
    accent: "#f2ad4b",
    ambientIntensity: 0.38,
    directionalIntensity: 0.42,
  },
  learn: {
    primary: "#a34c3d",
    secondary: "#f7cf5b",
    accent: "#ff8d54",
    ambientIntensity: 0.4,
    directionalIntensity: 0.44,
  },
  heroes: {
    primary: "#1b837c",
    secondary: "#55c6b8",
    accent: "#d8b763",
    ambientIntensity: 0.38,
    directionalIntensity: 0.44,
  },
  specials: {
    primary: "#454a87",
    secondary: "#cf86d7",
    accent: "#f0b86c",
    ambientIntensity: 0.36,
    directionalIntensity: 0.4,
  },
};

export function getHeroDepthSceneConfig(theme: PageTheme): HeroDepthSceneConfig {
  return heroDepthSceneConfigs[theme] ?? heroDepthSceneConfigs.home!;
}
