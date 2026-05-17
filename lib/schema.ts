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

export const MbtiSchema = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  evidence: z.array(z.string()).min(2).max(4),
});

export const HobbySchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(100),
  reason: z.string(),
});

export const ChatGuideSchema = z.object({
  dos: z.array(z.string()).min(2).max(4),
  donts: z.array(z.string()).min(2).max(4),
  icebreakers: z.array(z.string()).min(2).max(3),
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
  mbti: MbtiSchema,
  hobbies: z.array(HobbySchema).min(3).max(6),
  chatGuide: ChatGuideSchema,
  innerVoice: z.string(),
  tags: z.array(z.string()).min(3).max(5),
});

export type Song = z.infer<typeof SongSchema>;
export type PlaylistResponse = z.infer<typeof PlaylistResponseSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type DnaDimension = z.infer<typeof DnaDimensionSchema>;
export type Emotion = z.infer<typeof EmotionSchema>;
export type SoulSong = z.infer<typeof SoulSongSchema>;
export type Mbti = z.infer<typeof MbtiSchema>;
export type Hobby = z.infer<typeof HobbySchema>;
export type ChatGuide = z.infer<typeof ChatGuideSchema>;
