import type { ChatGuide } from "@/lib/schema";

interface ChatGuideCardProps {
  chatGuide: ChatGuide;
}

export default function ChatGuideCard({ chatGuide }: ChatGuideCardProps) {
  return (
    <div className="animate-fade-in-up">
      <p
        className="text-xs tracking-[0.2em] uppercase mb-6"
        style={{ color: "var(--accent-gold-dim)" }}
      >
        &mdash;&mdash; 聊天攻略
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <p
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: "var(--accent-teal)" }}
          >
            <span>&#10003;</span> 应该做的
          </p>
          <div className="flex flex-col gap-2">
            {chatGuide.dos.map((item, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed pl-4"
                style={{
                  color: "var(--text-secondary)",
                  borderLeft: "2px solid var(--accent-teal)",
                }}
              >
                {item}
              </p>
            ))}
          </div>
        </div>

        <div>
          <p
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: "var(--accent-warm)" }}
          >
            <span>&#10007;</span> 不该做的
          </p>
          <div className="flex flex-col gap-2">
            {chatGuide.donts.map((item, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed pl-4"
                style={{
                  color: "var(--text-secondary)",
                  borderLeft: "2px solid var(--accent-warm)",
                }}
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--accent-gold)" }}
        >
          &#9889; 破冰话题
        </p>
        <div className="flex flex-col gap-2">
          {chatGuide.icebreakers.map((item, i) => (
            <div
              key={i}
              className="card-glass rounded-lg px-4 py-3"
            >
              <p
                className="text-sm italic"
                style={{ color: "var(--text-primary)" }}
              >
                &ldquo;{item}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
