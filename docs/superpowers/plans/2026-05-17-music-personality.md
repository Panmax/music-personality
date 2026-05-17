# Music Personality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app that takes a NetEase Cloud Music playlist URL, fetches all songs, sends them to Gemini 3.1 Pro for personality analysis, and renders a visual report with long-image export.

**Architecture:** Single Next.js App Router project with two API Routes (`/api/playlist` for scraping, `/api/analyze` for Gemini). One page with three states (input → loading → report). Report rendered as modular card components, exported as PNG via html2canvas. Deployed on Vercel.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS, Recharts, `@google/genai`, zod, html2canvas

---

## File Map

```
music-personality/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Main page: input/loading/report states
│   ├── globals.css             # Tailwind directives + custom styles
│   └── api/
│       ├── playlist/route.ts   # POST: parse input → fetch playlist → return songs JSON
│       └── analyze/route.ts    # POST: songs → Gemini prompt → return structured JSON
├── components/
│   ├── InputForm.tsx           # Playlist URL input + submit button
│   ├── LoadingAnimation.tsx    # Ritual loading messages with animation
│   ├── ReportCard.tsx          # Report container (screenshot target for html2canvas)
│   ├── OverviewCard.tsx        # Soul portrait summary + stats
│   ├── RadarChart.tsx          # Music DNA radar (Recharts)
│   ├── EmotionSpectrum.tsx     # Emotion distribution pie/bar chart (Recharts)
│   ├── SoulPlaylist.tsx        # Top 3-5 representative songs
│   ├── InnerVoice.tsx          # Second-person poetic paragraph
│   └── TagCloud.tsx            # Fun hashtag labels
├── lib/
│   ├── netease.ts              # NetEase API: resolve ID, fetch trackIds, batch song details
│   ├── gemini.ts               # Gemini call: build prompt, call API, parse response
│   ├── schema.ts               # Zod schemas for Gemini output + API responses
│   └── parse-input.ts          # Extract playlist URL/ID from various input formats
├── .env.local                  # GEMINI_API_KEY
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `.gitignore`, `.env.local`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --yes
```

This will scaffold into the existing directory. It creates `app/`, `package.json`, `tailwind.config.ts`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, etc.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
npm install recharts @google/genai zod html2canvas
npm install -D @types/html2canvas
```

- [ ] **Step 3: Create .env.local**

```bash
echo "GEMINI_API_KEY=your-api-key-here" > /Users/jiapan/Codes/github.com/music-personality/.env.local
```

The user must replace `your-api-key-here` with their actual Gemini API key.

- [ ] **Step 4: Verify dev server starts**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
npm run dev
```

Expected: Dev server starts at `http://localhost:3000`, default Next.js page loads.

- [ ] **Step 5: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add -A
git commit -m "feat: scaffold Next.js project with dependencies"
```

---

## Task 2: Input Parser (`lib/parse-input.ts`)

**Files:**
- Create: `lib/parse-input.ts`
- Test: manual verification via API route later (pure function, logic is simple)

- [ ] **Step 1: Create the input parser**

Create `lib/parse-input.ts`:

```typescript
const SHORT_LINK_RE = /https?:\/\/163cn\.tv\/[A-Za-z0-9]+/;
const FULL_LINK_RE = /https?:\/\/music\.163\.com\/[^\s]*[?&]id=(\d+)/;
const PURE_ID_RE = /^\d+$/;

export interface ParsedInput {
  type: "short_link" | "full_link" | "id";
  value: string;
}

export function parsePlaylistInput(raw: string): ParsedInput {
  const trimmed = raw.trim();

  const shortMatch = trimmed.match(SHORT_LINK_RE);
  if (shortMatch) {
    return { type: "short_link", value: shortMatch[0] };
  }

  const fullMatch = trimmed.match(FULL_LINK_RE);
  if (fullMatch) {
    return { type: "full_link", value: fullMatch[1] };
  }

  const idMatch = trimmed.match(PURE_ID_RE);
  if (idMatch) {
    return { type: "id", value: idMatch[0] };
  }

  throw new Error("无法识别歌单链接，请粘贴网易云音乐歌单链接或ID");
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add lib/parse-input.ts
git commit -m "feat: add input parser for playlist URLs and share text"
```

---

## Task 3: Zod Schemas (`lib/schema.ts`)

**Files:**
- Create: `lib/schema.ts`

- [ ] **Step 1: Define all schemas**

Create `lib/schema.ts`:

```typescript
import { z } from "zod";

export const SongSchema = z.object({
  name: z.string(),
  artists: z.array(z.string()),
  album: z.string(),
  id: z.number(),
});

export const PlaylistResponseSchema = z.object({
  playlist: z.string(),
  total: z.number(),
  songs: z.array(SongSchema),
});

export const DnaDimensionSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  description: z.string(),
});

