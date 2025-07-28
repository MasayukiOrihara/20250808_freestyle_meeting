import { useEffect } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { ChatMessage } from "@/lib/types";
import { useSessionId } from "@/hooks/useSessionId";

async function fetchAnalize(
  userMessages: ChatMessage[],
  sessionId: string | null = null
) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessages, sessionId }),
  });
  const data = await res.json();
  return data;
}

export const MetaAssistant = () => {
  const { userMessages } = useChatMessages();
  const sessionId = useSessionId();

  // 新しいメッセージが追加されたときに逐一要約を呼ぶ
  useEffect(() => {
    if (userMessages.length === 0) return;

    // 試しにコンテキストを個々で読んでみる
    // console.log("得られたコンテキスト");
    // console.log(fetchContext());

    console.log(fetchAnalize(userMessages, sessionId));
  }, [userMessages, sessionId]);

  return null;
};
