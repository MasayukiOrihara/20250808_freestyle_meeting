import { useEffect } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";

export const MetaAssistant = () => {
  const { userMessages } = useChatMessages();

  // 新しいメッセージが追加されたときに逐一要約を呼ぶ
  useEffect(() => {
    if (userMessages.length === 0) return;

    async function fetchAnalize() {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessages }),
      });
      const data = await res.json();
      return data;
    }

    console.log(fetchAnalize());
  }, [userMessages]);

  return null;
};
