import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title: string;
  label?: string;
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

export function AudioPlayer({ src, title, label = "DORA E TAFSIR" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);

  // Reset & autoplay when src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(0);
    setDuration(0);
    audio.playbackRate = SPEEDS[speedIdx];
    const playPromise = audio.play();
    if (playPromise) playPromise.then(() => setPlaying(true)).catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

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
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min((audio.duration || 0), audio.currentTime + delta));
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrent(val);
  };

  const cycleSpeed = () => setSpeedIdx((i) => (i + 1) % SPEEDS.length);

  const progressPct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 shadow-lg"
      style={{
        background: "linear-gradient(135deg, hsl(178 55% 18%), hsl(178 60% 14%))",
        color: "hsl(40 30% 95%)",
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[11px] sm:text-xs tracking-[0.2em] font-semibold opacity-80">
          {label}
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
          aria-label="Rewind 10 seconds"
          className="relative opacity-90 hover:opacity-100 transition"
        >
          <RotateCcw className="h-7 w-7" strokeWidth={2} />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-0.5">
            10
          </span>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="flex items-center justify-center rounded-full h-16 w-16 sm:h-[72px] sm:w-[72px] transition-transform hover:scale-105"
          style={{
            background: "hsl(178 55% 18%)",
            boxShadow: "0 0 0 3px hsl(45 70% 55%)",
          }}
        >
          {playing ? (
            <Pause className="h-7 w-7" fill="currentColor" />
          ) : (
            <Play className="h-7 w-7 ml-0.5" fill="currentColor" />
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(30)}
          aria-label="Forward 30 seconds"
          className="relative opacity-90 hover:opacity-100 transition"
        >
          <RotateCw className="h-7 w-7" strokeWidth={2} />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-0.5">
            30
          </span>
        </button>

        <button
          type="button"
          onClick={cycleSpeed}
          aria-label="Playback speed"
          className="text-sm font-semibold px-2.5 py-1 rounded-md border border-current/40 opacity-90 hover:opacity-100 transition min-w-[44px]"
          style={{ borderColor: "hsl(40 30% 95% / 0.4)" }}
        >
          {SPEEDS[speedIdx]}x
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs tabular-nums opacity-90 w-10 text-left">
          {formatTime(current)}
        </span>
        <div className="relative flex-1 h-1.5 rounded-full bg-white/15">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${progressPct}%`, background: "hsl(45 70% 55%)" }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={onSeek}
            aria-label="Seek"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute -top-1 h-3.5 w-3.5 rounded-full shadow"
            style={{
              left: `calc(${progressPct}% - 7px)`,
              background: "hsl(45 70% 55%)",
            }}
          />
        </div>
        <span className="text-xs tabular-nums opacity-90 w-12 text-right">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
