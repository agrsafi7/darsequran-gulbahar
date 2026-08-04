import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AudioPlayerProps {
  src: string;
  title: string;
  /** Controlled play intent from the parent list (optional). */
  playing?: boolean;
  onPlayingChange?: (playing: boolean) => void;
}

const SPEEDS = [1, 1.5, 2] as const;

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, playing: desiredPlaying, onPlayingChange }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlayingState] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const lastTimeUpdate = useRef(0);

  const setPlaying = (value: boolean) => {
    setPlayingState(value);
    onPlayingChange?.(value);
  };

  // New source: reset UI. Progressive streaming — only metadata is fetched
  // up front, the browser streams the rest of the audio as it plays.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(0);
    setDuration(0);
    setLoading(true);
    audio.playbackRate = SPEEDS[speedIdx];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Follow the parent's play intent (list play/pause buttons + keyboard).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || desiredPlaying === undefined) return;
    if (desiredPlaying && audio.paused) {
      audio.play().then(() => setPlayingState(true)).catch(() => {});
    } else if (!desiredPlaying && !audio.paused) {
      audio.pause();
      setPlayingState(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desiredPlaying, src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[speedIdx];
  }, [speedIdx]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio || loading) return;
    audio.currentTime = Math.max(0, Math.min((audio.duration || 0), audio.currentTime + delta));
  };

  const onSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekValue(parseFloat(e.target.value));
    setSeeking(true);
  };

  const commitSeek = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seekValue;
    setCurrent(seekValue);
    setSeeking(false);
  };

  const cycleSpeed = () => setSpeedIdx((i) => (i + 1) % SPEEDS.length);

  const displayTime = seeking ? seekValue : current;
  const progressPct = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 shadow-lg bg-card border border-border text-card-foreground"
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => {
          const now = performance.now();
          if (now - lastTimeUpdate.current < 200) return;
          lastTimeUpdate.current = now;
          if (!seeking) setCurrent(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          setLoading(false);
        }}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => { setLoading(false); setPlaying(true); }}
        onEnded={() => {
          setPlaying(false);
          toast.success("Playback finished", { description: title });
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] tracking-[0.2em] font-semibold uppercase opacity-70">
          Now Playing
        </span>
      </div>

      <h4
        className="text-center font-semibold text-base sm:text-lg leading-snug mb-5 line-clamp-2 px-2"
        style={{ fontFamily: "Amiri, serif" }}
        title={title}
      >
        {title}
      </h4>

      <div className="flex items-center justify-center gap-5 sm:gap-7 mb-5">
        <button
          type="button"
          onClick={() => skip(-10)}
          disabled={!duration}
          aria-label="Rewind 10 seconds"
          className="relative opacity-90 hover:opacity-100 transition disabled:opacity-40"
        >
          <RotateCcw className="h-7 w-7" strokeWidth={2} />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-0.5">
            10
          </span>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          disabled={false}
          aria-label={playing ? "Pause" : "Play"}
          className="flex items-center justify-center rounded-full h-16 w-16 sm:h-[72px] sm:w-[72px] transition-transform hover:scale-105 bg-primary text-primary-foreground ring-2 ring-primary/40 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : playing ? (
            <Pause className="h-7 w-7" fill="currentColor" />
          ) : (
            <Play className="h-7 w-7 ml-0.5" fill="currentColor" />
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(10)}
          disabled={!duration}
          aria-label="Forward 10 seconds"
          className="relative opacity-90 hover:opacity-100 transition disabled:opacity-40"
        >
          <RotateCw className="h-7 w-7" strokeWidth={2} />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-0.5">
            10
          </span>
        </button>

        <button
          type="button"
          onClick={cycleSpeed}
          aria-label="Playback speed"
          className="text-sm font-semibold px-2.5 py-1 rounded-md border border-border opacity-90 hover:opacity-100 transition min-w-[44px]"
        >
          {SPEEDS[speedIdx]}x
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs tabular-nums opacity-90 w-10 text-left">
          {formatTime(displayTime)}
        </span>
        <div className="relative flex-1 h-1.5 rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${progressPct}%`, transition: seeking ? "none" : "width 200ms linear" }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={displayTime}
            onChange={onSeekChange}
            onMouseUp={commitSeek}
            onTouchEnd={commitSeek}
            onKeyUp={commitSeek}
            disabled={loading}
            aria-label="Seek"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div
            className="absolute -top-1 h-3.5 w-3.5 rounded-full shadow bg-primary"
            style={{ left: `calc(${progressPct}% - 7px)`, transition: seeking ? "none" : "left 200ms linear" }}
          />
        </div>
        <span className="text-xs tabular-nums opacity-90 w-12 text-right">
          {formatTime(duration)}
        </span>
      </div>

      {loading && (
        <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Buffering…
        </p>
      )}
    </div>
  );
}
