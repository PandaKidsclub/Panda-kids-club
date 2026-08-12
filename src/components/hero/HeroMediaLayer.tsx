"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import type { HeroMediaStatus, HeroTransitionState } from "@/features/hero/hero-stage.types";
import { getPrimaryVideoSource, type Programme } from "@/lib/content/types";

export const HERO_MEDIA_CROSSFADE_MS = 560;

export interface HeroMediaController {
  pausePreview: () => void;
  resumePreview: () => void;
  toggleMuted: () => void;
}

interface HeroMediaLayerProps {
  programme: Programme | null;
  muted: boolean;
  userPaused: boolean;
  heroVisible: boolean;
  documentVisible: boolean;
  prefersReducedMotion: boolean;
  saveData: boolean;
  explicitPlaybackRequested: boolean;
  playbackRequestVersion: number;
  onDocumentVisibilityChange: (visible: boolean) => void;
  onHeroVisibilityChange: (visible: boolean) => void;
  onMediaStatusChange: (status: HeroMediaStatus) => void;
  onMutedChange: (muted: boolean) => void;
  onPlaybackRequest: () => void;
  onTransitionStateChange: (state: HeroTransitionState) => void;
  onUserPausedChange: (paused: boolean) => void;
  onVideoFailure: (src: string | null) => void;
}

interface MediaRequest {
  generation: number;
  programmeId: string;
  slot: number;
  src: string;
}

interface RuntimeState {
  canPlay: boolean;
  muted: boolean;
}

function getPosterStyle(programmeId: string | undefined): CSSProperties {
  const numericPart = Number.parseInt(programmeId?.replace(/\D/g, "") ?? "0", 10) || 0;

  return {
    "--hero-poster-angle": `${(numericPart * 29) % 180}deg`,
    "--hero-poster-shift": `${(numericPart * 11) % 56}%`,
  } as CSSProperties;
}

