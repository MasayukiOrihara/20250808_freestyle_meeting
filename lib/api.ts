import { BaseMessage } from "@langchain/core/messages";
import { local } from "./contents";

/* 過去会話履歴API */
export const memoryApi = async (
  url: string,
  messages: BaseMessage[],
  threadId: string
) => {
  const response = await fetch(url + "/api/memory", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
    body: JSON.stringify({ messages, threadId }),
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
// データの取得
export const getConversasionSearch = async (id: string) => {
  const response = await fetch(
    local + `/api/prisma/conversation/search/${id}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
      },
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
export const postConversasionMessages = async (
  conversationId: string,
  role: string,
  content: string
) => {
  await fetch(local + "/api/prisma/conversation/message", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
    },
    body: JSON.stringify({ conversationId, role, content }),
  });
};

/** messages prisma */
// データの取得
export const getMessagSearch = async (id: string, take: number) => {
  const response = await fetch(
    local + `/api/prisma/conversation/message/search/${id}`,
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
