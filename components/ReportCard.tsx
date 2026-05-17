"use client";

import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import type { AnalysisResult } from "@/lib/schema";
import OverviewCard from "./OverviewCard";
import RadarChart from "./RadarChart";
import EmotionSpectrum from "./EmotionSpectrum";
import SoulPlaylist from "./SoulPlaylist";
import MbtiCard from "./MbtiCard";
import HobbiesCard from "./HobbiesCard";
import ChatGuideCard from "./ChatGuideCard";
import InnerVoice from "./InnerVoice";
import TagCloud from "./TagCloud";

interface ReportCardProps {
  data: AnalysisResult;
  playlistName: string;
  onReset: () => void;
}

export default function ReportCard({ data, playlistName, onReset }: ReportCardProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = useCallback(async () => {
    if (!reportRef.current) return;

    try {
      const dataUrl = await toPng(reportRef.current, {
        backgroundColor: "#0a0b14",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `灵魂唱片店-${playlistName || "报告"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to save image:", err);
    }
  }, [playlistName]);

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 relative">
      {/* Background ambient */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.04] blur-[150px] pointer-events-none"
        style={{ background: "var(--accent-gold)" }}
      />

      {/* Report header */}
      <div className="max-w-2xl mx-auto mb-8 text-center animate-fade-in-up">
        <p
          className="text-xs tracking-[0.3em] uppercase mb-3"
          style={{ color: "var(--accent-gold-dim)" }}
        >
          灵魂唱片店
        </p>
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          }}
        >
          {playlistName}
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          的灵魂分析报告
        </p>
      </div>

      {/* Capturable report area */}
      <div
        ref={reportRef}
        className="max-w-2xl mx-auto"
        style={{ background: "var(--bg-deep)" }}
      >
        {/* Watermark header for screenshot */}
        <div
          className="text-center pb-6 mb-2"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <p
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: "var(--accent-gold-dim)" }}
          >
            灵魂唱片店 &mdash; {playlistName}
          </p>
        </div>

        {/* All report sections */}
        <div className="flex flex-col gap-12 py-8">
          <OverviewCard overview={data.overview} />

          <div
            className="w-full h-[1px]"
            style={{ background: "linear-gradient(to right, transparent, var(--border-subtle), transparent)" }}
          />

          <RadarChart dimensions={data.musicDna} />

          <div
            className="w-full h-[1px]"
            style={{ background: "linear-gradient(to right, transparent, var(--border-subtle), transparent)" }}
          />

          <EmotionSpectrum emotions={data.emotionSpectrum} />

          <div
            className="w-full h-[1px]"
            style={{ background: "linear-gradient(to right, transparent, var(--border-subtle), transparent)" }}
          />

          <SoulPlaylist songs={data.soulPlaylist} />

          <div
            className="w-full h-[1px]"
            style={{ background: "linear-gradient(to right, transparent, var(--border-subtle), transparent)" }}
          />

          <MbtiCard mbti={data.mbti} />

          <div
            className="w-full h-[1px]"
            style={{ background: "linear-gradient(to right, transparent, var(--border-subtle), transparent)" }}
          />

          <HobbiesCard hobbies={data.hobbies} />

          <div
            className="w-full h-[1px]"
            style={{ background: "linear-gradient(to right, transparent, var(--border-subtle), transparent)" }}
          />

          <ChatGuideCard chatGuide={data.chatGuide} />

          <div
            className="w-full h-[1px]"
            style={{ background: "linear-gradient(to right, transparent, var(--border-subtle), transparent)" }}
          />

          <InnerVoice text={data.innerVoice} />

          <div
            className="w-full h-[1px]"
            style={{ background: "linear-gradient(to right, transparent, var(--border-subtle), transparent)" }}
          />

          <TagCloud tags={data.tags} />

          {/* Footer watermark */}
          <div className="text-center pt-6 mt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <p
              className="text-xs"
              style={{ color: "var(--text-muted)", opacity: 0.6 }}
            >
              灵魂唱片店 &bull; 基于网易云音乐歌单的人格分析
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons (outside capturable area) */}
      <div className="max-w-2xl mx-auto mt-10 flex flex-col sm:flex-row gap-3 animate-fade-in-up delay-700">
        <button
          onClick={handleSaveImage}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, var(--accent-gold-dim) 0%, var(--accent-gold) 100%)",
            color: "var(--bg-deep)",
            border: "none",
            boxShadow: "0 4px 24px rgba(212, 165, 116, 0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 6px 32px rgba(212, 165, 116, 0.35)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 24px rgba(212, 165, 116, 0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          保存长图
        </button>

        <button
          onClick={onReset}
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer"
          style={{
            background: "transparent",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-glow)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          再测一个
        </button>
      </div>
    </div>
  );
}
