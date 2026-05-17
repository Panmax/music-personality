import { NextRequest, NextResponse } from "next/server";
import { analyzePlaylist } from "@/lib/gemini";
import type { Song } from "@/lib/schema";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { playlist, songs }: { playlist: string; songs: Song[] } =
      await req.json();

    if (!songs?.length) {
      return NextResponse.json({ error: "歌曲列表为空" }, { status: 400 });
    }

    const songsToAnalyze = songs.slice(0, 200);
    const result = await analyzePlaylist(playlist, songsToAnalyze);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "分析失败，请重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
