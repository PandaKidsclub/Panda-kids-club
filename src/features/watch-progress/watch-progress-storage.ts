export const WATCH_PROGRESS_STORAGE_KEY = "panda-kids-club.watch-progress.v1";
export const WATCH_PROGRESS_CHANGED_EVENT = "panda-kids-club:watch-progress-changed";
export const WATCH_PROGRESS_MINIMUM_SECONDS = 60;

const WATCH_PROGRESS_STORAGE_VERSION = 1;
const WATCH_PROGRESS_COMPLETION_TOLERANCE_SECONDS = 15;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface WatchProgress {
  durationSeconds: number;
  positionSeconds: number;
  updatedAt: number;
}

interface WatchProgressStoragePayload {
  progressBySlug: Record<string, WatchProgress>;
  version: number;
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isWatchProgress(value: unknown): value is WatchProgress {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return isFiniteNonNegativeNumber(candidate.durationSeconds)
    && isFiniteNonNegativeNumber(candidate.positionSeconds)
    && isFiniteNonNegativeNumber(candidate.updatedAt);
}

function sanitiseProgressBySlug(value: unknown): Record<string, WatchProgress> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, WatchProgress>>((progressBySlug, [slug, progress]) => {
    if (slugPattern.test(slug) && isWatchProgress(progress)) {
      progressBySlug[slug] = progress;
    }

    return progressBySlug;
  }, {});
}

export function parseWatchProgressStorage(value: string | null): Record<string, WatchProgress> {
  if (!value) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const payload = parsed as Record<string, unknown>;

    if (payload.version !== WATCH_PROGRESS_STORAGE_VERSION || !Object.hasOwn(payload, "progressBySlug")) {
      return {};
    }

    return sanitiseProgressBySlug(payload.progressBySlug);
  } catch {
    return {};
  }
}

function readProgressBySlug(): Record<string, WatchProgress> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return parseWatchProgressStorage(window.localStorage.getItem(WATCH_PROGRESS_STORAGE_KEY));
  } catch {
    return {};
  }
}

function writeProgressBySlug(progressBySlug: Record<string, WatchProgress>): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const payload: WatchProgressStoragePayload = {
    progressBySlug,
    version: WATCH_PROGRESS_STORAGE_VERSION,
  };

  try {
    window.localStorage.setItem(WATCH_PROGRESS_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event(WATCH_PROGRESS_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function isResumableWatchProgress(progress: WatchProgress | null | undefined, durationSeconds = progress?.durationSeconds ?? 0): boolean {
  if (!progress || progress.positionSeconds < WATCH_PROGRESS_MINIMUM_SECONDS) {
    return false;
  }

  return !Number.isFinite(durationSeconds)
    || durationSeconds <= 0
    || progress.positionSeconds < Math.max(0, durationSeconds - WATCH_PROGRESS_COMPLETION_TOLERANCE_SECONDS);
}

export function readWatchProgress(slug: string): WatchProgress | null {
  return readProgressBySlug()[slug] ?? null;
}

export function writeWatchProgress(slug: string, positionSeconds: number, durationSeconds: number): boolean {
  if (!slugPattern.test(slug) || !isFiniteNonNegativeNumber(positionSeconds) || !isFiniteNonNegativeNumber(durationSeconds)) {
    return false;
  }

  const progress: WatchProgress = {
    durationSeconds,
    positionSeconds: Math.round(positionSeconds * 10) / 10,
    updatedAt: Date.now(),
  };

  if (!isResumableWatchProgress(progress, durationSeconds)) {
    return clearWatchProgress(slug);
  }

  return writeProgressBySlug({
    ...readProgressBySlug(),
    [slug]: progress,
  });
}

export function clearWatchProgress(slug: string): boolean {
  if (!slugPattern.test(slug)) {
    return false;
  }

  const progressBySlug = readProgressBySlug();

  if (!Object.hasOwn(progressBySlug, slug)) {
    return true;
  }

  const remainingProgress = Object.fromEntries(
    Object.entries(progressBySlug).filter(([storedSlug]) => storedSlug !== slug),
  );
  return writeProgressBySlug(remainingProgress);
}
