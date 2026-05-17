import { NextRequest, NextResponse } from "next/server";
import { parsePlaylistInput } from "@/lib/parse-input";
import { resolvePlaylistId, fetchPlaylist } from "@/lib/netease";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    const parsed = parsePlaylistInput(input);

    let playlistId: string;
    if (parsed.type === "short_link") {
      playlistId = await resolvePlaylistId(parsed.value);
    } else {
      playlistId = parsed.value;
    }

    const { name, songs } = await fetchPlaylist(playlistId);

    if (songs.length < 50) {
      return NextResponse.json(
        { error: `歌单只有 ${songs.length} 首歌，至少需要 50 首才能进行分析` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      playlist: name,
      total: songs.length,
      songs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
