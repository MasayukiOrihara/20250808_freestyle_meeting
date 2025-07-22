import { BaseMessage } from "@langchain/core/messages";
import { local } from "./contents";
import { ConversationMemory } from "@/lib/types";

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

/** hash data prisma */
// データの取得
export const getGlobalHashData = async () => {
  const response = await fetch(local + "/api/prisma/document-hash-data", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
  });
  return response.json();
};
// DBへデータの更新
export const postGlobalHashData = async (hashData: string[]) => {
  await fetch(local + "/api/prisma/document-hash-data", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
    body: JSON.stringify({ hashData }),
  });
};

/** 会話履歴 prisma */
// データの取得(id, 要約, メッセージ)
export const postConversasionSearch = async (id: string, take: number) => {
  const response = await fetch(
    local + `/api/prisma/conversation/search/${id}`,
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
// DBへデータの更新
export const postConversasionGenerate = async (sessionId: string) => {
  const response = await fetch(local + "/api/prisma/conversation/generate", {
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
// DBへデータの更新
export const postConversasionSave = async (
  conversation: ConversationMemory
) => {
  await fetch(local + `/api/prisma/conversation/save/${conversation.id}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
    body: JSON.stringify({ conversation }),
  });
};
