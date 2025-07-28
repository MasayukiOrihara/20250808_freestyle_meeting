import { BaseMessage } from "@langchain/core/messages";
import { ConversationMemory } from "@/lib/types";
import { HumanProfile } from "@/app/api/analyze/personal";

/* 過去会話履歴API */
export const memoryApi = async (
  url: string,
  messages: BaseMessage[],
  threadId: string,
  turn: number
) => {
  const response = await fetch(url + "/api/memory", {
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
export const mentorGraphApi = async (url: string, messages: BaseMessage[]) => {
  const response = await fetch(url + "/api/persona-ai/mentor/mentor-graph", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
    body: JSON.stringify({ messages }),
  });

  return response;
};

/** === === 💽 prisma === === */
/* Hash Data */
// 社内文書更新比較用のハッシュデータの取得
export const getGlobalHashData = async (url: string) => {
  const response = await fetch(url + "/api/prisma/hash", {
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
export const postGlobalHashData = async (url: string, hashData: string[]) => {
  await fetch(url + "/api/prisma/hash", {
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
export const postPrismaConversasionSearch = async (
  url: string,
  id: string,
  take: number
) => {
  const response = await fetch(url + `/api/prisma/conversation/search/${id}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
    body: JSON.stringify({ take }),
  });
  return response.json();
};
// conversationデータの作成
export const postPrismaConversasionCreate = async (
  url: string,
  sessionId: string
) => {
  const response = await fetch(url + "/api/prisma/conversation/create", {
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
export const postPrismaConversasionMessageCreate = async (
  url: string,
  conversation: ConversationMemory
) => {
  await fetch(
    url + `/api/prisma/conversation/message/create/${conversation.id}`,
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
export const postPrismaPersonalCreate = async (
  url: string,
  data: HumanProfile,
  threadId: string
) => {
  await fetch(url + "/api/prisma/personal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, threadId }),
  });
};

/** === === 🔥 supabase === === */
/* Hash Data */
// 社内文書更新比較用のハッシュデータの取得
export const getSupabaseHashData = async (url: string) => {
  const response = await fetch(url + "/api/supabase/hash", {
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
export const postSupabaseHashData = async (url: string, hashData: string[]) => {
  await fetch(url + "/api/supabase/hash", {
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
  url: string,
  id: string,
  take: number
) => {
  const response = await fetch(
    url + `/api/supabase/conversation/search/${id}`,
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
export const postSupabaseConversasionCreate = async (
  url: string,
  sessionId: string
) => {
  const response = await fetch(url + "/api/supabase/conversation/create", {
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
  url: string,
  conversation: ConversationMemory
) => {
  await fetch(
    url + `/api/supabase/conversation/message/create/${conversation.id}`,
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
  url: string,
  data: HumanProfile,
  threadId: string
) => {
  await fetch(url + "/api/supabase/personal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, threadId }),
  });
};
