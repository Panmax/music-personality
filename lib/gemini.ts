import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { AnalysisResultSchema, type AnalysisResult, type Song } from "./schema";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const RESPONSE_JSON_SCHEMA = {
  type: "object",
  required: ["overview", "musicDna", "emotionSpectrum", "soulPlaylist", "mbti", "hobbies", "chatGuide", "innerVoice", "tags"],
  properties: {
    overview: {
      type: "object",
      required: ["summary", "stats"],
      properties: {
        summary: { type: "string", description: "一句话灵魂画像，有文学感，20-40字" },
        stats: {
          type: "object",
          required: ["songCount", "artistCount", "yearSpan"],
          properties: {
            songCount: { type: "integer" },
            artistCount: { type: "integer" },
            yearSpan: { type: "string", description: "严格使用'XX年代~XX年代'格式，如'80年代~2020年代'，不超过12个字，禁止加任何描述词" },
          },
        },
      },
    },
    musicDna: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        required: ["name", "score", "description"],
        properties: {
          name: { type: "string" },
          score: { type: "integer", minimum: 0, maximum: 100 },
          description: { type: "string" },
        },
      },
    },
    emotionSpectrum: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        required: ["name", "percentage", "color"],
        properties: {
          name: { type: "string" },
          percentage: { type: "integer", minimum: 0, maximum: 100 },
          color: { type: "string", description: "十六进制颜色" },
        },
      },
    },
    soulPlaylist: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        required: ["name", "artist", "reason"],
        properties: {
          name: { type: "string" },
          artist: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
    mbti: {
      type: "object",
      required: ["type", "title", "description", "evidence"],
      properties: {
        type: { type: "string", description: "四字母MBTI类型，如INFP" },
        title: { type: "string", description: "该类型的中文昵称" },
        description: { type: "string", description: "基于歌单推断此MBTI的理由，80-150字" },
        evidence: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: { type: "string" },
        },
      },
    },
    hobbies: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "object",
        required: ["name", "confidence", "reason"],
        properties: {
          name: { type: "string" },
          confidence: { type: "integer", minimum: 0, maximum: 100 },
          reason: { type: "string" },
        },
      },
    },
    chatGuide: {
      type: "object",
      required: ["dos", "donts", "icebreakers"],
      properties: {
        dos: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
        donts: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
        icebreakers: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" } },
      },
    },
    innerVoice: { type: "string", description: "以第二人称'你'写的诗意内心独白，150-250字" },
    tags: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" },
    },
  },
} as const;

function buildPrompt(playlistName: string, songs: Song[]): string {
  const songList = songs
    .map((s, i) => `${i + 1}. ${s.name} - ${s.artists.join(", ")} (专辑: ${s.album})`)
    .join("\n");

  return `你是一位兼具心理学素养和文学才华的音乐品味分析师。请根据以下网易云音乐歌单，分析这位听众的性格、品味与内心世界。

歌单名：${playlistName}
歌曲列表（共${songs.length}首）：
${songList}

请按照指定的 JSON schema 输出分析结果。

要求：
- musicDna 的5个维度必须是：怀旧指数、浪漫指数、叛逆指数、文艺指数、治愈指数
- emotionSpectrum 的所有 percentage 加起来必须等于100
- yearSpan 必须严格使用"XX年代~XX年代"格式（如"80年代~2020年代"），不要加任何修饰词
- 必须基于歌单中实际出现的歌曲来推断，不要泛泛而谈
- 不要罗列歌单，要解读歌单
- 每个维度的 description 和 soulPlaylist 的 reason 必须引用具体歌曲名
- mbti 的 description 和 evidence 必须引用具体歌曲
- hobbies 的 reason 必须引用具体歌曲
- chatGuide 的建议要基于歌单反映出的性格特征
- innerVoice 要基于歌单中的具体歌曲来描绘内心世界
- tags 带#号，如"#深夜emo专业户"
- 语言有温度，有金句感，适合截图分享`;
}

export async function analyzePlaylist(
  playlistName: string,
  songs: Song[]
): Promise<AnalysisResult> {
  const prompt = buildPrompt(playlistName, songs);

  const doRequest = async (): Promise<AnalysisResult> => {
    const response = await genai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MEDIUM,
        },
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_JSON_SCHEMA,
      },
    });

    // Extract non-thinking text from response parts directly
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const outputText = parts
      .filter((part: { thought?: boolean; text?: string }) => !part.thought && typeof part.text === "string")
      .map((part: { text?: string }) => part.text)
      .join("");

    let parsed: unknown;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      // Fallback: extract JSON substring if thinking text leaked into output
      const start = outputText.indexOf("{");
      const end = outputText.lastIndexOf("}");
      if (start === -1 || end <= start) throw new Error("No JSON found in response");
      parsed = JSON.parse(outputText.slice(start, end + 1));
    }
    return AnalysisResultSchema.parse(parsed);
  };

  try {
    return await doRequest();
  } catch {
    return await doRequest();
  }
}
