import type { Song } from "./schema";

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Referer: "https://music.163.com/",
};
const BATCH_SIZE = 50;

export async function resolvePlaylistId(shortLink: string): Promise<string> {
  const resp = await fetch(shortLink, { headers: HEADERS, redirect: "follow" });
  const url = resp.url;
  const match = url.match(/[?&]id=(\d+)/);
  if (!match) throw new Error(`Cannot extract id from redirected URL: ${url}`);
  return match[1];
}

interface TrackIdItem {
  id: number;
}

interface PlaylistDetailResponse {
  code: number;
  playlist: {
    name: string;
    trackIds: TrackIdItem[];
  };
}

export async function fetchPlaylist(
  playlistId: string
): Promise<{ name: string; songs: Song[] }> {
  const detailUrl = `https://music.163.com/api/v6/playlist/detail?id=${playlistId}`;
  const detailResp = await fetch(detailUrl, { headers: HEADERS });
  const detailData: PlaylistDetailResponse = await detailResp.json();

  if (detailData.code !== 200) {
    throw new Error(`NetEase API error: code ${detailData.code}`);
  }

  const name = detailData.playlist.name;
  const trackIds = detailData.playlist.trackIds.map((t) => String(t.id));
  const songs = await fetchSongDetails(trackIds);

  return { name, songs };
}

async function fetchSongDetails(trackIds: string[]): Promise<Song[]> {
  const allSongs: Song[] = [];

  for (let start = 0; start < trackIds.length; start += BATCH_SIZE) {
    const batch = trackIds.slice(start, start + BATCH_SIZE);
    const cParam = JSON.stringify(batch.map((id) => ({ id: Number(id) })));
    const body = new URLSearchParams({
      ids: `[${batch.join(",")}]`,
      c: cParam,
    });

    const resp = await fetch("https://music.163.com/api/song/detail", {
      method: "POST",
      headers: {
        ...HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await resp.json();
    const songs: Song[] = (data.songs ?? []).map(
      (s: { name: string; artists: { name: string }[]; album: { name: string }; id: number }) => ({
        name: s.name,
        artists: s.artists.map((a: { name: string }) => a.name),
        album: s.album?.name ?? "",
        id: s.id,
      })
    );
    allSongs.push(...songs);
  }

  return allSongs;
}