export const HeroMediaLayer = forwardRef<HeroMediaController, HeroMediaLayerProps>(function HeroMediaLayer(
  {
    programme,
    muted,
    userPaused,
    heroVisible,
    documentVisible,
    prefersReducedMotion,
    saveData,
    explicitPlaybackRequested,
    playbackRequestVersion,
    onDocumentVisibilityChange,
    onHeroVisibilityChange,
    onMediaStatusChange,
    onMutedChange,
    onPlaybackRequest,
    onTransitionStateChange,
    onUserPausedChange,
    onVideoFailure,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([null, null]);
  const requestRef = useRef<MediaRequest | null>(null);
  const activeSlotRef = useRef<number | null>(null);
  const generationRef = useRef(0);
  const settleTimerRef = useRef<number | null>(null);
  const pausePreviousTimerRef = useRef<number | null>(null);
  const runtimeRef = useRef<RuntimeState>({ canPlay: false, muted: true });
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [preparedSlot, setPreparedSlot] = useState<number | null>(null);
  const [videoVisible, setVideoVisible] = useState(false);

  const previewSrc = getPrimaryVideoSource(programme?.heroPreviewVideo)?.src ?? null;
  const posterSrc = programme?.heroPosterImage?.src ?? programme?.heroPreviewVideo?.poster?.src ?? null;
  const canPlay = Boolean(
    previewSrc &&
      heroVisible &&
      documentVisible &&
      !userPaused &&
      ((!prefersReducedMotion && !saveData) || explicitPlaybackRequested),
  );
  const posterStyle = useMemo(() => getPosterStyle(programme?.id), [programme?.id]);

  const clearTimer = (timerRef: typeof settleTimerRef) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const pauseAll = useCallback(() => {
    videoRefs.current.forEach((video) => video?.pause());
  }, []);

  const releaseVideo = useCallback((slot: number) => {
    const video = videoRefs.current[slot];

    if (!video) {
      return;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();
  }, []);

  const releaseAll = useCallback(() => {
    clearTimer(settleTimerRef);
    clearTimer(pausePreviousTimerRef);
    generationRef.current += 1;
    requestRef.current = null;
    activeSlotRef.current = null;
    releaseVideo(0);
    releaseVideo(1);
    setActiveSlot(null);
    setPreparedSlot(null);
    setVideoVisible(false);
  }, [releaseVideo]);

  const isCurrentRequest = useCallback((slot: number): MediaRequest | null => {
    const request = requestRef.current;
    const video = videoRefs.current[slot];

    if (!request || !video || request.slot !== slot) {
      return null;
    }

    const expectedSrc = new URL(request.src, window.location.href).href;

    return video.currentSrc === expectedSrc ? request : null;
  }, []);

  const commitPlayback = useCallback(
    (slot: number) => {
      const request = isCurrentRequest(slot);

      if (!request) {
        return;
      }

      const previousSlot = activeSlotRef.current;
      activeSlotRef.current = slot;
      setActiveSlot(slot);
      setVideoVisible(true);
      onMediaStatusChange("playing");
      onTransitionStateChange("transitioning");
      clearTimer(settleTimerRef);
      settleTimerRef.current = window.setTimeout(() => {
        if (isCurrentRequest(slot)?.generation === request.generation) {
          onTransitionStateChange("settled");
        }
      }, HERO_MEDIA_CROSSFADE_MS);

      if (previousSlot !== null && previousSlot !== slot) {
        clearTimer(pausePreviousTimerRef);
        pausePreviousTimerRef.current = window.setTimeout(() => {
          videoRefs.current[previousSlot]?.pause();
        }, HERO_MEDIA_CROSSFADE_MS);
      }
    },
    [isCurrentRequest, onMediaStatusChange, onTransitionStateChange],
  );

  const attemptPlayback = useCallback(
    async (slot: number, retriedMuted = false) => {
      const request = isCurrentRequest(slot);
      const video = videoRefs.current[slot];

      if (!request || !video || !runtimeRef.current.canPlay) {
        return;
      }

      try {
        await video.play();

        if (!runtimeRef.current.canPlay || isCurrentRequest(slot)?.generation !== request.generation) {
          video.pause();
          return;
        }

        commitPlayback(slot);
      } catch {
        if (!runtimeRef.current.canPlay || isCurrentRequest(slot)?.generation !== request.generation) {
          return;
        }

        if (!video.muted && !retriedMuted) {
          video.muted = true;
          runtimeRef.current.muted = true;
          onMutedChange(true);
          await attemptPlayback(slot, true);
          return;
        }

        setVideoVisible(false);
        onMediaStatusChange("blocked");
        onTransitionStateChange("settled");
      }
    },
    [commitPlayback, isCurrentRequest, onMediaStatusChange, onMutedChange, onTransitionStateChange],
  );

  const stageSelectedPreview = useCallback(() => {
    if (!programme || !previewSrc) {
      return;
    }

    const previousSlot = activeSlotRef.current;
    const slot = previousSlot === 0 ? 1 : 0;
    const video = videoRefs.current[slot];

    if (!video) {
      return;
    }

    clearTimer(settleTimerRef);
    clearTimer(pausePreviousTimerRef);
    releaseVideo(slot);

    const request: MediaRequest = {
      generation: generationRef.current + 1,
      programmeId: programme.id,
      slot,
      src: previewSrc,
    };

    generationRef.current = request.generation;
    requestRef.current = request;
    video.muted = runtimeRef.current.muted;
    video.poster = posterSrc ?? "";
    video.preload = "metadata";
    video.src = previewSrc;
    video.load();
    setPreparedSlot(slot);
    setVideoVisible(false);
    onMediaStatusChange("loading");
    onTransitionStateChange("loading");

    if (previousSlot !== null) {
      pausePreviousTimerRef.current = window.setTimeout(() => {
        videoRefs.current[previousSlot]?.pause();
      }, HERO_MEDIA_CROSSFADE_MS / 3);
    }
  }, [onMediaStatusChange, onTransitionStateChange, posterSrc, previewSrc, programme, releaseVideo]);

  const syncSelectedPreview = useCallback(() => {
    if (!programme || !previewSrc) {
      releaseAll();
      onMediaStatusChange("idle");
      onTransitionStateChange("settled");
      return;
    }

    const currentRequest = requestRef.current;
    const requestMatchesSelection =
      currentRequest?.programmeId === programme.id && currentRequest.src === previewSrc;

    if (!requestMatchesSelection && currentRequest && currentRequest.slot !== activeSlotRef.current) {
      releaseVideo(currentRequest.slot);
      requestRef.current = null;
      setPreparedSlot(null);
    }

    if (!canPlay) {
      if (!requestMatchesSelection) {
        releaseAll();
      } else {
        pauseAll();
      }

      onMediaStatusChange(userPaused || requestMatchesSelection ? "paused" : "idle");
      onTransitionStateChange("settled");
      return;
    }

    if (requestMatchesSelection && currentRequest) {
      const video = videoRefs.current[currentRequest.slot];

      if (video && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        void attemptPlayback(currentRequest.slot);
      } else {
        onMediaStatusChange("loading");
      }

      return;
    }

    stageSelectedPreview();
  }, [
    attemptPlayback,
    canPlay,
    onMediaStatusChange,
    onTransitionStateChange,
    pauseAll,
    previewSrc,
    programme,
    releaseAll,
    releaseVideo,
    stageSelectedPreview,
    userPaused,
  ]);

  useEffect(() => {
    runtimeRef.current = { canPlay, muted };
  }, [canPlay, muted]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = muted;
      }
    });
  }, [muted]);

  useEffect(() => {
    syncSelectedPreview();
  }, [playbackRequestVersion, syncSelectedPreview]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || typeof IntersectionObserver === "undefined") {
      onHeroVisibilityChange(true);
      return undefined;
    }

    let wasVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = wasVisible ? entry.intersectionRatio > 0.18 : entry.intersectionRatio > 0.42;

        if (nextVisible !== wasVisible) {
          wasVisible = nextVisible;
          onHeroVisibilityChange(nextVisible);
        }
      },
      { threshold: [0, 0.18, 0.42, 0.7] },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [onHeroVisibilityChange]);

  useEffect(() => {
    const updateDocumentVisibility = () => {
      onDocumentVisibilityChange(document.visibilityState === "visible");
    };

    updateDocumentVisibility();
    document.addEventListener("visibilitychange", updateDocumentVisibility);
    return () => document.removeEventListener("visibilitychange", updateDocumentVisibility);
  }, [onDocumentVisibilityChange]);

  useEffect(
    () => () => {
      clearTimer(settleTimerRef);
      clearTimer(pausePreviousTimerRef);
      generationRef.current += 1;
      videoRefs.current.forEach((video) => {
        video?.pause();
        video?.removeAttribute("src");
        video?.load();
      });
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      pausePreview: () => {
        pauseAll();
        onUserPausedChange(true);
        onMediaStatusChange("paused");
        onTransitionStateChange("settled");
      },
      resumePreview: () => onPlaybackRequest(),
      toggleMuted: () => {
        const nextMuted = !runtimeRef.current.muted;

        videoRefs.current.forEach((video) => {
          if (video) {
            video.muted = nextMuted;
          }
        });
        runtimeRef.current.muted = nextMuted;
        onMutedChange(nextMuted);
      },
    }),
    [onMediaStatusChange, onMutedChange, onPlaybackRequest, onTransitionStateChange, onUserPausedChange, pauseAll],
  );

  const handleCanPlay = (slot: number) => {
    if (isCurrentRequest(slot) && runtimeRef.current.canPlay) {
      void attemptPlayback(slot);
    }
  };

  const handleError = (slot: number) => {
    const request = isCurrentRequest(slot);

    if (!request) {
      return;
    }

    requestRef.current = null;
    releaseVideo(slot);
    setPreparedSlot(null);
    setVideoVisible(false);
    onMediaStatusChange("error");
    onTransitionStateChange("failed");
    onVideoFailure(request.src);

    if (process.env.NODE_ENV === "development") {
      console.warn(`Hero preview could not be loaded: ${request.src}`);
    }
  };

  const handlePlaying = (slot: number) => {
    if (isCurrentRequest(slot)) {
      commitPlayback(slot);
    }
  };

  const handleWaiting = (slot: number) => {
    if (isCurrentRequest(slot) && runtimeRef.current.canPlay) {
      onMediaStatusChange("loading");
    }
  };

  return (
    <div
      ref={rootRef}
      className="hero-stage__media"
      data-video-visible={videoVisible || undefined}
      data-programme-id={programme?.id}
      aria-hidden="true"
    >
      <div className="hero-stage__poster" style={posterStyle} data-has-image={posterSrc ? true : undefined}>
        {posterSrc ? <Image src={posterSrc} alt="" fill sizes="100vw" /> : null}
      </div>
      {[0, 1].map((slot) => (
        <video
          key={slot}
          ref={(video) => {
            videoRefs.current[slot] = video;
          }}
          className="hero-stage__video"
          data-active={activeSlot === slot || undefined}
          data-prepared={preparedSlot === slot || undefined}
          loop
          muted={muted}
          playsInline
          preload={preparedSlot === slot ? "metadata" : "none"}
          onCanPlay={() => handleCanPlay(slot)}
          onError={() => handleError(slot)}
          onPlaying={() => handlePlaying(slot)}
          onWaiting={() => handleWaiting(slot)}
        />
      ))}
    </div>
  );
});
