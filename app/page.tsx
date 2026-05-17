"use client";

import { useState } from "react";
import InputForm from "@/components/InputForm";
import LoadingAnimation from "@/components/LoadingAnimation";
import ReportCard from "@/components/ReportCard";
import type { AnalysisResult, PlaylistResponse } from "@/lib/schema";

type AppState =
  | { phase: "input" }
  | { phase: "fetching" }
  | { phase: "analyzing"; playlistInfo: { name: string; total: number } }
  | { phase: "done"; playlistName: string; result: AnalysisResult }
  | { phase: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<AppState>({ phase: "input" });

  const handleSubmit = async (input: string) => {
    try {
      setState({ phase: "fetching" });

      const playlistResp = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const playlistData: PlaylistResponse & { error?: string } =
        await playlistResp.json();

      if (!playlistResp.ok || playlistData.error) {
        setState({
          phase: "error",
          message: playlistData.error ?? "获取歌单失败",
        });
        return;
      }

      setState({
        phase: "analyzing",
        playlistInfo: {
          name: playlistData.playlist,
          total: playlistData.total,
        },
      });

      const analyzeResp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlist: playlistData.playlist,
          songs: playlistData.songs,
        }),
      });
      const analyzeData: AnalysisResult & { error?: string } =
        await analyzeResp.json();

      if (!analyzeResp.ok || analyzeData.error) {
        setState({
          phase: "error",
          message: analyzeData.error ?? "分析失败",
        });
        return;
      }

      setState({
        phase: "done",
        playlistName: playlistData.playlist,
        result: analyzeData,
      });
    } catch {
      setState({ phase: "error", message: "网络错误，请重试" });
    }
  };

  const handleReset = () => setState({ phase: "input" });

  if (state.phase === "input") {
    return <InputForm onSubmit={handleSubmit} loading={false} />;
  }

  if (state.phase === "fetching") {
    return <LoadingAnimation phase="playlist" />;
  }

  if (state.phase === "analyzing") {
    return (
      <LoadingAnimation phase="analyze" playlistInfo={state.playlistInfo} />
    );
  }

  if (state.phase === "done") {
    return (
      <ReportCard
        data={state.result}
        playlistName={state.playlistName}
        onReset={handleReset}
      />
    );
  }

  // error state - style to match the dark cosmic theme
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <p className="text-red-400 text-lg mb-4">{state.message}</p>
      <button
        onClick={handleReset}
        className="px-6 py-3 bg-[#d4a574] text-[#0a0b14] rounded-xl font-medium hover:bg-[#e8c87a] transition-colors"
      >
        重试
      </button>
    </div>
  );
}
