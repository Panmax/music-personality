"use client";

import { useState, useEffect } from "react";

interface LoadingAnimationProps {
  phase: "playlist" | "analyze";
  playlistInfo?: { name: string; total: number } | null;
}

const playlistMessages = [
  "正在获取歌单...",
  "正在读取曲目信息...",
];

const analyzeMessages = [
  "正在分析你的音乐基因...",
  "正在扫描情感光谱...",
  "正在解码品味密码...",
  "正在绘制灵魂画像...",
  "正在撰写内心独白...",
];

export default function LoadingAnimation({ phase, playlistInfo }: LoadingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = phase === "playlist" ? playlistMessages : analyzeMessages;

  useEffect(() => {
    setMessageIndex(0);
  }, [phase]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative overflow-hidden">
      {/* Background pulse */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-pulse-soft pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212, 165, 116, 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Spinning vinyl disc */}
        <div className="relative mb-10">
          <div
            className="w-32 h-32 rounded-full animate-spin-slow"
            style={{
              background: `
                radial-gradient(circle at center,
                  var(--accent-gold) 0%,
                  var(--accent-gold) 6%,
                  var(--bg-card) 7%,
                  var(--bg-card) 12%,
                  rgba(212, 165, 116, 0.08) 13%,
                  var(--bg-card) 14%,
                  rgba(212, 165, 116, 0.05) 28%,
                  var(--bg-card) 29%,
                  rgba(212, 165, 116, 0.03) 44%,
                  var(--bg-card) 45%,
                  rgba(212, 165, 116, 0.06) 60%,
                  var(--bg-card) 61%,
                  rgba(212, 165, 116, 0.04) 78%,
                  var(--bg-surface) 79%,
                  var(--bg-surface) 100%
                )
              `,
              border: "2px solid var(--border-subtle)",
              boxShadow: "0 0 60px rgba(212, 165, 116, 0.1), inset 0 0 20px rgba(0,0,0,0.3)",
            }}
          />
          {/* Tonearm */}
          <div
            className="absolute -top-2 -right-4 w-16 h-1 rounded-full origin-left"
            style={{
              background: "linear-gradient(90deg, var(--accent-gold-dim), var(--text-muted))",
              transform: "rotate(35deg)",
            }}
          />
        </div>

        {/* Rotating message */}
        <p
          className="text-lg font-medium mb-3 animate-fade-in text-center"
          style={{ color: "var(--accent-gold)", fontFamily: "inherit" }}
          key={`${phase}-${messageIndex}`}
        >
          {messages[messageIndex]}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
              style={{
                background: "var(--accent-gold)",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Playlist info when in analyze phase */}
        {phase === "analyze" && playlistInfo && (
          <div
            className="card-glass rounded-xl px-6 py-4 text-center animate-fade-in-up"
          >
            <p
              className="text-sm mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              正在分析歌单
            </p>
            <p
              className="text-base font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {playlistInfo.name}
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--accent-gold-dim)" }}
            >
              共 {playlistInfo.total} 首歌曲
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
