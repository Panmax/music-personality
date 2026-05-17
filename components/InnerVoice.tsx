"use client";

interface InnerVoiceProps {
  text: string;
}

export default function InnerVoice({ text }: InnerVoiceProps) {
  return (
    <section className="animate-fade-in-up delay-500">
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
          内心独白
        </span>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(212, 165, 116, 0.06) 0%, rgba(18, 19, 31, 0.9) 50%, rgba(90, 155, 143, 0.04) 100%)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Decorative side bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{
            background: "linear-gradient(to bottom, var(--accent-gold), transparent)",
          }}
        />

        <div className="px-8 py-8 sm:px-10 sm:py-10">
          <p
            className="text-base sm:text-lg leading-loose whitespace-pre-line"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
              fontStyle: "italic",
              lineHeight: 2,
            }}
          >
            {text}
          </p>
        </div>

        {/* Bottom decorative element */}
        <div
          className="absolute bottom-4 right-6 opacity-20"
          style={{ color: "var(--accent-gold)" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
      </div>
    </section>
  );
}
