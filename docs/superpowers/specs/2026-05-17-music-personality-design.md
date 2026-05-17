# Music Personality — 网易云音乐歌单性格分析工具

## 概述

一个 Web 应用，用户粘贴网易云音乐歌单链接，系统抓取全部歌曲，调用 Gemini 3.1 Pro 生成结构化的性格/品味分析报告，以可视化卡片形式展示，支持长图导出。

## 架构

单个 Next.js (App Router) 项目，部署在 Vercel。无数据库、无登录、无持久化。

```
浏览器
  ├── 首页：粘贴歌单链接
  ├── POST /api/playlist → 抓取歌单，返回歌曲 JSON
  ├── POST /api/analyze  → 歌曲数据 + prompt → Gemini → 结构化 JSON
  └── 报告页：渲染可视化卡片，支持"保存长图"
```

两个 API Route，一个主页面（输入态 / 加载态 / 报告态）。

## 数据流

### 阶段一：歌单抓取

1. 用户粘贴输入（支持四种格式，见"输入解析"）
2. 前端用正则提取链接或 ID，发送到 `/api/playlist`
3. 后端：
   - 若为 `163cn.tv` 短链，先 follow redirect 获取真实 URL
   - 从 URL 提取歌单 ID
   - 调 `https://music.163.com/api/v6/playlist/detail?id={ID}` 获取全部 trackIds
   - 分批（每批50）POST `https://music.163.com/api/song/detail` 获取歌曲详情
   - 返回 `{ playlist: string, total: number, songs: Array<{ name, artists, album, id }> }`

### 阶段二：性格分析

1. 前端拿到歌曲数据后，调 `/api/analyze`
2. 后端将歌曲列表组装进 prompt，调 Gemini 3.1 Pro
3. 等完整 JSON 返回后，用 zod 校验结构，校验失败则重试一次
4. 返回结构化分析结果

### 阶段三：长图导出

1. 报告渲染完成后出现"保存长图"按钮
2. 点击后用 html2canvas 截取报告区域为 PNG，触发下载

## 输入解析

前端支持从以下格式中提取歌单链接或 ID：

1. 纯链接：`https://163cn.tv/7bAknys`
2. 纯链接：`https://music.163.com/playlist?id=1219486`
3. App 分享文本：`分享歌单: 挨踢实习生喜欢的音乐 https://163cn.tv/7bAknys (@网易云音乐)`
4. 纯数字 ID：`1219486`

用正则提取，用户直接粘贴无需手动清理。

## 报告结构（Gemini 输出 JSON）

Gemini 输出严格约定的 JSON，前端按模块渲染为可视化卡片：

### 1. 总览卡片 (overview)
- `summary`: 一句话灵魂画像
- `stats`: 歌曲数、歌手数、跨越年代

### 2. 音乐 DNA 雷达图 (musicDna)
- 5 个维度及打分（0-100）：怀旧指数、浪漫指数、叛逆指数、文艺指数、治愈指数
- 每个维度配一句话解读
- 前端用 Recharts 雷达图渲染

### 3. 情感光谱 (emotionSpectrum)
- 情绪分布及占比（热烈/温暖/忧伤/孤独/释然等）
- 前端用彩色条形图或环形图渲染

### 4. 灵魂歌单 (soulPlaylist)
- 从歌单中挑出最能代表性格的 3-5 首歌
- 每首配一句为什么选它

### 5. 内心独白 (innerVoice)
- 一段以第二人称写的诗意短文（"你是那种..."）
- 唯一的纯文字模块，作为点睛之笔

### 6. 隐藏标签 (tags)
- 3-5 个趣味标签（如 "#深夜emo专业户" "#90年代灵魂穿越者"）
- 适合截图传播

## Prompt 设计

**系统角色**：你是一位兼具心理学素养和文学才华的音乐品味分析师。

**输入**：歌单名称 + 全部歌曲（歌名、歌手、专辑）。

**输出要求**：按约定的 JSON schema 输出结构化分析，要求：
- 每个维度用歌单中的具体歌曲作为佐证
- 语言有温度，有金句感
- 不要泛泛而谈，必须基于歌单中实际出现的歌曲推断
- 不要罗列歌单，要解读歌单
- 内心独白部分控制在 150-250 字

**JSON schema 通过 prompt 中的示例和 zod 后端校验双重保障。**

## 页面交互

单页面三态切换：

**输入态**：居中的输入框 + 按钮，简洁大气。

**加载态**：两个阶段——
1. "正在获取歌单..." 带进度提示
2. 歌单获取完后显示基本信息，同时进入分析阶段，展示仪式感动画（"正在分析你的音乐基因..."、"正在扫描情感光谱..."、"正在撰写灵魂解读..."等轮播提示）

**报告态**：顶部歌单信息 → 各可视化模块卡片 → 底部"保存长图"和"再测一个"按钮。

## 技术选型

| 层 | 选型 | 说明 |
|---|------|------|
| 框架 | Next.js (App Router) | 全栈 |
| 样式 | Tailwind CSS | 卡片与报告布局 |
| 图表 | Recharts | 雷达图、条形图/环形图 |
| LLM | Gemini 3.1 Pro | Google AI SDK (`@google/genai`) |
| Schema 校验 | zod | 校验 Gemini 返回的 JSON |
| 长图导出 | html2canvas | 前端截图为 PNG |
| 部署 | Vercel | 零配置 |

## 项目结构

```
music-personality/
├── app/
│   ├── layout.tsx              # 全局布局、字体
│   ├── page.tsx                # 主页面（输入态/加载态/报告态）
│   ├── api/
│   │   ├── playlist/route.ts   # 歌单抓取
│   │   └── analyze/route.ts    # Gemini 分析
│   └── globals.css
├── components/
│   ├── InputForm.tsx           # 歌单链接输入框
│   ├── LoadingAnimation.tsx    # 分析中仪式感动画
│   ├── ReportCard.tsx          # 报告容器（长图截图区域）
│   ├── OverviewCard.tsx        # 总览卡片
│   ├── RadarChart.tsx          # 音乐DNA雷达图
│   ├── EmotionSpectrum.tsx     # 情感光谱图
│   ├── SoulPlaylist.tsx        # 灵魂歌单
│   ├── InnerVoice.tsx          # 内心独白
│   └── TagCloud.tsx            # 隐藏标签
├── lib/
│   ├── netease.ts              # 网易云 API 歌单抓取
│   ├── gemini.ts               # Gemini 调用 + prompt
│   └── schema.ts               # zod schema 定义
├── .env.local                  # GEMINI_API_KEY
└── package.json
```

## 超时策略

Vercel Serverless Function 默认超时 10 秒。应对措施：
- 歌单抓取和 Gemini 分析拆成两个独立的 API Route，各自控制超时
- Gemini 分析 Route 设置 `maxDuration`（Vercel Pro 最长 60 秒）
- 歌单抓取按批次并行请求，减少总耗时

## 歌曲数量限制

- **最少 50 首**：歌单不足 50 首歌时，前端提示用户"歌单至少需要 50 首歌才能进行分析"，不调用分析接口
- **最多分析 200 首**：歌单超过 200 首歌时，后端静默取前 200 首发送给 Gemini 分析，前端不提示

## 非目标

- 不做用户登录/注册
- 不做报告持久化/数据库存储
- 不做服务端长图渲染
- 不做多歌单对比分析（可后续扩展）
