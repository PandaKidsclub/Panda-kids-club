"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProgrammeCard } from "@/components/content/ProgrammeCard";
import { useLibraryHeroPreview } from "@/features/hero/LibraryHeroPreviewProvider";
import type { HeroSelectionSource, Programme } from "@/lib/content/types";

type ProgrammeIntentSource = "hover" | "focus";

interface ContentRailProps {
  items: Programme[];
  sectionLabel: string;
  selectedProgrammeId?: string | null;
  onProgrammeIntentStart?: (programme: Programme, source: ProgrammeIntentSource) => void;
  onProgrammeIntentEnd?: (programme: Programme, source: ProgrammeIntentSource) => void;
  onProgrammeSelect?: (programme: Programme, source: HeroSelectionSource) => void;
}

export function ContentRail({
  items,
  sectionLabel,
  selectedProgrammeId,
  onProgrammeIntentStart,
  onProgrammeIntentEnd,
  onProgrammeSelect,
}: ContentRailProps) {
  const libraryHeroPreview = useLibraryHeroPreview();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [localSelectedProgrammeId, setLocalSelectedProgrammeId] = useState<string | null>(null);
  const railId = `${sectionLabel.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-rail`;
  const activeProgrammeId = libraryHeroPreview?.state.selectedProgramme?.id ?? selectedProgrammeId ?? localSelectedProgrammeId;

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const remainingScroll = viewport.scrollWidth - viewport.clientWidth - viewport.scrollLeft;
    setCanScrollPrevious(viewport.scrollLeft > 2);
    setCanScrollNext(remainingScroll > 2);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    updateScrollState();
    viewport.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [items.length, updateScrollState]);

  const scrollRail = (direction: -1 | 1) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollBy({
      left: direction * Math.max(viewport.clientWidth * 0.82, 240),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const beginPreviewIntent = (programme: Programme, source: ProgrammeIntentSource) => {
    if (libraryHeroPreview) {
      libraryHeroPreview.beginPreviewIntent(programme, source);
      return;
    }

    onProgrammeIntentStart?.(programme, source);
  };

  const endPreviewIntent = (programme: Programme, source: ProgrammeIntentSource) => {
    if (libraryHeroPreview) {
      libraryHeroPreview.cancelPreviewIntent(programme, source);
      return;
    }

    onProgrammeIntentEnd?.(programme, source);
  };

  const selectProgramme = (programme: Programme, source: HeroSelectionSource) => {
    if (libraryHeroPreview) {
      libraryHeroPreview.selectProgrammeImmediately(programme, source);
      return;
    }

    if (selectedProgrammeId === undefined) {
      setLocalSelectedProgrammeId(programme.id);
    }

    onProgrammeSelect?.(programme, source);
  };

  return (
    <div
      className="content-rail"
      data-can-scroll-next={canScrollNext || undefined}
      data-can-scroll-previous={canScrollPrevious || undefined}
    >
      <div className="content-rail__controls" role="group" aria-label={`${sectionLabel} controls`}>
        <button
          className="content-rail__control content-rail__control--previous"
          type="button"
          aria-controls={railId}
          aria-label={`Previous ${sectionLabel} programmes`}
          disabled={!canScrollPrevious}
          onClick={() => scrollRail(-1)}
        >
          <span className="rail-arrow rail-arrow--previous" aria-hidden="true" />
        </button>
        <button
          className="content-rail__control content-rail__control--next"
          type="button"
          aria-controls={railId}
          aria-label={`Next ${sectionLabel} programmes`}
          disabled={!canScrollNext}
          onClick={() => scrollRail(1)}
        >
          <span className="rail-arrow rail-arrow--next" aria-hidden="true" />
        </button>
      </div>
      <div
        id={railId}
        ref={viewportRef}
        className="content-rail__viewport"
        role="region"
        aria-label={`${sectionLabel} programmes`}
      >
        <ul className="content-rail__list">
          {items.map((programme) => (
            <li key={programme.id}>
              <ProgrammeCard
                programme={programme}
                selected={programme.id === activeProgrammeId}
                onPreviewIntentEnd={endPreviewIntent}
                onPreviewIntentStart={beginPreviewIntent}
                onSelect={selectProgramme}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
