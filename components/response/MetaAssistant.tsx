import { useEffect } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { ChatMessage } from "@/lib/types";

async function fetchAnalize(userMessages: ChatMessage[]) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessages }),
  });
  const data = await res.json();
  return data;
}

async function fetchContext() {
  const res = await fetch("/api/context", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data;
}

export const MetaAssistant = () => {
  const { userMessages } = useChatMessages();

  // 新しいメッセージが追加されたときに逐一要約を呼ぶ
  useEffect(() => {
    if (userMessages.length === 0) return;

    // 試しにコンテキストを個々で読んでみる
    console.log("得られたコンテキスト");
    console.log(fetchContext());

    console.log(fetchAnalize(userMessages));
  }, [userMessages]);

  return null;
};
