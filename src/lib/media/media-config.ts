export const CANONICAL_MEDIA_PREFIX = "/media/programmes/";
const REMOTE_MEDIA_PREFIX = "/programmes/";
const mediaVersionPattern = /^[a-z0-9][a-z0-9._-]{0,127}$/;
const localhostHostnames = new Set(["localhost", "127.0.0.1", "[::1]"]);

export interface MediaOriginConfiguration {
  baseUrl: string | null;
  hostname: string | null;
  origin: string | null;
  port: string | null;
  protocol: "http" | "https" | null;
}

export function isCanonicalMediaPath(source: string): boolean {
  return source.startsWith(CANONICAL_MEDIA_PREFIX);
}

export function isValidMediaVersion(value: unknown): value is string {
  return typeof value === "string" && mediaVersionPattern.test(value);
}

function isLocalhost(hostname: string): boolean {
  return localhostHostnames.has(hostname.toLowerCase());
}

function emptyMediaOriginConfiguration(): MediaOriginConfiguration {
  return {
    baseUrl: null,
    hostname: null,
    origin: null,
    port: null,
    protocol: null,
  };
}

/**
 * Parses the sole public media-origin setting. Production origins are HTTPS;
 * HTTP is intentionally limited to explicit localhost development origins.
 */
export function getMediaOriginConfiguration(value = process.env.NEXT_PUBLIC_MEDIA_BASE_URL): MediaOriginConfiguration {
  const configuredValue = value?.trim();

  if (!configuredValue) {
    return emptyMediaOriginConfiguration();
  }

  let parsed: URL;

  try {
    parsed = new URL(configuredValue.replace(/\/+$/, ""));
  } catch {
    throw new Error("NEXT_PUBLIC_MEDIA_BASE_URL must be an absolute HTTPS media origin.");
  }

  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocalhost(parsed.hostname))) {
    throw new Error("NEXT_PUBLIC_MEDIA_BASE_URL must use HTTPS, except for localhost HTTP development origins.");
  }

  if (parsed.username || parsed.password || parsed.search || parsed.hash || (parsed.pathname !== "/" && parsed.pathname !== "")) {
    throw new Error("NEXT_PUBLIC_MEDIA_BASE_URL must contain only an origin, without credentials, query, hash, or path.");
  }

  return {
    baseUrl: parsed.origin,
    hostname: parsed.hostname,
    origin: parsed.origin,
    port: parsed.port,
    protocol: parsed.protocol.slice(0, -1) as "http" | "https",
  };
}

export function getConfiguredMediaOrigin(): MediaOriginConfiguration {
  return getMediaOriginConfiguration(process.env.NEXT_PUBLIC_MEDIA_BASE_URL);
}

function normaliseCanonicalMediaPath(source: string): string {
  const separatorIndex = source.search(/[?#]/);
  const pathname = separatorIndex === -1 ? source : source.slice(0, separatorIndex);
  const suffix = separatorIndex === -1 ? "" : source.slice(separatorIndex);

  return `${pathname.replace(/\/{2,}/g, "/")}${suffix}`;
}

function appendMediaVersion(source: string, mediaVersion: string | undefined): string {
  if (!mediaVersion) {
    return source;
  }

  if (!isValidMediaVersion(mediaVersion)) {
    throw new Error("Programme mediaVersion must use lowercase letters, numbers, dots, underscores, or hyphens.");
  }

  const url = new URL(source);
  url.searchParams.set("v", mediaVersion);
  return url.toString();
}

/**
 * Retains the canonical local path until a trusted media origin is configured.
 * Only programme media paths are rewritten; unrelated application assets stay
 * local and do not inherit a storage host by accident.
 */
export function resolveMediaUrl(
  source: string,
  configuration: MediaOriginConfiguration = getConfiguredMediaOrigin(),
  mediaVersion?: string,
): string {
  if (!configuration.baseUrl || !isCanonicalMediaPath(source)) {
    return source;
  }

  const remotePath = normaliseCanonicalMediaPath(source).replace(CANONICAL_MEDIA_PREFIX, REMOTE_MEDIA_PREFIX);
  return appendMediaVersion(`${configuration.baseUrl}${remotePath}`, mediaVersion);
}
