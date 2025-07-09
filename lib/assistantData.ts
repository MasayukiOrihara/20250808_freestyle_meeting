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
    name: "コメントAI",
    isUse: true,
    icon: CAT_ICON_PATH,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: COMMENT_PROMPT,
      description: "絵文字を多用する陽気なAIです。",
      exampleMessages: [""],
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
      exampleMessages: [""],
    },
  },
  freestyle: {
    id: "freestyle",
    name: "フリースタイルAI",
    isUse: true,
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
    isUse: true,
    icon: OWL_ICON_PATH,
    aiMeta: {
      version: "1.0",
      model: "OpenAi",
      prompt: MENTOR_PROMPT,
      description: "ちょっと見栄っ張りなメンターAIです。",
      exampleMessages: [""],
    },
  },
};
