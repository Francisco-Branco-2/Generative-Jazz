import { useRef, useState, useEffect } from "react";
import "./AudioPlayer.css";

function fmt(t) {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = String(Math.floor(t % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

function AudioPlayer({ src, compact = false }) {
  const audioRef   = useRef(null);
  const trackRef   = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset when src changes
  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime     = () => setCurrent(audio.currentTime);
    const onMeta     = () => { setDuration(audio.duration); setLoading(false); };
    const onEnded    = () => setPlaying(false);
    const onWaiting  = () => setLoading(true);
    const onCanPlay  = () => setLoading(false);

    audio.addEventListener("timeupdate",      onTime);
    audio.addEventListener("loadedmetadata",  onMeta);
    audio.addEventListener("ended",           onEnded);
    audio.addEventListener("waiting",         onWaiting);
    audio.addEventListener("canplay",         onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate",      onTime);
      audio.removeEventListener("loadedmetadata",  onMeta);
      audio.removeEventListener("ended",           onEnded);
      audio.removeEventListener("waiting",         onWaiting);
      audio.removeEventListener("canplay",         onCanPlay);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      audio.play().then(() => {
        setPlaying(true);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const track = trackRef.current;
    if (!audio || !track || !duration) return;
    const rect  = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrent(audio.currentTime);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className={`audio-player ${compact ? "audio-player--compact" : ""}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        className={`ap-play-btn ${playing ? "ap-play-btn--pause" : ""} ${loading ? "ap-play-btn--loading" : ""}`}
        onClick={togglePlay}
        aria-label={playing ? "Pausar" : "Reproduzir"}
      >
        {loading ? (
          <span className="ap-spinner" />
        ) : playing ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </button>

      <div className="ap-body">
        <div
          ref={trackRef}
          className="ap-track"
          onClick={handleSeek}
          role="slider"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="ap-track__fill" style={{ width: `${pct}%` }} />
          <div className="ap-track__thumb" style={{ left: `${pct}%` }} />
        </div>
        <div className="ap-times">
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
      <path d="M0 0L14 8L0 16V0Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
      <rect x="0" y="0" width="5" height="16" rx="1" />
      <rect x="9" y="0" width="5" height="16" rx="1" />
    </svg>
  );
}

export default AudioPlayer;
