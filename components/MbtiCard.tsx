import type { Mbti } from "@/lib/schema";

interface MbtiCardProps {
  mbti: Mbti;
}

export default function MbtiCard({ mbti }: MbtiCardProps) {
  return (
    <div className="animate-fade-in-up">
      <p
        className="text-xs tracking-[0.2em] uppercase mb-6"
        style={{ color: "var(--accent-gold-dim)" }}
      >
        &mdash;&mdash; MBTI 人格推测
      </p>

      <div className="flex items-baseline gap-4 mb-4">
        <span
          className="text-4xl sm:text-5xl font-bold tracking-wider"
          style={{
            fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
            color: "var(--accent-gold)",
          }}
        >
          {mbti.type}
        </span>
        <span
          className="text-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          {mbti.title}
        </span>
      </div>

      <p
        className="text-base leading-relaxed mb-6"
        style={{ color: "var(--text-secondary)" }}
      >
        {mbti.description}
      </p>

      <div className="flex flex-col gap-2">
        {mbti.evidence.map((e, i) => (
          <div
            key={i}
            className="flex items-start gap-3 text-sm"
          >
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: "var(--accent-gold-dim)" }}
            />
            <span style={{ color: "var(--text-secondary)" }}>{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
