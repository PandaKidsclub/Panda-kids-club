"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef } from "react";
import { ProgrammeResultCard } from "@/components/content/ProgrammeResultCard";
import { useMyList } from "@/features/my-list/MyListProvider";
import { getProgrammeBySlug } from "@/lib/content/fixtures";

const loadingCardCount = 6;

export function MyListCatalogue() {
  const { isHydrated, savedSlugs } = useMyList();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const removeButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const programmes = useMemo(
    () => savedSlugs.flatMap((slug) => {
      const programme = getProgrammeBySlug(slug);
      return programme ? [programme] : [];
    }),
    [savedSlugs],
  );

  const focusAfterRemoval = useCallback((removedSlug: string) => {
    const removedIndex = programmes.findIndex((programme) => programme.slug === removedSlug);
    const nextProgramme = programmes[removedIndex + 1] ?? programmes[removedIndex - 1];

    window.requestAnimationFrame(() => {
      const nextButton = nextProgramme ? removeButtonRefs.current.get(nextProgramme.slug) : null;
      (nextButton ?? headingRef.current)?.focus();
    });
  }, [programmes]);

  return (
    <section className="catalogue-page catalogue-page--my-list" aria-labelledby="my-list-page-heading">
      <div className="catalogue-page__header">
        <h1 ref={headingRef} id="my-list-page-heading" tabIndex={-1}>My List</h1>
      </div>
      {!isHydrated ? (
        <div className="catalogue-grid catalogue-grid--loading" aria-busy="true" aria-label="Loading My List">
          {Array.from({ length: loadingCardCount }, (_, index) => <div key={index} className="catalogue-result-skeleton" />)}
        </div>
      ) : programmes.length > 0 ? (
        <>
          <p className="catalogue-page__status">
            {programmes.length} {programmes.length === 1 ? "saved programme" : "saved programmes"}
          </p>
          <ul className="catalogue-grid" aria-label="Saved programmes">
            {programmes.map((programme) => (
              <li key={programme.slug}>
                <ProgrammeResultCard
                  listAction="remove"
                  programme={programme}
                  removeButtonRef={(button) => {
                    if (button) {
                      removeButtonRefs.current.set(programme.slug, button);
                      return;
                    }

                    removeButtonRefs.current.delete(programme.slug);
                  }}
                  onRemoved={focusAfterRemoval}
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="catalogue-empty">
          <p>My List is empty.</p>
          <p>You can add programmes while browsing Panda Kids Club.</p>
          <Link className="button button--primary" href="/">Browse Home</Link>
        </div>
      )}
    </section>
  );
}
