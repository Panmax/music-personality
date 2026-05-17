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
