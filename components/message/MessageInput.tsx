import { useState } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { clsx } from "clsx";

export const MessageInput = () => {
  const [text, setText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const { addChatMessage } = useChatMessages();

  const handleEnterkey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        addChatMessage({ content: text.trim(), role: "user" });
        setText("");
        // 入力欄を無効化
        setIsDisabled(true);

        // 3秒後に再び有効化
        setTimeout(() => {
          setIsDisabled(false);
        }, 3000);
      }
    }
  };

  return (
    <div className="w-full flex justify-center">
      {/* テキストエリア */}
      <textarea
        className={clsx(
          "w-2xl p-2 rounded shadow-xl text-zinc-400 placeholder:text-neutral-400 transition-colors duration-300",
          { "bg-zinc-400 placeholder:text-white text-center": isDisabled }
        )}
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleEnterkey}
        disabled={isDisabled}
        placeholder={isDisabled ? " [ 待機中 ... ]" : " [ ENTER で 送信 ... ]"}
      />
    </div>
  );
};
