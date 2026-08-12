import type { CaptionTrack, ImageAsset, Programme, VideoAsset, VideoSource } from "@/lib/content/types";
import { getConfiguredMediaOrigin, resolveMediaUrl, type MediaOriginConfiguration } from "@/lib/media/media-config";

function resolveImageAsset(
  image: ImageAsset | null | undefined,
  configuration: MediaOriginConfiguration,
  mediaVersion: string | undefined,
): ImageAsset | null | undefined {
  return image ? { ...image, src: resolveMediaUrl(image.src, configuration, mediaVersion) } : image;
}

function resolveVideoSource(
  source: VideoSource,
  configuration: MediaOriginConfiguration,
  mediaVersion: string | undefined,
): VideoSource {
  return { ...source, src: resolveMediaUrl(source.src, configuration, mediaVersion) };
}

function resolveCaptionTrack(
  track: CaptionTrack,
  configuration: MediaOriginConfiguration,
  mediaVersion: string | undefined,
): CaptionTrack {
  return { ...track, src: resolveMediaUrl(track.src, configuration, mediaVersion) };
}

function resolveVideoAsset(
  video: VideoAsset | null | undefined,
  configuration: MediaOriginConfiguration,
  mediaVersion: string | undefined,
): VideoAsset | null | undefined {
  if (!video) {
    return video;
  }

  return {
    ...video,
    src: resolveMediaUrl(video.src, configuration, mediaVersion),
    sources: video.sources?.map((source) => resolveVideoSource(source, configuration, mediaVersion)),
    poster: resolveImageAsset(video.poster, configuration, mediaVersion) ?? undefined,
    captionsSrc: video.captionsSrc
      ? resolveMediaUrl(video.captionsSrc, configuration, mediaVersion)
      : video.captionsSrc,
    captionTracks: video.captionTracks?.map((track) => resolveCaptionTrack(track, configuration, mediaVersion)),
  };
}

/**
 * Resolves every programme-owned asset at the content boundary. Presentation
 * components receive ordinary Programme records and never read media config.
 */
export function resolveProgrammeMedia(
  programme: Programme,
  configuration: MediaOriginConfiguration = getConfiguredMediaOrigin(),
): Programme {
  const { mediaVersion } = programme;

  return {
    ...programme,
    thumbnailImage: resolveImageAsset(programme.thumbnailImage, configuration, mediaVersion) ?? null,
    heroPosterImage: resolveImageAsset(programme.heroPosterImage, configuration, mediaVersion) ?? null,
    titleLogoImage: resolveImageAsset(programme.titleLogoImage, configuration, mediaVersion) ?? null,
    heroPreviewVideo: resolveVideoAsset(programme.heroPreviewVideo, configuration, mediaVersion) ?? null,
    fullVideo: resolveVideoAsset(programme.fullVideo, configuration, mediaVersion) ?? null,
  };
}
