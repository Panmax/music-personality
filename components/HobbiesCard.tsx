import type { Hobby } from "@/lib/schema";

interface HobbiesCardProps {
  hobbies: Hobby[];
}

export default function HobbiesCard({ hobbies }: HobbiesCardProps) {
  return (
    <div className="animate-fade-in-up">
      <p
        className="text-xs tracking-[0.2em] uppercase mb-6"
        style={{ color: "var(--accent-gold-dim)" }}
      >
        &mdash;&mdash; 爱好猜测
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {hobbies.map((hobby, i) => (
          <div
            key={i}
            className="card-glass rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {hobby.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(212, 165, 116, 0.15)",
                  color: "var(--accent-gold)",
                }}
              >
                {hobby.confidence}%
              </span>
            </div>
            <div
              className="w-full h-1 rounded-full mb-2 overflow-hidden"
              style={{ background: "rgba(212, 165, 116, 0.1)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${hobby.confidence}%`,
                  background: "linear-gradient(90deg, var(--accent-gold-dim), var(--accent-gold))",
                }}
              />
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              {hobby.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
