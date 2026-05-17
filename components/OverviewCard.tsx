"use client";

interface OverviewCardProps {
  overview: {
    summary: string;
    stats: {
      songCount: number;
      artistCount: number;
      yearSpan: string;
    };
  };
}

export default function OverviewCard({ overview }: OverviewCardProps) {
  const { summary, stats } = overview;

  return (
    <section className="animate-fade-in-up">
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
          灵魂画像
        </span>
      </div>

      {/* Summary quote */}
      <div className="relative mb-8">
        {/* Large decorative quotation mark */}
        <span
          className="absolute -top-6 -left-2 text-6xl leading-none select-none pointer-events-none"
          style={{
            color: "var(--accent-gold)",
            opacity: 0.15,
            fontFamily: "Georgia, serif",
          }}
        >
          &ldquo;
        </span>
        <p
          className="text-xl sm:text-2xl leading-relaxed font-medium pl-6"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          }}
        >
          {summary}
        </p>
        <span
          className="absolute -bottom-4 right-0 text-6xl leading-none select-none pointer-events-none"
          style={{
            color: "var(--accent-gold)",
            opacity: 0.15,
            fontFamily: "Georgia, serif",
          }}
        >
          &rdquo;
        </span>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-4 mt-10"
      >
        {[
          { label: "曲目", value: String(stats.songCount), suffix: "首", isText: false },
          { label: "艺术家", value: String(stats.artistCount), suffix: "位", isText: false },
          { label: "年代跨度", value: stats.yearSpan, suffix: "", isText: true },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="card-glass rounded-xl p-4 text-center animate-fade-in-up flex flex-col justify-center"
            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
          >
            <p
              className={`font-bold mb-1 ${stat.isText ? "text-sm sm:text-base" : "text-2xl sm:text-3xl"}`}
              style={{
                color: "var(--accent-gold)",
                fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
              }}
            >
              {stat.value}
              {stat.suffix && (
                <span
                  className="text-sm font-normal ml-0.5"
                  style={{ color: "var(--accent-gold-dim)" }}
                >
                  {stat.suffix}
                </span>
              )}
            </p>
            <p
              className="text-xs tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