export const EmotionSchema = z.object({
  name: z.string(),
  percentage: z.number().min(0).max(100),
  color: z.string(),
});

export const SoulSongSchema = z.object({
  name: z.string(),
  artist: z.string(),
  reason: z.string(),
});

export const AnalysisResultSchema = z.object({
  overview: z.object({
    summary: z.string(),
    stats: z.object({
      songCount: z.number(),
      artistCount: z.number(),
      yearSpan: z.string(),
    }),
  }),
  musicDna: z.array(DnaDimensionSchema).length(5),
  emotionSpectrum: z.array(EmotionSchema).min(3).max(8),
  soulPlaylist: z.array(SoulSongSchema).min(3).max(5),
  innerVoice: z.string(),
  tags: z.array(z.string()).min(3).max(5),
});

export type Song = z.infer<typeof SongSchema>;
export type PlaylistResponse = z.infer<typeof PlaylistResponseSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type DnaDimension = z.infer<typeof DnaDimensionSchema>;
export type Emotion = z.infer<typeof EmotionSchema>;
export type SoulSong = z.infer<typeof SoulSongSchema>;
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add lib/schema.ts
git commit -m "feat: add zod schemas for playlist and analysis responses"
```

---

## Task 4: NetEase Playlist Fetcher (`lib/netease.ts`)

**Files:**
- Create: `lib/netease.ts`

- [ ] **Step 1: Implement the fetcher**

Create `lib/netease.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add lib/netease.ts
git commit -m "feat: add NetEase playlist fetcher with batch song detail API"
```

---

## Task 5: Playlist API Route (`app/api/playlist/route.ts`)

**Files:**
- Create: `app/api/playlist/route.ts`

- [ ] **Step 1: Implement the route**

Create `app/api/playlist/route.ts`:

```typescript
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
```

- [ ] **Step 2: Test with curl**

Start dev server (`npm run dev`) then:

```bash
curl -s -X POST http://localhost:3000/api/playlist \
  -H 'Content-Type: application/json' \
  -d '{"input": "1219486"}' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Playlist: {d[\"playlist\"]}, Songs: {d[\"total\"]}')"
```

Expected: `Playlist: 挨踢实习生喜欢的音乐, Songs: 249`

- [ ] **Step 3: Test with share text format**

```bash
curl -s -X POST http://localhost:3000/api/playlist \
  -H 'Content-Type: application/json' \
  -d '{"input": "分享歌单: 挨踢实习生喜欢的音乐 https://163cn.tv/7bAknys (@网易云音乐)"}' | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Playlist: {d[\"playlist\"]}, Songs: {d[\"total\"]}')"
```

Expected: `Playlist: 挨踢实习生喜欢的音乐, Songs: 249`

- [ ] **Step 4: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add app/api/playlist/route.ts
git commit -m "feat: add playlist API route with input parsing"
```

---

## Task 6: Gemini Integration (`lib/gemini.ts`)

**Files:**
- Create: `lib/gemini.ts`

- [ ] **Step 1: Implement Gemini caller with prompt**

Create `lib/gemini.ts`:

```typescript
import { GoogleGenAI } from "@google/genai";
import { AnalysisResultSchema, type AnalysisResult, type Song } from "./schema";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function buildPrompt(playlistName: string, songs: Song[]): string {
  const songList = songs
    .map((s, i) => `${i + 1}. ${s.name} - ${s.artists.join(", ")} (专辑: ${s.album})`)
    .join("\n");

  return `你是一位兼具心理学素养和文学才华的音乐品味分析师。请根据以下网易云音乐歌单，分析这位听众的性格、品味与内心世界。

歌单名：${playlistName}
歌曲列表（共${songs.length}首）：
${songList}

请输出严格的 JSON（不要包含 markdown 代码块标记），结构如下：

{
  "overview": {
    "summary": "一句话灵魂画像，有文学感，20-40字",
    "stats": {
      "songCount": 歌曲总数(number),
      "artistCount": 不重复歌手数(number),
      "yearSpan": "跨越的年代描述，如'从90年代到2020年代'"
    }
  },
  "musicDna": [
    恰好5个维度，每个: { "name": "维度名", "score": 0-100的整数, "description": "一句话解读，引用歌单中的具体歌曲" }
    维度必须是：怀旧指数、浪漫指数、叛逆指数、文艺指数、治愈指数
  ],
  "emotionSpectrum": [
    3-8种情绪，每个: { "name": "情绪名", "percentage": 占比(整数,所有占比加起来=100), "color": "十六进制颜色" }
  ],
  "soulPlaylist": [
    3-5首最能代表此人性格的歌，每个: { "name": "歌名", "artist": "歌手", "reason": "为什么这首歌最能代表TA，要有洞察力，30-60字" }
  ],
  "innerVoice": "以第二人称'你'写的一段诗意内心独白，150-250字。要基于歌单中的具体歌曲来描绘这个人的内心世界，语言要有温度和金句感。",
  "tags": ["#标签1", "#标签2", "#标签3"] // 3-5个趣味标签，带#号，如"#深夜emo专业户" "#90年代灵魂穿越者"
}

要求：
- 必须基于歌单中实际出现的歌曲来推断，不要泛泛而谈
- 不要罗列歌单，要解读歌单
- 每个维度的 description 和 soulPlaylist 的 reason 必须引用具体歌曲名
- 语言有温度，有金句感，适合截图分享
- 只输出 JSON，不要输出任何其他内容`;
}

export async function analyzePlaylist(
  playlistName: string,
  songs: Song[]
): Promise<AnalysisResult> {
  const prompt = buildPrompt(playlistName, songs);

  const doRequest = async (): Promise<AnalysisResult> => {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    const text = response.text ?? "";
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return AnalysisResultSchema.parse(parsed);
  };

  try {
    return await doRequest();
  } catch {
    return await doRequest();
  }
}
```

Note: Gemini 3.1 Pro may not yet have an official model ID. Use `"gemini-2.5-pro"` for now — the user should update this to the correct model ID for Gemini 3.1 Pro when available (e.g. `"gemini-3.1-pro"`). The `@google/genai` SDK uses `models.generateContent` — check the SDK docs if the API has changed.

- [ ] **Step 2: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add lib/gemini.ts
git commit -m "feat: add Gemini integration with structured prompt and zod validation"
```

---

## Task 7: Analyze API Route (`app/api/analyze/route.ts`)

**Files:**
- Create: `app/api/analyze/route.ts`

- [ ] **Step 1: Implement the route**

Create `app/api/analyze/route.ts`:

```typescript
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
```

- [ ] **Step 2: Test with curl (requires valid GEMINI_API_KEY in .env.local)**

First update `.env.local` with a real API key. Then with dev server running:

```bash
curl -s -X POST http://localhost:3000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"playlist":"测试","songs":[{"name":"海阔天空","artists":["Beyond"],"album":"乐与怒","id":347230},{"name":"成都","artists":["赵雷"],"album":"无法长大","id":436514312}]}' | python3 -c "import json,sys; d=json.load(sys.stdin); print('overview' in d, 'musicDna' in d, 'tags' in d)"
```

Expected: `True True True`

- [ ] **Step 3: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add app/api/analyze/route.ts
git commit -m "feat: add analyze API route calling Gemini"
```

---

## Task 8: InputForm Component (`components/InputForm.tsx`)

**Files:**
- Create: `components/InputForm.tsx`

- [ ] **Step 1: Implement the input form**

Create `components/InputForm.tsx`:

```tsx
"use client";

import { useState } from "react";

interface InputFormProps {
  onSubmit: (input: string) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !loading) {
      onSubmit(value.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-4xl font-bold mb-3 text-center">
        🎵 音乐人格分析
      </h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        粘贴你的网易云音乐歌单链接，AI 将为你解读音乐背后的性格密码
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="粘贴歌单链接、分享文本或歌单ID..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!value.trim() || loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            分析
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add components/InputForm.tsx
git commit -m "feat: add InputForm component"
```

---

## Task 9: LoadingAnimation Component (`components/LoadingAnimation.tsx`)

**Files:**
- Create: `components/LoadingAnimation.tsx`

- [ ] **Step 1: Implement loading animation**

Create `components/LoadingAnimation.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";

const PLAYLIST_MESSAGES = [
  "正在获取歌单...",
  "正在读取曲目信息...",
];

const ANALYZE_MESSAGES = [
  "正在分析你的音乐基因...",
  "正在扫描情感光谱...",
  "正在解码品味密码...",
  "正在绘制灵魂画像...",
  "正在撰写内心独白...",
];

interface LoadingAnimationProps {
  phase: "playlist" | "analyze";
  playlistInfo?: { name: string; total: number } | null;
}

export default function LoadingAnimation({
  phase,
  playlistInfo,
}: LoadingAnimationProps) {
  const messages = phase === "playlist" ? PLAYLIST_MESSAGES : ANALYZE_MESSAGES;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    setMsgIndex(0);
  }, [phase]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {playlistInfo && phase === "analyze" && (
        <div className="mb-8 text-center">
          <p className="text-lg font-medium">{playlistInfo.name}</p>
          <p className="text-gray-500">{playlistInfo.total} 首歌</p>
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        <p className="text-lg text-gray-600 animate-pulse">{messages[msgIndex]}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add components/LoadingAnimation.tsx
git commit -m "feat: add LoadingAnimation with ritual messages"
```

---

## Task 10: Report Card Components (OverviewCard, RadarChart, EmotionSpectrum, SoulPlaylist, InnerVoice, TagCloud)

**Files:**
- Create: `components/OverviewCard.tsx`, `components/RadarChart.tsx`, `components/EmotionSpectrum.tsx`, `components/SoulPlaylist.tsx`, `components/InnerVoice.tsx`, `components/TagCloud.tsx`

- [ ] **Step 1: Create OverviewCard**

Create `components/OverviewCard.tsx`:

```tsx
import type { AnalysisResult } from "@/lib/schema";

interface OverviewCardProps {
  overview: AnalysisResult["overview"];
}

export default function OverviewCard({ overview }: OverviewCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 text-center">
      <p className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
        &ldquo;{overview.summary}&rdquo;
      </p>
      <div className="flex justify-center gap-8 text-sm text-gray-500">
        <span>{overview.stats.songCount} 首歌</span>
        <span>{overview.stats.artistCount} 位歌手</span>
        <span>{overview.stats.yearSpan}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create RadarChart**

Create `components/RadarChart.tsx`:

```tsx
"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { DnaDimension } from "@/lib/schema";

interface RadarChartProps {
  dimensions: DnaDimension[];
}

export default function RadarChart({ dimensions }: RadarChartProps) {
  const data = dimensions.map((d) => ({
    dimension: d.name,
    value: d.score,
  }));

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        🧬 音乐 DNA
      </h2>
      <div className="w-full h-72">
        <ResponsiveContainer>
          <RechartsRadarChart data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 13 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="value"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {dimensions.map((d) => (
          <div key={d.name} className="flex items-start gap-2 text-sm">
            <span className="font-medium text-purple-700 whitespace-nowrap">
              {d.name} {d.score}
            </span>
            <span className="text-gray-600">{d.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create EmotionSpectrum**

Create `components/EmotionSpectrum.tsx`:

```tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import type { Emotion } from "@/lib/schema";

interface EmotionSpectrumProps {
  emotions: Emotion[];
}

export default function EmotionSpectrum({ emotions }: EmotionSpectrumProps) {
  const data = emotions.map((e) => ({
    name: e.name,
    value: e.percentage,
    color: e.color,
  }));

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        🌈 情感光谱
      </h2>
      <div className="w-full h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={2}
              label={({ name, value }) => `${name} ${value}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create SoulPlaylist**

Create `components/SoulPlaylist.tsx`:

```tsx
import type { SoulSong } from "@/lib/schema";

interface SoulPlaylistProps {
  songs: SoulSong[];
}

export default function SoulPlaylist({ songs }: SoulPlaylistProps) {
  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        💎 灵魂歌单
      </h2>
      <div className="space-y-4">
        {songs.map((song, i) => (
          <div
            key={i}
            className="flex gap-4 items-start p-3 rounded-xl bg-gray-50"
          >
            <span className="text-2xl font-bold text-purple-300">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-medium text-gray-800">
                {song.name}
                <span className="text-gray-400 font-normal ml-2">
                  {song.artist}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{song.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create InnerVoice**

Create `components/InnerVoice.tsx`:

```tsx
interface InnerVoiceProps {
  text: string;
}

export default function InnerVoice({ text }: InnerVoiceProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        💭 内心独白
      </h2>
      <p className="text-gray-700 leading-relaxed text-center italic text-lg">
        {text}
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Create TagCloud**

Create `components/TagCloud.tsx`:

```tsx
interface TagCloudProps {
  tags: string[];
}

export default function TagCloud({ tags }: TagCloudProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Commit all components**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add components/OverviewCard.tsx components/RadarChart.tsx components/EmotionSpectrum.tsx components/SoulPlaylist.tsx components/InnerVoice.tsx components/TagCloud.tsx
git commit -m "feat: add all report card components with Recharts visualizations"
```

---

## Task 11: ReportCard Container with Long Image Export (`components/ReportCard.tsx`)

**Files:**
- Create: `components/ReportCard.tsx`

- [ ] **Step 1: Implement the report container with export**

Create `components/ReportCard.tsx`:

```tsx
"use client";

import { useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import type { AnalysisResult } from "@/lib/schema";
import OverviewCard from "./OverviewCard";
import RadarChart from "./RadarChart";
import EmotionSpectrum from "./EmotionSpectrum";
import SoulPlaylist from "./SoulPlaylist";
import InnerVoice from "./InnerVoice";
import TagCloud from "./TagCloud";

interface ReportCardProps {
  data: AnalysisResult;
  playlistName: string;
  onReset: () => void;
}

export default function ReportCard({
  data,
  playlistName,
  onReset,
}: ReportCardProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: "#f9fafb",
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `${playlistName}-音乐人格分析.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [playlistName]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div ref={reportRef} className="space-y-6 bg-gray-50 p-6 rounded-3xl">
        <h1 className="text-center text-2xl font-bold text-gray-800">
          🎵 {playlistName}
        </h1>
        <OverviewCard overview={data.overview} />
        <RadarChart dimensions={data.musicDna} />
        <EmotionSpectrum emotions={data.emotionSpectrum} />
        <SoulPlaylist songs={data.soulPlaylist} />
        <InnerVoice text={data.innerVoice} />
        <TagCloud tags={data.tags} />
        <p className="text-center text-xs text-gray-400 pt-2">
          由 Music Personality AI 生成
        </p>
      </div>
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handleExport}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          保存长图
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
        >
          再测一个
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add components/ReportCard.tsx
git commit -m "feat: add ReportCard container with html2canvas long image export"
```

---

## Task 12: Main Page — Wire Everything Together (`app/page.tsx`, `app/layout.tsx`, `app/globals.css`)

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update globals.css**

Replace `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 2: Update layout.tsx**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "音乐人格分析 — 你的歌单藏着怎样的灵魂",
  description: "粘贴网易云音乐歌单链接，AI 为你解读音乐背后的性格密码",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Implement main page**

Replace `app/page.tsx` with:

```tsx
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
        setState({ phase: "error", message: playlistData.error ?? "获取歌单失败" });
        return;
      }

      setState({
        phase: "analyzing",
        playlistInfo: { name: playlistData.playlist, total: playlistData.total },
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
        setState({ phase: "error", message: analyzeData.error ?? "分析失败" });
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

  // error
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <p className="text-red-500 text-lg mb-4">{state.message}</p>
      <button
        onClick={handleReset}
        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
      >
        重试
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`, open `http://localhost:3000`. Verify:
1. Input form renders centered with placeholder text
2. Paste a playlist ID (e.g. `1219486`), click "分析"
3. Loading animation shows with rotating messages
4. Report renders with all 6 card modules
5. "保存长图" downloads a PNG
6. "再测一个" returns to input form

- [ ] **Step 5: Commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat: wire up main page with input/loading/report states"
```

---

## Task 13: End-to-End Verification and Polish

**Files:**
- Possibly modify: any file that needs fixing after E2E testing

- [ ] **Step 1: Full E2E test with real playlist**

Open `http://localhost:3000`, paste `分享歌单: 挨踢实习生喜欢的音乐 https://163cn.tv/7bAknys (@网易云音乐)`, click "分析".

Verify:
- Playlist fetches successfully (249 songs)
- Gemini returns valid structured data
- All 6 report modules render correctly
- Radar chart shows 5 dimensions
- Emotion pie chart has colored segments
- Soul playlist shows 3-5 songs with reasons
- Inner voice text is poetic and in second person
- Tags display as purple pills
- "保存长图" downloads a complete PNG image
- "再测一个" resets to input

- [ ] **Step 2: Test error handling**

- Enter invalid input (e.g. "hello") → should show error message
- Enter non-existent playlist ID (e.g. "99999999999") → should show error
- Enter a playlist with fewer than 50 songs (e.g. ID `2829816517`, 27 songs) → should show error "歌单只有 27 首歌，至少需要 50 首才能进行分析"

- [ ] **Step 3: Fix any issues found, commit**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add -A
git commit -m "fix: polish after E2E testing"
```

- [ ] **Step 4: Build check**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit any build fixes**

```bash
cd /Users/jiapan/Codes/github.com/music-personality
git add -A
git commit -m "fix: resolve build issues"
```
