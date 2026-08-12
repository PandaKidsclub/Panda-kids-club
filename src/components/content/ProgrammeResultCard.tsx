"use client";

import Image from "next/image";
import Link from "next/link";
import type { Ref } from "react";
import { MyListButton } from "@/components/my-list/MyListButton";
import { usePointerDepthSurface } from "@/features/interaction/usePointerDepthSurface";
import { formatProgrammeMetadata, getProgrammeBadgeLabels } from "@/lib/content/programme-formatting";
import type { Programme } from "@/lib/content/types";

type ListAction = "toggle" | "remove";

interface ProgrammeResultCardProps {
  programme: Programme;
  listAction?: ListAction;
  onRemoved?: (slug: string) => void;
  removeButtonRef?: Ref<HTMLButtonElement>;
}

function formatCategory(category: Programme["category"]): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ProgrammeResultCard({
  programme,
  listAction,
  onRemoved,
  removeButtonRef,
}: ProgrammeResultCardProps) {
  const metadata = formatProgrammeMetadata(programme);
  const badgeLabel = getProgrammeBadgeLabels(programme)[0];
  const detailHref = `/title/${programme.slug}`;
  const { attachSurface, handlePointerLeave, handlePointerMove } = usePointerDepthSurface<HTMLAnchorElement>();

  return (
    <article className="catalogue-result-card">
      <Link
        ref={attachSurface}
        className="catalogue-result-card__link"
        href={detailHref}
        aria-label={`View ${programme.name} details`}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
      >
        <span className="catalogue-result-card__artwork">
          {programme.thumbnailImage ? (
            <Image
              alt=""
              fill
              sizes="(max-width: 560px) 100vw, (max-width: 900px) 48vw, (max-width: 1180px) 31vw, 23vw"
              src={programme.thumbnailImage.src}
            />
          ) : (
            <span className="catalogue-result-card__placeholder" aria-hidden="true" />
          )}
          {badgeLabel ? <span className="catalogue-result-card__badge">{badgeLabel}</span> : null}
          <span className="catalogue-result-card__title">{programme.name}</span>
        </span>
        <span className="catalogue-result-card__metadata">
          {metadata ? <span>{metadata}</span> : null}
          <span>{formatCategory(programme.category)}</span>
        </span>
      </Link>
      {listAction ? (
        <MyListButton
          ref={listAction === "remove" ? removeButtonRef : undefined}
          className="catalogue-result-card__list-button button--secondary"
          presentation={listAction}
          programme={programme}
          onRemoved={onRemoved}
        />
      ) : null}
    </article>
  );
}
