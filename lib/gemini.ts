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
      "yearSpan": "简短的年代跨度，不超过10个字，如'80年代~2020年代'"
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
  "mbti": {
    "type": "四字母MBTI类型，如INFP",
    "title": "该类型的中文昵称，如'调停者'",
    "description": "基于歌单推断此MBTI的理由，80-150字，引用具体歌曲",
    "evidence": ["证据1: 从歌曲X推断出...", "证据2: ..."] // 2-4条具体证据
  },
  "hobbies": [
    3-6个猜测的爱好，每个: { "name": "爱好名", "confidence": 0-100的置信度, "reason": "从哪些歌曲推断出来的，20-40字" }
    例如：阅读、旅行、烹饪、摄影、打游戏、看动漫、运动、写作等
  ],
  "chatGuide": {
    "dos": ["和TA聊天应该做的事，如'可以聊90年代摇滚的黄金时代'", ...], // 2-4条
    "donts": ["和TA聊天不该做的事，如'不要说民谣都是无病呻吟'", ...], // 2-4条
    "icebreakers": ["破冰话题建议，如'你觉得Beyond最被低估的一首歌是哪首？'", ...] // 2-3条
  },
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
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: "MEDIUM",
        },
      },
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
