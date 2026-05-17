"use client";

import { useState } from "react";
import Image from "next/image";

interface InputFormProps {
  onSubmit: (input: string) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [value, setValue] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const canSubmit = value.trim().length > 0 && !loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !loading) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)" }}
      />

      {/* Decorative vinyl ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[var(--border-subtle)] opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[var(--border-subtle)] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[var(--border-subtle)] opacity-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-xl w-full animate-fade-in-up">
        {/* Icon / Logo area */}
        <div className="mb-8 relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)",
              border: "1px solid var(--border-glow)",
              boxShadow: "0 0 40px rgba(212, 165, 116, 0.15)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-center"
          style={{ fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)" }}
        >
          <span className="text-shimmer">灵魂唱片店</span>
        </h1>

        <p
          className="text-base sm:text-lg mb-10 text-center leading-relaxed max-w-md"
          style={{ color: "var(--text-secondary)" }}
        >
          粘贴你的网易云歌单链接，
          <br />
          我来读一读你的灵魂。
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
          <div className="relative group">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="粘贴歌单链接或ID..."
              disabled={loading}
              className="w-full px-5 py-4 rounded-xl text-base outline-none transition-all duration-300 placeholder:opacity-40"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--border-glow)";
                e.currentTarget.style.boxShadow = "0 0 24px rgba(212, 165, 116, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl text-base font-semibold tracking-wide transition-all duration-300"
            style={{
              background: canSubmit
                ? "linear-gradient(135deg, #c9965a 0%, #e8c87a 50%, #d4a574 100%)"
                : "var(--bg-surface)",
              color: canSubmit ? "var(--bg-deep)" : "var(--text-muted)",
              border: "none",
              opacity: canSubmit ? 1 : 0.4,
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? "0 4px 24px rgba(232, 200, 122, 0.35)" : "none",
            }}
            onMouseEnter={(e) => {
              if (canSubmit) {
                e.currentTarget.style.boxShadow = "0 6px 32px rgba(212, 165, 116, 0.35)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = canSubmit ? "0 4px 24px rgba(232, 200, 122, 0.35)" : "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? "正在解读..." : "开始解读"}
          </button>
        </form>

        {/* Hint */}
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="mt-6 text-xs text-center transition-colors duration-200 cursor-pointer"
          style={{ color: "var(--text-muted)", opacity: 0.6, background: "none", border: "none" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent-gold)";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.opacity = "0.6";
          }}
        >
          如何获取歌单链接？
        </button>
      </div>

      {/* Guide modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.85)" }}
          onClick={() => setShowGuide(false)}
        >
          <div
            className="relative max-w-sm w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="text-sm text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              在网易云音乐 App 中，打开歌单 → 点击「分享」→ 选择「复制链接」
            </p>
            <div className="w-full rounded-xl overflow-hidden">
              <Image
                src="/guide.png"
                alt="获取歌单链接步骤"
                width={300}
                height={650}
                className="w-full h-auto"
              />
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
