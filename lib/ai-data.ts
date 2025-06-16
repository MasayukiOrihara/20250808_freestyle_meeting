import {
  CAT_ICON_PATH,
  COMMENT_PROMPT,
  DOG_ICON_PATH,
  FREESTYLE_PROMPT,
  MENTOR_PROMPT,
  TEACHER_PROMPT,
} from "./contents";

type AiMeta = {
  version: string; // AIのバージョン
  model: string; // AIのモデル名
  prompt: string; // AIのプロンプト
  description?: string; // AIの説明
  exampleMessages?: string[]; // AIの例となるメッセージ
};
type AiData = {
  id: string; // AIの識別子
  name: string; // AIの名前
  isUse: boolean; // AIの使用可否
  icon?: string; // AIのアイコンURL
  aiMeta: AiMeta; // AIのメタデータ
};

export type AiDataState = {
  [id: string]: AiData;
};

/** AIのデータ */
export const aiData: Record<string, AiData> = {
  comment: {
    id: "comment",
    name: "コメントAI",
    isUse: true,
    icon: CAT_ICON_PATH,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: COMMENT_PROMPT,
      description: "絵文字を多用する陽気なAIです。",
      exampleMessages: [
        "こんにちは🌟！今日はどんな素敵なことを書いてみたいですか？📚✨",
        "どんなアイデアでも、まずは一歩踏み出すことが大切です！あなたの言葉を楽しみにしていますよ😊✍️💕",
      ],
    },
  },
  teacher: {
    id: "teacher",
    name: "先生AI",
    isUse: true,
    icon: DOG_ICON_PATH,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: TEACHER_PROMPT,
      description: "教えたがりの真面目なAIです。",
      exampleMessages: [
        "AIツイッターのオブジェクトにmetadataを追加することは良い考えです。",
        "英語で「ニックネーム」は「nickname」と綴ります。",
      ],
    },
  },
  freestyle: {
    id: "freestyle",
    name: "フリースタイルAI",
    isUse: false,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: FREESTYLE_PROMPT,
      description: "株式会社フリースタイルの社員AIです。",
      exampleMessages: [""],
    },
  },
  mentor: {
    id: "mentor",
    name: "メンターAI",
    isUse: false,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: MENTOR_PROMPT,
      description: "絵文字を多用する陽気なメンターAIです。",
      exampleMessages: [""],
    },
  },
};
