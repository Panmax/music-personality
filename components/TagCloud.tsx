"use client";

interface TagCloudProps {
  tags: string[];
}

const tagStyles = [
  { bg: "rgba(212, 165, 116, 0.12)", color: "var(--accent-gold)", border: "rgba(212, 165, 116, 0.2)" },
  { bg: "rgba(196, 114, 90, 0.12)", color: "var(--accent-warm)", border: "rgba(196, 114, 90, 0.2)" },
  { bg: "rgba(90, 155, 143, 0.12)", color: "var(--accent-teal)", border: "rgba(90, 155, 143, 0.2)" },
  { bg: "rgba(107, 122, 153, 0.12)", color: "var(--accent-slate)", border: "rgba(107, 122, 153, 0.2)" },
  { bg: "rgba(232, 200, 122, 0.12)", color: "var(--accent-gold-light)", border: "rgba(232, 200, 122, 0.2)" },
];

export default function TagCloud({ tags }: TagCloudProps) {
  return (
    <section className="animate-fade-in-up delay-600">
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
          品味标签
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag, i) => {
          const style = tagStyles[i % tagStyles.length];
          return (
            <span
              key={tag}
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-transform duration-200 hover:scale-105 animate-fade-in-up cursor-default"
              style={{
                background: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                animationDelay: `${0.6 + i * 0.08}s`,
              }}
            >
              {tag}
            </span>
          );
        })}
      </div>
    </section>
  );
}
