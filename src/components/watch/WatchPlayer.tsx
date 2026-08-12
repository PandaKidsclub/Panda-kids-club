"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { WatchPlayerControls } from "@/components/watch/WatchPlayerControls";
import { clampTime, PLAYER_CONTROL_HIDE_DELAY_MS } from "@/components/watch/watch-player.utils";
import {
  clearWatchProgress,
  isResumableWatchProgress,
  readWatchProgress,
  writeWatchProgress,
} from "@/features/watch-progress/watch-progress-storage";
import { getVideoSources, type Programme } from "@/lib/content/types";

type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

interface WatchPlayerProps {
  backHref: string;
  programme: Programme;
}

function WatchBackLink({ href }: { href: string }) {
  return (
    <Link className="watch-player__back" href={href}>
      <span className="watch-player__back-icon" aria-hidden="true" />
      Back
    </Link>
  );
}

function WatchUnavailable({ backHref, programme }: WatchPlayerProps) {
  return (
    <main className="watch-shell" data-watch-status="unavailable">
      <section className="watch-player watch-player--unavailable" aria-labelledby="watch-programme-heading">
        <div className="watch-player__fallback-media" aria-hidden="true">
          {programme.heroPosterImage ? <Image alt="" fill priority sizes="100vw" src={programme.heroPosterImage.src} /> : null}
        </div>
        <div className="watch-player__fallback-scrim" aria-hidden="true" />
        <div className="watch-player__safe-area">
          <WatchBackLink href={backHref} />
          <div className="watch-player__unavailable-content" role="status">
            <p className="watch-player__eyebrow">Panda Kids Club</p>
            <h1 id="watch-programme-heading">{programme.name}</h1>
            <p>Video unavailable in this development build.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function WatchPlayer({ backHref, programme }: WatchPlayerProps) {
  const videoAsset = programme.fullVideo;
  const videoSources = getVideoSources(videoAsset);
  const playerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const controlsFocusedRef = useRef(false);
  const lastReportedTimeRef = useRef(-1);
  const lastSavedTimeRef = useRef(0);
  const initialPlaybackRequestedRef = useRef(false);
  const playbackRequestedRef = useRef(false);
  const restoredProgressRef = useRef(false);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [captionsEnabled, setCaptionsEnabled] = useState(Boolean(videoAsset?.captionTracks?.some((track) => track.default)));
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleControlsHide = useCallback(() => {
    clearHideTimer();

    if (status === "playing" && !controlsFocusedRef.current) {
      hideTimerRef.current = window.setTimeout(() => {
        if (!controlsFocusedRef.current) {
          setControlsVisible(false);
        }
      }, PLAYER_CONTROL_HIDE_DELAY_MS);
    }
  }, [clearHideTimer, status]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const syncDuration = useCallback(() => {
    const video = videoRef.current;
    const nextDuration = video?.duration ?? 0;

    setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);

    if (!video || restoredProgressRef.current || !Number.isFinite(nextDuration) || nextDuration <= 0) {
      return;
    }

    restoredProgressRef.current = true;
    const savedProgress = readWatchProgress(programme.slug);

    if (!savedProgress || !isResumableWatchProgress(savedProgress, nextDuration)) {
      return;
    }

    const resumeTime = clampTime(savedProgress.positionSeconds, nextDuration);
    video.currentTime = resumeTime;
    lastReportedTimeRef.current = resumeTime;
    lastSavedTimeRef.current = resumeTime;
    setCurrentTime(resumeTime);
  }, [programme.slug]);

  const syncVolume = useCallback(() => {
    const video = videoRef.current;

    if (video) {
      setMuted(video.muted);
      setVolume(video.volume);
    }
  }, []);

  const updateReportedTime = useCallback(() => {
    const nextTime = videoRef.current?.currentTime ?? 0;

    if (Math.abs(nextTime - lastReportedTimeRef.current) >= 0.25 || nextTime === 0) {
      lastReportedTimeRef.current = nextTime;
      setCurrentTime(nextTime);
    }
  }, []);

  const saveWatchProgress = useCallback((force = false) => {
    const video = videoRef.current;
    const currentPlaybackTime = video?.currentTime ?? 0;
    const currentDuration = video?.duration ?? 0;

    if (!video || !Number.isFinite(currentPlaybackTime) || !Number.isFinite(currentDuration)) {
      return;
    }

    if (force || Math.abs(currentPlaybackTime - lastSavedTimeRef.current) >= 5) {
      writeWatchProgress(programme.slug, currentPlaybackTime, currentDuration);
      lastSavedTimeRef.current = currentPlaybackTime;
    }
  }, [programme.slug]);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    playbackRequestedRef.current = true;
    setStatus("loading");
    revealControls();

    try {
      await video.play();
    } catch {
      playbackRequestedRef.current = false;
      setStatus("paused");
      setControlsVisible(true);
      clearHideTimer();
    }
  }, [clearHideTimer, revealControls]);

  const pauseVideo = useCallback(() => {
    playbackRequestedRef.current = false;
    videoRef.current?.pause();
    setStatus("paused");
    setControlsVisible(true);
    clearHideTimer();
  }, [clearHideTimer]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;

    if (!video || (!video.paused && !video.ended)) {
      pauseVideo();
      return;
    }

    void playVideo();
  }, [pauseVideo, playVideo]);

  const seekTo = useCallback((nextTime: number) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const safeTime = clampTime(nextTime, video.duration);
    video.currentTime = safeTime;
    lastReportedTimeRef.current = safeTime;
    setCurrentTime(safeTime);
    revealControls();
  }, [revealControls]);

  const seekBy = useCallback((seconds: number) => {
    seekTo((videoRef.current?.currentTime ?? 0) + seconds);
  }, [seekTo]);

  const toggleMuted = useCallback(() => {
    const video = videoRef.current;

    if (video) {
      video.muted = !video.muted;
      syncVolume();
    }
  }, [syncVolume]);

  const changeVolume = useCallback((nextVolume: number) => {
    const video = videoRef.current;

    if (video) {
      video.volume = Math.min(Math.max(nextVolume, 0), 1);
      video.muted = video.volume === 0;
      syncVolume();
    }
  }, [syncVolume]);

  const toggleCaptions = useCallback(() => {
    setCaptionsEnabled((enabled) => !enabled);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    try {
      if (document.fullscreenElement === player) {
        await document.exitFullscreen();
      } else if (typeof player.requestFullscreen === "function") {
        await player.requestFullscreen();
      }
    } catch {
      setIsFullscreen(document.fullscreenElement === player);
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    revealControls();

    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.closest("input, textarea, select, [contenteditable='true']")) {
      return;
    }

    if (event.key === " " && target.closest("button, a")) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case " ":
      case "k":
        event.preventDefault();
        togglePlayback();
        break;
      case "arrowleft":
        event.preventDefault();
        seekBy(-10);
        break;
      case "arrowright":
        event.preventDefault();
        seekBy(10);
        break;
      case "m":
        event.preventDefault();
        toggleMuted();
        break;
      case "f":
        if (fullscreenSupported) {
          event.preventDefault();
          void toggleFullscreen();
        }
        break;
      case "c":
        if (videoAsset?.captionTracks?.length) {
          event.preventDefault();
          toggleCaptions();
        }
        break;
      default:
        break;
    }
  }, [fullscreenSupported, revealControls, seekBy, toggleCaptions, toggleFullscreen, toggleMuted, togglePlayback, videoAsset?.captionTracks?.length]);

  const handleFocus = useCallback(() => {
    controlsFocusedRef.current = true;
    setControlsVisible(true);
    clearHideTimer();
  }, [clearHideTimer]);

  const handleBlur = useCallback(() => {
    window.requestAnimationFrame(() => {
      controlsFocusedRef.current = playerRef.current?.contains(document.activeElement) ?? false;

      if (!controlsFocusedRef.current) {
        scheduleControlsHide();
      }
    });
  }, [scheduleControlsHide]);

  const handlePointerMove = useCallback(() => {
    revealControls();
  }, [revealControls]);

  useEffect(() => {
    if (!videoAsset || initialPlaybackRequestedRef.current) {
      return;
    }

    initialPlaybackRequestedRef.current = true;
    void playVideo();
  }, [playVideo, videoAsset]);

  useEffect(() => {
    restoredProgressRef.current = false;
    lastSavedTimeRef.current = 0;
  }, [programme.slug]);

  useEffect(() => {
    const persistProgress = () => saveWatchProgress(true);

    window.addEventListener("pagehide", persistProgress);

    return () => {
      window.removeEventListener("pagehide", persistProgress);
      persistProgress();
    };
  }, [saveWatchProgress]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    Array.from(video.textTracks).forEach((track) => {
      track.mode = captionsEnabled ? "showing" : "disabled";
    });
  }, [captionsEnabled]);

  useEffect(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const updateFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === player);
    };

    setFullscreenSupported(typeof player.requestFullscreen === "function");
    updateFullscreenState();
    document.addEventListener("fullscreenchange", updateFullscreenState);
    document.addEventListener("fullscreenerror", updateFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
      document.removeEventListener("fullscreenerror", updateFullscreenState);
    };
  }, []);

  useEffect(() => {
    if (status === "playing") {
      scheduleControlsHide();
      return clearHideTimer;
    }

    clearHideTimer();
    return undefined;
  }, [clearHideTimer, scheduleControlsHide, status]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  if (!videoAsset) {
    return <WatchUnavailable backHref={backHref} programme={programme} />;
  }

  const captionsAvailable = Boolean(videoAsset.captionTracks?.length);
  const poster = programme.heroPosterImage?.src ?? videoAsset.poster?.src;
  const isPlaying = status === "playing";
  const showCentralPlay = status === "idle" || status === "paused" || status === "ended";

  return (
    <main className="watch-shell" data-watch-status={status}>
      <section
        ref={playerRef}
        className="watch-player"
        data-controls-visible={controlsVisible || undefined}
        data-fullscreen={isFullscreen || undefined}
        aria-label={`${programme.name} player`}
        onBlurCapture={handleBlur}
        onFocusCapture={handleFocus}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerDown={revealControls}
      >
        <video
          ref={videoRef}
          className="watch-player__video"
          playsInline
          preload="metadata"
          poster={poster}
          onDurationChange={syncDuration}
          onEnded={() => {
            playbackRequestedRef.current = false;
            clearWatchProgress(programme.slug);
            setStatus("ended");
            setControlsVisible(true);
          }}
          onError={() => {
            setStatus("error");
            setControlsVisible(true);
          }}
          onLoadedMetadata={syncDuration}
          onPause={() => {
            saveWatchProgress(true);

            if (!videoRef.current?.ended) {
              setStatus("paused");
              setControlsVisible(true);
            }
          }}
          onPlaying={() => {
            if (!playbackRequestedRef.current) {
              videoRef.current?.pause();
              return;
            }

            setStatus("playing");
          }}
          onTimeUpdate={() => {
            updateReportedTime();
            saveWatchProgress();
          }}
          onVolumeChange={syncVolume}
          onWaiting={() => {
            setStatus("loading");
            setControlsVisible(true);
          }}
        >
          {videoSources.map((source) => (
            <source key={`${source.src}-${source.type}`} src={source.src} type={source.type} />
          ))}
          {videoAsset.captionTracks?.map((track) => (
            <track
              key={`${track.src}-${track.srcLang}`}
              default={track.default}
              kind="captions"
              label={track.label}
              src={track.src}
              srcLang={track.srcLang}
            />
          ))}
        </video>
        <div className="watch-player__backdrop" aria-hidden="true" />
        <div className="watch-player__topbar">
          <WatchBackLink href={backHref} />
          <p>{programme.name}</p>
        </div>
        {showCentralPlay ? (
          <button className="watch-player__central-play" type="button" aria-label={status === "ended" ? "Replay programme" : "Play programme"} onClick={() => void playVideo()}>
            <span className="control-icon control-icon--play" aria-hidden="true" />
            {status === "ended" ? "Replay" : "Play"}
          </button>
        ) : null}
        {status === "loading" ? <p className="watch-player__status" role="status">Loading programme</p> : null}
        {status === "error" ? <p className="watch-player__status" role="alert">Video unavailable in this development build.</p> : null}
        <WatchPlayerControls
          captionsAvailable={captionsAvailable}
          captionsEnabled={captionsEnabled}
          currentTime={currentTime}
          duration={duration}
          fullscreenSupported={fullscreenSupported}
          isFullscreen={isFullscreen}
          isMuted={muted}
          isPlaying={isPlaying}
          onSeek={seekTo}
          onSeekBy={seekBy}
          onToggleCaptions={toggleCaptions}
          onToggleFullscreen={() => void toggleFullscreen()}
          onToggleMuted={toggleMuted}
          onTogglePlayback={togglePlayback}
          onVolumeChange={changeVolume}
          programmeName={programme.name}
          volume={volume}
        />
      </section>
    </main>
  );
}
