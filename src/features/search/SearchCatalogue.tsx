"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProgrammeResultCard } from "@/components/content/ProgrammeResultCard";
import { searchProgrammes, normalizeSearchQuery } from "@/features/search/programme-search";
import { allProgrammes } from "@/lib/content/fixtures";

interface SearchCatalogueProps {
  initialQuery: string;
}

function getCanonicalQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function SearchCatalogue({ initialQuery }: SearchCatalogueProps) {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(() => getCanonicalQuery(initialQuery));
  const normalizedQuery = normalizeSearchQuery(query);
  const hasQuery = normalizedQuery.length > 0;
  const results = useMemo(() => searchProgrammes(allProgrammes, query), [query]);

  const synchronizeQuery = (nextQuery: string) => {
    const canonicalQuery = getCanonicalQuery(nextQuery);
    const href = canonicalQuery ? `${pathname}?q=${encodeURIComponent(canonicalQuery)}` : pathname;
    router.replace(href, { scroll: false });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    synchronizeQuery(query);
  };

  const clearSearch = () => {
    setQuery("");
    synchronizeQuery("");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <section className="catalogue-page catalogue-page--search" aria-labelledby="search-page-heading">
      <div className="catalogue-page__header">
        <h1 id="search-page-heading">Search</h1>
      </div>
      <form className="catalogue-search" role="search" aria-label="Search Panda Kids Club" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="programme-search-input">Search programmes</label>
        <div className="catalogue-search__field">
          <input
            ref={inputRef}
            id="programme-search-input"
            name="q"
            type="search"
            placeholder="Search programmes"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              synchronizeQuery(event.target.value);
            }}
          />
          {query ? (
            <button className="catalogue-search__clear" type="button" onClick={clearSearch}>
              Clear
            </button>
          ) : null}
        </div>
      </form>
      {!hasQuery ? (
        <p className="catalogue-page__starting-state">Search Panda Kids Club</p>
      ) : (
        <div className="catalogue-page__results" aria-live="polite">
          <p className="catalogue-page__status" role="status">
            {results.length} {results.length === 1 ? "programme" : "programmes"} found
          </p>
          {results.length > 0 ? (
            <ul className="catalogue-grid" aria-label="Search results">
              {results.map((programme) => (
                <li key={programme.slug}>
                  <ProgrammeResultCard listAction="toggle" programme={programme} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="catalogue-empty">
              <p>No programmes found.</p>
              <button className="button button--secondary" type="button" onClick={clearSearch}>Clear search</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
