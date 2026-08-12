interface HeroControlsSlotProps {
  isMuted: boolean;
  isPaused: boolean;
  previewAvailable: boolean;
  onToggleMuted: () => void;
  onTogglePlayback: () => void;
}

export function HeroControlsSlot({
  isMuted,
  isPaused,
  previewAvailable,
  onToggleMuted,
  onTogglePlayback,
}: HeroControlsSlotProps) {
  const muteLabel = isMuted ? "Turn preview sound on" : "Mute preview";
  const playbackLabel = isPaused ? "Resume preview" : "Pause preview";

  return (
    <div className="hero-stage__controls" role="group" aria-label="Preview controls">
      <button
        className="hero-control"
        type="button"
        disabled={!previewAvailable}
        aria-label={previewAvailable ? muteLabel : "Preview sound unavailable"}
        title={previewAvailable ? muteLabel : "Preview sound unavailable"}
        onClick={onToggleMuted}
      >
        <span className={`control-icon ${isMuted ? "control-icon--mute" : "control-icon--sound"}`} aria-hidden="true" />
      </button>
      <button
        className="hero-control"
        type="button"
        disabled={!previewAvailable}
        aria-label={previewAvailable ? playbackLabel : "Preview unavailable"}
        title={previewAvailable ? playbackLabel : "Preview unavailable"}
        onClick={onTogglePlayback}
      >
        <span className={`control-icon ${isPaused ? "control-icon--play" : "control-icon--pause"}`} aria-hidden="true" />
      </button>
    </div>
  );
}
