"use client";

import Image from "next/image";
import { useRef } from "react";
import { usePointerDepthSurface } from "@/features/interaction/usePointerDepthSurface";
import type { HeroSelectionSource, Programme } from "@/lib/content/types";

type ProgrammeIntentSource = "hover" | "focus";

interface ProgrammeCardProps {
  programme: Programme;
  selected?: boolean;
  onPreviewIntentStart?: (programme: Programme, source: ProgrammeIntentSource) => void;
  onPreviewIntentEnd?: (programme: Programme, source: ProgrammeIntentSource) => void;
  onSelect?: (programme: Programme, source: HeroSelectionSource) => void;
}

function getBadgeLabel(programme: Programme): string | null {
  if (programme.isPandaPick) {
    return "Panda Pick";
  }

  if (programme.isNew) {
    return "New";
  }

  if (programme.badges.includes("preview")) {
    return "Coming Soon";
  }

  return null;
}

export function ProgrammeCard({
  programme,
  selected = false,
  onPreviewIntentStart,
  onPreviewIntentEnd,
  onSelect,
}: ProgrammeCardProps) {
  const badgeLabel = getBadgeLabel(programme);
  const selectionSourceRef = useRef<HeroSelectionSource>("manual");
  const { attachSurface, handlePointerLeave, handlePointerMove } = usePointerDepthSurface<HTMLButtonElement>({
    maxTiltX: 1.1,
    maxTiltY: 1.35,
  });

  return (
    <button
      ref={attachSurface}
      className="programme-card"
      type="button"
      aria-label={`Select ${programme.name}`}
      aria-pressed={selected}
      data-selected={selected || undefined}
      onBlur={() => onPreviewIntentEnd?.(programme, "focus")}
      onClick={() => {
        onSelect?.(programme, selectionSourceRef.current);
        selectionSourceRef.current = "manual";
      }}
      onFocus={() => onPreviewIntentStart?.(programme, "focus")}
      onMouseEnter={() => onPreviewIntentStart?.(programme, "hover")}
      onMouseLeave={() => onPreviewIntentEnd?.(programme, "hover")}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerDown={(event) => {
        selectionSourceRef.current = event.pointerType === "touch" ? "touch" : "manual";
      }}
    >
      <span className="programme-card__artwork">
        {programme.thumbnailImage ? (
          <Image
            alt=""
            fill
            sizes="(max-width: 560px) 62vw, (max-width: 900px) 34vw, 19vw"
            src={programme.thumbnailImage.src}
          />
        ) : (
          <span className="programme-card__placeholder" aria-hidden="true" />
        )}
        {badgeLabel ? <span className="programme-card__badge">{badgeLabel}</span> : null}
        <span className="programme-card__title">{programme.name}</span>
      </span>
    </button>
  );
}
