"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type FocusEvent, type PointerEvent } from "react";
import { COMING_SOON_ROTATION_MS } from "@/lib/coming-soon/constants";
import type { Programme, ProgrammeCategory } from "@/lib/content/types";

interface ComingSoonShowcaseProps {
  initialNow: number;
  programmes: Programme[];
  releaseAt: string;
}

interface CountdownParts {
  days: number;
  hours: number;
  isReleased: boolean;
  minutes: number;
  seconds: number;
}

interface BackdropLayer {
  index: number | null;
  source: string | null;
}

const countdownLabels: Array<keyof Omit<CountdownParts, "isReleased">> = ["days", "hours", "minutes", "seconds"];

function getBackdropSource(programme: Programme): string | null {
  return programme.heroPosterImage?.src ?? programme.thumbnailImage?.src ?? null;
}

function getCountdown(releaseAt: number, now: number): CountdownParts {
  const remaining = Math.max(0, releaseAt - now);
  const totalSeconds = Math.floor(remaining / 1_000);

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    isReleased: remaining === 0,
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

function formatCountdownValue(value: number): string {
  return String(value).padStart(2, "0");
}

function formatReleaseDate(releaseAt: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    timeZone: "Africa/Johannesburg",
    year: "numeric",
  }).format(new Date(releaseAt));
}

function getCategoryLabel(category: ProgrammeCategory): string {
  if (category === "learn") {
    return "Learning";
  }

  if (category === "stories") {
    return "Storytime Adventures";
  }

  return "Heroes & Folktales";
}

