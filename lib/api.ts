import { BaseMessage } from "@langchain/core/messages";

/* 過去会話履歴API */
export const memoryApi = async (url: string, messages: BaseMessage[]) => {
  const response = await fetch(url + "/api/memory", {
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

/** メンターグラフ用API */
export const mentorGraphApi = async (url: string, messages: BaseMessage[]) => {
  const response = await fetch(url + "/api/mentor-graph", {
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
