import { z } from "zod";

export type HumanProfile = {
  name: string;
  age: string;
  sex: string;
  occupation: string;
  location: string;
  interests: string[]; // ["AI", "カレー"]

  personalityTraits: string;
  motivation: string;
  communicationPreference: string;
  prohibitedExpressions: string;

  lifestyle: string;
  weeklyRoutine: string;
  hobbies: string[];
  dislikes: string[];
};

export const humanProfileDescriptions: string = `
  name: "ユーザーの名前やニックネーム",
  age: "年齢帯（例：20代、30代前半など）",
  sex: "性別（例：男性、女性、その他）",
  occupation: "現在の職業（例：エンジニア、学生、主婦など）",
  location: "住んでいる地域（例：東京、大阪、北海道）",
  interests: ["興味関心（例：AI、旅行、カレー）"],
  personalityTraits: "性格傾向（例：穏やか、好奇心旺盛など）",
  motivation: "行動の動機や価値観（例：人の役に立ちたい）",
  communicationPreference: "好む会話スタイル（例：丁寧、カジュアル）",
  prohibitedExpressions: "避けたい話題や表現（例：怒りを煽る言葉）",
  lifestyle: "生活スタイル（例：在宅勤務中心、早寝早起き）",
  weeklyRoutine: "週ごとの習慣（例：水曜はジム）",
  hobbies: ["趣味（例：散歩、ゲーム）"],
  dislikes: ["嫌いなことや避けたい行動（例：騒がしい場所）"],
`;

export const HumanProfileSchema = z.object({
  name: z.string(),
  age: z.string(),
  sex: z.string(),
  occupation: z.string(),
  location: z.string(),
  interests: z.array(z.string()),

  personalityTraits: z.string(),
  motivation: z.string(),
  communicationPreference: z.string(),
  prohibitedExpressions: z.string(),

  lifestyle: z.string(),
  weeklyRoutine: z.string(),
  hobbies: z.array(z.string()),
  dislikes: z.array(z.string()),
});

export function validateProfile(data: unknown): HumanProfile | null {
  const result = HumanProfileSchema.safeParse(data);
  if (!result.success) {
    console.error("❌ プロファイル形式エラー:", result.error.format());
    return null;
  }
  return result.data; // ✅ 型保証された HumanProfile
}