function getWrappedIndex(index: number, length: number): number {
  return (index + length) % length;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function getSaveDataSnapshot(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const connection = (navigator as Navigator & {
    connection?: EventTarget & { saveData?: boolean };
  }).connection;

  return connection?.saveData === true;
}

function subscribeToSaveData(onChange: () => void): () => void {
  if (typeof navigator === "undefined") {
    return () => undefined;
  }

  const connection = (navigator as Navigator & {
    connection?: EventTarget & { saveData?: boolean };
  }).connection;

  connection?.addEventListener("change", onChange);

  return () => connection?.removeEventListener("change", onChange);
}

function useSaveData(): boolean {
  return useSyncExternalStore(subscribeToSaveData, getSaveDataSnapshot, () => false);
}

function ShowcaseArtwork({ programme }: { programme: Programme }) {
  const source = programme.thumbnailImage?.src ?? programme.heroPosterImage?.src ?? null;

  return (
    <span className="coming-soon-showcase__artwork" aria-hidden="true">
      {source ? <span className="coming-soon-showcase__artwork-image" style={{ backgroundImage: `url("${source}")` }} /> : null}
      <span className="coming-soon-showcase__artwork-wash" />
      <span className="coming-soon-showcase__artwork-category">{getCategoryLabel(programme.category)}</span>
      <strong>{programme.name}</strong>
    </span>
  );
}

export function ComingSoonShowcase({ initialNow, programmes, releaseAt }: ComingSoonShowcaseProps) {
  const releaseAtMilliseconds = useMemo(() => Date.parse(releaseAt), [releaseAt]);
  const [now, setNow] = useState(initialNow);
  const [activeUpcomingIndex, setActiveUpcomingIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [showcaseVisible, setShowcaseVisible] = useState(true);
  const backdropSources = useMemo(() => programmes.map(getBackdropSource), [programmes]);
  const [backdropLayers, setBackdropLayers] = useState<BackdropLayer[]>(() => [
    { index: 0, source: backdropSources[0] ?? null },
    { index: null, source: null },
  ]);
  const [activeBackdropLayer, setActiveBackdropLayer] = useState(0);
  const backdropIndexRef = useRef(0);
  const showcaseRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const hasFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const saveData = useSaveData();
  const countdown = getCountdown(releaseAtMilliseconds, now);
  const activeProgramme = programmes[activeUpcomingIndex];
  const previousProgramme = programmes[getWrappedIndex(activeUpcomingIndex - 1, programmes.length)];
  const nextProgramme = programmes[getWrappedIndex(activeUpcomingIndex + 1, programmes.length)];
  const automaticRotationAllowed = !countdown.isReleased
    && !userPaused
    && !hoverPaused
    && !focusPaused
    && !touchPaused
    && !prefersReducedMotion
    && !saveData
    && documentVisible
    && showcaseVisible;

  useEffect(() => {
    if (countdown.isReleased) {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 1_000);

    return () => window.clearInterval(interval);
  }, [countdown.isReleased]);

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(document.visibilityState === "visible");

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    const element = showcaseRef.current;

    if (!element || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setShowcaseVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!automaticRotationAllowed || programmes.length < 2) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveUpcomingIndex((currentIndex) => getWrappedIndex(currentIndex + 1, programmes.length));
    }, COMING_SOON_ROTATION_MS);

    return () => window.clearTimeout(timer);
  }, [activeUpcomingIndex, automaticRotationAllowed, programmes.length]);

  useEffect(() => {
    if (backdropIndexRef.current === activeUpcomingIndex) {
      return;
    }

    const nextLayer = activeBackdropLayer === 0 ? 1 : 0;

    setBackdropLayers((currentLayers) => currentLayers.map((layer, index) => (
      index === nextLayer
        ? { index: activeUpcomingIndex, source: backdropSources[activeUpcomingIndex] ?? null }
        : layer
    )));

    const transition = window.setTimeout(() => {
      backdropIndexRef.current = activeUpcomingIndex;
      setActiveBackdropLayer(nextLayer);
    }, 16);

    return () => window.clearTimeout(transition);
  }, [activeBackdropLayer, activeUpcomingIndex, backdropSources]);

  useEffect(() => {
    if (saveData || programmes.length < 2) {
      return;
    }

    const nextSource = backdropSources[getWrappedIndex(activeUpcomingIndex + 1, programmes.length)];

    if (!nextSource) {
      return;
    }

    const image = new Image();
    image.src = nextSource;
  }, [activeUpcomingIndex, backdropSources, programmes.length, saveData]);

  const selectUpcomingIndex = useCallback((index: number) => {
    setActiveUpcomingIndex(getWrappedIndex(index, programmes.length));
  }, [programmes.length]);

  const toggleUserPaused = useCallback(() => {
    if (userPaused) {
      // An explicit resume is allowed to restart rotation from this control.
      setFocusPaused(false);
    }

    setUserPaused(!userPaused);
  }, [userPaused]);

  const handleFocusOut = useCallback((event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusPaused(false);
    }
  }, []);

  const handlePointerEnter = useCallback((event: PointerEvent<HTMLElement>) => {
    if (hasFinePointer && event.pointerType === "mouse") {
      setHoverPaused(true);
    }
  }, [hasFinePointer]);

  const handlePointerLeave = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") {
      setHoverPaused(false);
    }

    if (event.pointerType === "touch") {
      setTouchPaused(false);
    }
  }, []);

  const handleTouchStart = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") {
      setTouchPaused(true);
    }
  }, []);

  return (
    <section className="coming-soon-page" aria-labelledby="coming-soon-heading">
      <div className="coming-soon-backdrop" aria-hidden="true">
        {backdropLayers.map((layer, index) => (
          <span
            key={index}
            className={`coming-soon-backdrop__image${index === activeBackdropLayer ? " is-active" : ""}`}
            data-upcoming-index={layer.index ?? undefined}
            style={layer.source ? { backgroundImage: `url("${layer.source}")` } : undefined}
          />
        ))}
      </div>

      <div className="coming-soon-page__content">
        <header className="coming-soon-intro">
          <p className="coming-soon-intro__identity">Coming Soon</p>
          <h1 id="coming-soon-heading">15 New Titles <span>Are Almost Here</span></h1>
        </header>

        <section className="coming-soon-countdown" aria-label="Countdown to the next title release" aria-live="off" role="timer">
          {countdown.isReleased ? (
            <p className="coming-soon-countdown__release-day">Release Day</p>
          ) : (
            <dl>
              {countdownLabels.map((label) => (
                <div key={label}>
                  <dd>{formatCountdownValue(countdown[label])}</dd>
                  <dt>{label}</dt>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section
          ref={showcaseRef}
          className="coming-soon-showcase"
          aria-label="Upcoming title showcase"
          onBlurCapture={handleFocusOut}
          onFocusCapture={() => setFocusPaused(true)}
          onPointerCancel={() => setTouchPaused(false)}
          onPointerDown={handleTouchStart}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerUp={() => setTouchPaused(false)}
        >
          <div className="coming-soon-showcase__deck">
            <button
              className="coming-soon-showcase__card coming-soon-showcase__card--previous"
              type="button"
              aria-label={`Show previous title: ${previousProgramme.name}`}
              onClick={() => selectUpcomingIndex(activeUpcomingIndex - 1)}
            >
              <ShowcaseArtwork programme={previousProgramme} />
            </button>

            <article
              className="coming-soon-showcase__card coming-soon-showcase__card--active"
              aria-labelledby="active-upcoming-title"
              data-upcoming-index={activeUpcomingIndex}
            >
              <ShowcaseArtwork programme={activeProgramme} />
            </article>

            <button
              className="coming-soon-showcase__card coming-soon-showcase__card--next"
              type="button"
              aria-label={`Show next title: ${nextProgramme.name}`}
              onClick={() => selectUpcomingIndex(activeUpcomingIndex + 1)}
            >
              <ShowcaseArtwork programme={nextProgramme} />
            </button>
          </div>

          <div className="coming-soon-showcase__controls" aria-label="Showcase controls">
            <button
              className="coming-soon-showcase__control"
              type="button"
              aria-label="Show previous upcoming title"
              title="Previous title"
              onClick={() => selectUpcomingIndex(activeUpcomingIndex - 1)}
            >
              <span className="coming-soon-showcase__arrow coming-soon-showcase__arrow--previous" aria-hidden="true" />
            </button>
            <button
              className="coming-soon-showcase__control"
              type="button"
              aria-label={userPaused ? "Resume upcoming title rotation" : "Pause upcoming title rotation"}
              aria-pressed={userPaused}
              title={userPaused ? "Resume rotation" : "Pause rotation"}
              onClick={toggleUserPaused}
            >
              <span className={`coming-soon-showcase__pause${userPaused ? " is-paused" : ""}`} aria-hidden="true" />
            </button>
            <button
              className="coming-soon-showcase__control"
              type="button"
              aria-label="Show next upcoming title"
              title="Next title"
              onClick={() => selectUpcomingIndex(activeUpcomingIndex + 1)}
            >
              <span className="coming-soon-showcase__arrow" aria-hidden="true" />
            </button>
          </div>

          <div className="coming-soon-showcase__identity">
            <p>{getCategoryLabel(activeProgramme.category)}</p>
            <h2 id="active-upcoming-title">{activeProgramme.name}</h2>
          </div>
        </section>

        <section className="coming-soon-release" aria-labelledby="coming-soon-release-heading">
          <p id="coming-soon-release-heading">New titles arrive <time dateTime={releaseAt}>{formatReleaseDate(releaseAt)}</time></p>
          <div className="coming-soon-release__groups" aria-label="What is in the next drop">
            <span>5 Learning</span>
            <span>5 Storytime</span>
            <span>5 Heroes &amp; Folktales</span>
          </div>
        </section>
      </div>
    </section>
  );
}
