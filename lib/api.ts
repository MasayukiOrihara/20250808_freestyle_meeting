import { BaseMessage } from "@langchain/core/messages";
import { ConversationMemory } from "@/lib/types";
import { HumanProfile } from "@/app/api/analyze/personal";
import { baseUrl } from "./contents";

/* 過去会話履歴API */
export const memoryApi = async (
  messages: BaseMessage[],
  threadId: string,
  turn: number
) => {
  const response = await fetch(baseUrl + "/api/memory", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
    body: JSON.stringify({ messages, threadId, turn }),
  });

  return response;
};

/** メンターグラフ用API */
export const mentorGraphApi = async (messages: BaseMessage[]) => {
  const response = await fetch(
    baseUrl + "/api/persona-ai/mentor/mentor-graph",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
      },
      body: JSON.stringify({ messages }),
    }
  );

  return response;
};

/** === === 🔥 supabase === === */
/* Hash Data */
// 社内文書更新比較用のハッシュデータの取得
export const getSupabaseHashData = async () => {
  const response = await fetch(baseUrl + "/api/supabase/hash", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
  });
  return response.json();
};
// 社内文書更新比較用ハッシュデータの更新
export const postSupabaseHashData = async (hashData: string[]) => {
  await fetch(baseUrl + "/api/supabase/hash", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
    body: JSON.stringify({ hashData }),
  });
};

/* 会話履歴 */
// データの取得(id, 要約, メッセージ)
export const postSupabaseConversasionSearch = async (
  id: string,
  take: number
) => {
  const response = await fetch(
    baseUrl + `/api/supabase/conversation/search/${id}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
      },
      body: JSON.stringify({ take }),
    }
  );
  return response.json();
};
// conversationデータの作成
export const postSupabaseConversasionCreate = async (sessionId: string) => {
  const response = await fetch(baseUrl + "/api/supabase/conversation/create", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
    body: JSON.stringify({ sessionId }),
  });
  return response.json();
};
// messageデータの作成
export const postSupabaseConversasionMessageCreate = async (
  conversation: ConversationMemory
) => {
  await fetch(
    baseUrl + `/api/supabase/conversation/message/create/${conversation.id}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
      },
      body: JSON.stringify({ conversation }),
    }
  );
};

/* パーソナライズ分析 */
export const postSupabasePersonalCreate = async (
  data: HumanProfile,
  threadId: string
) => {
  await fetch(baseUrl + "/api/supabase/personal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, threadId }),
  });
};
