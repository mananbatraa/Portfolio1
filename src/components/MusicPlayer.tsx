"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { music } from "@/lib/content";

type Embed = { src: string; width: number; height: number };

// Turns a YouTube or Spotify track link into its official embed.
function toEmbed(url: string): Embed | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) {
    return { src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&loop=1&playlist=${yt[1]}`, width: 320, height: 180 };
  }
  const sp = url.match(/open\.spotify\.com\/(?:embed\/)?track\/(\w{22})/);
  if (sp) {
    return { src: `https://open.spotify.com/embed/track/${sp[1]}?utm_source=generator&theme=0`, width: 320, height: 80 };
  }
  return null;
}

function Bars({ playing }: { playing: boolean }) {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden>
      {[0.9, 0.5, 1, 0.65].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-accent"
          animate={playing ? { height: ["30%", `${h * 100}%`, "45%", `${h * 80}%`, "30%"] } : { height: "30%" }}
          transition={playing ? { duration: 1.1 + i * 0.15, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        />
      ))}
    </span>
  );
}

const isAudioFile = (url: string) => /\.(mp3|m4a|ogg|wav|aac)(\?|$)/i.test(url);

// Icon-only mode for a self-hosted audio file: the waves icon is the whole UI.
function AudioIcon() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audio.current) audio.current.volume = 0.5;
  }, []);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <audio ref={audio} src={music.url} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Pause music" : `Play ${music.title} by ${music.artist}`}
        title={`${music.title} · ${music.artist}`}
        className="glass-border flex h-12 w-12 items-center justify-center rounded-full bg-ground/70 backdrop-blur-xl transition hover:border-accent/50"
      >
        <Bars playing={playing} />
      </button>
    </div>
  );
}

// Off until someone opens it: browsers block autoplay with sound, and
// visitors shouldn't get music they didn't ask for. Closing stops playback.
export default function MusicPlayer() {
  return isAudioFile(music.url) ? <AudioIcon /> : <EmbedPlayer />;
}

function EmbedPlayer() {
  const [open, setOpen] = useState(false);
  const embed = toEmbed(music.url);
  if (!embed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="glass-border overflow-hidden rounded-2xl bg-ground/80 p-3 shadow-2xl backdrop-blur-xl"
          >
            <p className="mb-2 px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
              Now playing · <span className="text-accent">{music.title}</span> — {music.artist}
            </p>
            <iframe
              title={`${music.title} by ${music.artist}`}
              src={embed.src}
              width={embed.width}
              height={embed.height}
              className="max-w-[calc(100vw-4rem)] rounded-lg border-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              loading="lazy"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close music player" : `Play ${music.title} by ${music.artist}`}
        className="glass-border flex items-center gap-3 rounded-full bg-ground/70 px-4 py-3 text-sm text-white/80 backdrop-blur-xl transition hover:border-accent/50 hover:text-white"
      >
        <Bars playing={open} />
        <span className="hidden sm:inline">{open ? "Close" : "Play music"}</span>
      </button>
    </div>
  );
}
