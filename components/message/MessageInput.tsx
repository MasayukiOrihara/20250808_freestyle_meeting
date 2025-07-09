import { useState } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";

export const MessageInput = () => {
  const [text, setText] = useState("");
  const { addChatMessage } = useChatMessages();

  const handleEnterkey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        addChatMessage({ content: text.trim(), role: "user" });
        setText("");
      }
    }
  };

  return (
    <div className="w-full flex justify-center">
      {/* テキストエリア */}
      <textarea
        className="w-2xl p-2 rounded shadow-xl text-zinc-400 placeholder:text-neutral-400"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleEnterkey}
        placeholder="[ENTER で 送信...]"
      />
    </div>
  );
};
