"use client";

import { useRef } from "react";
import { HeroAtmosphere } from "@/components/hero/HeroAtmosphere";
import { BambooEdge } from "@/components/hero/BambooEdge";
import { HeroContent } from "@/components/hero/HeroContent";
import { HeroControlsSlot } from "@/components/hero/HeroControlsSlot";
import { HeroMediaLayer, type HeroMediaController } from "@/components/hero/HeroMediaLayer";
import { HeroScrim } from "@/components/hero/HeroScrim";
import { useLibraryHeroPreview } from "@/features/hero/LibraryHeroPreviewProvider";
import { usePointerDepthSurface } from "@/features/interaction/usePointerDepthSurface";
import { getLibraryPathForTheme, getWatchHref } from "@/lib/navigation/watch-links";
import type { Programme } from "@/lib/content/types";
import type { PageTheme } from "@/lib/theme/page-themes";

interface HeroStageProps {
  title: string;
  theme: PageTheme;
  eyebrow?: string;
  description?: string | null;
  metadata?: string;
  pageHeading?: string;
  editorialEyebrow?: string;
  editorialDescription?: string;
  compactTitle?: boolean;
}

function getProgrammeMetadata(programme: Programme): string {
  const metadata = [
    programme.runtime ? `${programme.runtime.minutes} min` : null,
    programme.language,
  ].filter(Boolean);

  return metadata.length > 0 ? metadata.join(" • ") : "Coming Soon";
}

export function HeroStage({
  title,
  theme,
  eyebrow = "Preview",
  description = "Coming Soon",
  metadata,
  pageHeading,
  editorialEyebrow,
  editorialDescription,
  compactTitle = false,
}: HeroStageProps) {
  const libraryHeroPreview = useLibraryHeroPreview();
  const mediaControllerRef = useRef<HeroMediaController>(null);
  const { attachSurface, handlePointerLeave, handlePointerMove } = usePointerDepthSurface<HTMLElement>({
    maxTiltX: 0,
    maxTiltY: 0,
    onPosition: (element, horizontal, vertical) => {
      element.style.setProperty("--hero-media-x", `${(horizontal * 1.5).toFixed(2)}px`);
      element.style.setProperty("--hero-media-y", `${(vertical * 1).toFixed(2)}px`);
      element.style.setProperty("--hero-atmosphere-x", `${(horizontal * 3).toFixed(2)}px`);
      element.style.setProperty("--hero-atmosphere-y", `${(vertical * 2).toFixed(2)}px`);
      element.style.setProperty("--hero-depth-x", `${(horizontal * 4).toFixed(2)}px`);
      element.style.setProperty("--hero-depth-y", `${(vertical * 3).toFixed(2)}px`);
      element.style.setProperty("--hero-bamboo-x", `${(horizontal * 1.25).toFixed(2)}px`);
      element.style.setProperty("--hero-bamboo-y", `${(vertical * 0.75).toFixed(2)}px`);
      element.style.setProperty("--hero-bamboo-rotate", `${(horizontal * 0.25).toFixed(2)}deg`);
      element.style.setProperty("--hero-bamboo-tilt-x", `${(vertical * -0.8).toFixed(2)}deg`);
      element.style.setProperty("--hero-bamboo-tilt-y", `${(horizontal * 1.2).toFixed(2)}deg`);
    },
  });
  const selectedProgramme = libraryHeroPreview?.state.selectedProgramme ?? null;
  const headingId = `${theme}-hero-heading`;
  const resolvedTitle = selectedProgramme?.name ?? title;
  const resolvedEyebrow = selectedProgramme
    ? editorialEyebrow ?? theme.toUpperCase()
    : editorialEyebrow ?? eyebrow;
  const resolvedDescription = selectedProgramme
    ? selectedProgramme.shortDescription === "Coming Soon"
      ? editorialDescription ?? null
      : selectedProgramme.shortDescription
    : editorialDescription ?? description;
  const resolvedMetadata = selectedProgramme ? getProgrammeMetadata(selectedProgramme) : metadata;
  const previewAvailable = Boolean(selectedProgramme?.heroPreviewVideo);
  const previewIsPaused = libraryHeroPreview?.state.mediaStatus !== "playing";
  const libraryPath = getLibraryPathForTheme(theme);
  const playHref = selectedProgramme?.fullVideo ? getWatchHref(selectedProgramme.slug, libraryPath) : null;
  const moreInfoHref = selectedProgramme ? `/title/${selectedProgramme.slug}` : null;

  return (
    <section
      ref={attachSurface}
      className="hero-stage"
      data-theme={theme}
      data-media-status={libraryHeroPreview?.state.mediaStatus}
      aria-labelledby={headingId}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {pageHeading ? <h1 className="visually-hidden">{pageHeading}</h1> : null}
      <HeroMediaLayer
        ref={mediaControllerRef}
        programme={selectedProgramme}
        muted={libraryHeroPreview?.state.muted ?? true}
        userPaused={libraryHeroPreview?.state.userPaused ?? false}
        heroVisible={libraryHeroPreview?.state.heroVisible ?? true}
        documentVisible={libraryHeroPreview?.state.documentVisible ?? true}
        prefersReducedMotion={libraryHeroPreview?.state.prefersReducedMotion ?? false}
        saveData={libraryHeroPreview?.state.saveData ?? false}
        explicitPlaybackRequested={libraryHeroPreview?.state.explicitPlaybackRequested ?? false}
        playbackRequestVersion={libraryHeroPreview?.state.playbackRequestVersion ?? 0}
        onDocumentVisibilityChange={libraryHeroPreview?.actions.setDocumentVisible ?? (() => {})}
        onHeroVisibilityChange={libraryHeroPreview?.actions.setHeroVisible ?? (() => {})}
        onMediaStatusChange={libraryHeroPreview?.actions.setMediaStatus ?? (() => {})}
        onMutedChange={libraryHeroPreview?.actions.setMuted ?? (() => {})}
        onPlaybackRequest={libraryHeroPreview?.actions.requestPlayback ?? (() => {})}
        onTransitionStateChange={libraryHeroPreview?.actions.setTransitionState ?? (() => {})}
        onUserPausedChange={libraryHeroPreview?.actions.setUserPaused ?? (() => {})}
        onVideoFailure={libraryHeroPreview?.actions.markVideoFailed ?? (() => {})}
      />
      <HeroAtmosphere />
      <HeroScrim />
      <BambooEdge />
      <div className="hero-stage__safe-area">
        <HeroContent
          compactTitle={compactTitle}
          description={resolvedDescription}
          eyebrow={resolvedEyebrow}
          headingId={headingId}
          metadata={resolvedMetadata}
          moreInfoHref={moreInfoHref}
          playHref={playHref}
          programme={selectedProgramme}
          headingLevel={pageHeading ? "h2" : "h1"}
          title={resolvedTitle}
        />
        <HeroControlsSlot
          isMuted={libraryHeroPreview?.state.muted ?? true}
          isPaused={previewIsPaused}
          previewAvailable={previewAvailable}
          onToggleMuted={() => mediaControllerRef.current?.toggleMuted()}
          onTogglePlayback={() => {
            if (previewIsPaused) {
              mediaControllerRef.current?.resumePreview();
              return;
            }

            mediaControllerRef.current?.pausePreview();
          }}
        />
      </div>
    </section>
  );
}
