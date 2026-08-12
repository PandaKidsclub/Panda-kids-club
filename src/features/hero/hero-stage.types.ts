import type { HeroSelectionSource, Programme } from "@/lib/content/types";

export type HeroMediaStatus = "idle" | "loading" | "playing" | "paused" | "blocked" | "error";
export type HeroTransitionState = "idle" | "loading" | "transitioning" | "settled" | "failed";

export interface HeroStageState {
  selectedProgramme: Programme | null;
  selectionSource: HeroSelectionSource | null;
  mediaStatus: HeroMediaStatus;
  muted: boolean;
  userPaused: boolean;
  explicitPlaybackRequested: boolean;
  playbackRequestVersion: number;
  transitionState: HeroTransitionState;
  prefersReducedMotion: boolean;
  saveData: boolean;
  heroVisible: boolean;
  documentVisible: boolean;
  failedVideoSrc: string | null;
}

export interface HeroStageActions {
  selectProgramme: (programme: Programme, source: HeroSelectionSource) => void;
  clearSelection: () => void;
  setMuted: (muted: boolean) => void;
  setUserPaused: (paused: boolean) => void;
  requestPlayback: () => void;
  setMediaStatus: (status: HeroMediaStatus) => void;
  setTransitionState: (state: HeroTransitionState) => void;
  setHeroVisible: (visible: boolean) => void;
  setDocumentVisible: (visible: boolean) => void;
  setPlaybackPreferences: (preferences: { prefersReducedMotion: boolean; saveData: boolean }) => void;
  markVideoFailed: (videoSrc: string | null) => void;
}

export interface HeroStageModel {
  state: HeroStageState;
  actions: HeroStageActions;
}
