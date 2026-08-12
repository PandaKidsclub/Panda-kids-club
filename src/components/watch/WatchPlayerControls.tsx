import { formatMediaTime } from "@/components/watch/watch-player.utils";

interface WatchPlayerControlsProps {
  captionsAvailable: boolean;
  captionsEnabled: boolean;
  currentTime: number;
  duration: number;
  fullscreenSupported: boolean;
  isFullscreen: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  onSeek: (time: number) => void;
  onSeekBy: (seconds: number) => void;
  onToggleCaptions: () => void;
  onToggleFullscreen: () => void;
  onToggleMuted: () => void;
  onTogglePlayback: () => void;
  onVolumeChange: (volume: number) => void;
  programmeName: string;
  volume: number;
}

export function WatchPlayerControls({
  captionsAvailable,
  captionsEnabled,
  currentTime,
  duration,
  fullscreenSupported,
  isFullscreen,
  isPlaying,
  isMuted,
  onSeek,
  onSeekBy,
  onToggleCaptions,
  onToggleFullscreen,
  onToggleMuted,
  onTogglePlayback,
  onVolumeChange,
  programmeName,
  volume,
}: WatchPlayerControlsProps) {
  const hasDuration = duration > 0;
  const playPauseLabel = isPlaying ? "Pause programme" : "Play programme";
  const muteLabel = isMuted ? "Unmute programme" : "Mute programme";

  return (
    <div className="watch-player__controls" role="group" aria-label="Player controls">
      <button className="watch-player__control" type="button" aria-label={playPauseLabel} title={playPauseLabel} onClick={onTogglePlayback}>
        <span className={`control-icon ${isPlaying ? "control-icon--pause" : "control-icon--play"}`} aria-hidden="true" />
      </button>
      <div className="watch-player__seek-controls" role="group" aria-label="Seek controls">
        <button
          className="watch-player__control"
          type="button"
          disabled={!hasDuration}
          aria-label="Back 10 seconds"
          title="Back 10 seconds"
          onClick={() => onSeekBy(-10)}
        >
          <span className="watch-player__seek-icon" aria-hidden="true">10</span>
        </button>
        <button
          className="watch-player__control"
          type="button"
          disabled={!hasDuration}
          aria-label="Forward 10 seconds"
          title="Forward 10 seconds"
          onClick={() => onSeekBy(10)}
        >
          <span className="watch-player__seek-icon watch-player__seek-icon--forward" aria-hidden="true">10</span>
        </button>
      </div>
      <output className="watch-player__time watch-player__time--current" aria-label={`Current time ${formatMediaTime(currentTime)}`}>
        {formatMediaTime(currentTime)}
      </output>
      <input
        className="watch-player__timeline"
        type="range"
        min="0"
        max={hasDuration ? duration : 0}
        step="0.1"
        value={hasDuration ? currentTime : 0}
        disabled={!hasDuration}
        aria-label={`Seek through ${programmeName}`}
        aria-valuetext={`${formatMediaTime(currentTime)} of ${formatMediaTime(duration)}`}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <output className="watch-player__time watch-player__time--duration" aria-label={`Duration ${formatMediaTime(duration)}`}>
        {formatMediaTime(duration)}
      </output>
      <button className="watch-player__control" type="button" aria-label={muteLabel} title={muteLabel} onClick={onToggleMuted}>
        <span className={`control-icon ${isMuted ? "control-icon--mute" : "control-icon--sound"}`} aria-hidden="true" />
      </button>
      <label className="watch-player__volume">
        <span className="visually-hidden">Volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          aria-label="Volume"
          aria-valuetext={`${Math.round(volume * 100)} percent`}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
        />
      </label>
      {captionsAvailable ? (
        <button
          className="watch-player__control watch-player__control--captions"
          type="button"
          aria-pressed={captionsEnabled}
          aria-label={captionsEnabled ? "Turn captions off" : "Turn captions on"}
          title={captionsEnabled ? "Turn captions off" : "Turn captions on"}
          onClick={onToggleCaptions}
        >
          CC
        </button>
      ) : null}
      {fullscreenSupported ? (
        <button
          className="watch-player__control"
          type="button"
          aria-pressed={isFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={onToggleFullscreen}
        >
          <span className="watch-player__fullscreen-icon" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
