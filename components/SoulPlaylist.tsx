"use client";

import type { SoulSong } from "@/lib/schema";

interface SoulPlaylistProps {
  songs: SoulSong[];
}

export default function SoulPlaylist({ songs }: SoulPlaylistProps) {
  return (
    <section className="animate-fade-in-up delay-400">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-8 h-[1px]"
          style={{ background: "var(--accent-gold-dim)" }}
        />
        <span
          className="text-xs tracking-[0.2em] uppercase"
          style={{ color: "var(--accent-gold-dim)" }}
        >
          灵魂歌单
        </span>
      </div>

      <div className="grid gap-3">
        {songs.map((song, i) => (
          <div
            key={`${song.name}-${song.artist}`}
            className="card-glass rounded-xl p-5 group transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${0.5 + i * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              {/* Track number */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  background: "rgba(212, 165, 116, 0.08)",
                  color: "var(--accent-gold-dim)",
                  border: "1px solid var(--border-subtle)",
                  fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="flex-1 min-w-0">
                {/* Song name and artist */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 mb-2">
                  <h3
                    className="text-base font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {song.name}
                  </h3>
                  <span
                    className="text-sm flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {song.artist}
                  </span>
                </div>

                {/* Reason */}
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {song.reason}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
