"use client";

import { forwardRef } from "react";
import { useMyList } from "@/features/my-list/MyListProvider";
import type { Programme } from "@/lib/content/types";

type MyListButtonPresentation = "toggle" | "remove";

interface MyListButtonProps {
  programme: Programme;
  className?: string;
  presentation?: MyListButtonPresentation;
  onRemoved?: (slug: string) => void;
}

export const MyListButton = forwardRef<HTMLButtonElement, MyListButtonProps>(function MyListButton(
  { programme, className = "", presentation = "toggle", onRemoved },
  ref,
) {
  const { add, contains, isHydrated, remove } = useMyList();
  const isSaved = contains(programme.slug);
  const isRemoveControl = presentation === "remove";
  const accessibleLabel = isSaved
    ? `Remove ${programme.name} from My List`
    : `Add ${programme.name} to My List`;
  const visibleLabel = isRemoveControl ? "Remove" : isSaved ? "In My List" : "+ My List";

  return (
    <button
      ref={ref}
      className={`button ${className}`.trim()}
      type="button"
      aria-label={isHydrated ? accessibleLabel : "My List"}
      aria-pressed={isSaved}
      disabled={!isHydrated}
      onClick={() => {
        if (isSaved) {
          remove(programme.slug);
          onRemoved?.(programme.slug);
          return;
        }

        add(programme.slug);
      }}
    >
      {isHydrated ? visibleLabel : "My List"}
    </button>
  );
});
