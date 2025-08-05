import {
  CAT_ICON_PATH,
  COMMENT_PROMPT,
  DOG_ICON_PATH,
  FREESTYLE_PROMPT,
  MENTOR_PROMPT,
  OWL_ICON_PATH,
  TEACHER_PROMPT,
} from "./contents";

type AssistantMetadata = {
  version: string; // AIのバージョン
  model: string; // AIのモデル名
  prompt: string; // AIのプロンプト
  description?: string; // AIの説明
  exampleMessages?: string[]; // AIの例となるメッセージ
};
export type AssistantData = {
  id: string; // AIの識別子
  name: string; // AIの名前
  isUse: boolean; // AIの使用可否
  icon?: string; // AIのアイコンURL
  aiMeta: AssistantMetadata; // AIのメタデータ
};

export type AssistantDataState = {
  [id: string]: AssistantData;
};

/** AIのデータ */
export const assistantData: Record<string, AssistantData> = {
  comment: {
    id: "comment",
    name: "ノリノリねこ",
    isUse: true,
    icon: CAT_ICON_PATH,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: COMMENT_PROMPT,
      description: "あなたの気分を上げる陽気なAI",
      exampleMessages: [""],
    },
  },
  teacher: {
    id: "teacher",
    name: "データ検索いぬ",
    isUse: true,
    icon: DOG_ICON_PATH,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: TEACHER_PROMPT,
      description: "データ大好き教えたがりのAI",
      exampleMessages: [""],
    },
  },
  freestyle: {
    id: "freestyle",
    name: "FSマスコット",
    isUse: true,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: FREESTYLE_PROMPT,
      description: "フリースタイルの社内情報を熟知したAI",
      exampleMessages: [""],
    },
  },
  mentor: {
    id: "mentor",
    name: "メローフクロウ",
    isUse: true,
    icon: OWL_ICON_PATH,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: MENTOR_PROMPT,
      description: "不思議な雰囲気のメンターAI",
      exampleMessages: [""],
    },
  },
};
