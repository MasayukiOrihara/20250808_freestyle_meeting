import { useState } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { clsx } from "clsx";

const MAX_LENGTH = 140;

export const MessageInput = () => {
  const [text, setText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const { addChatMessage } = useChatMessages();

  const isOverLimit = text.length > MAX_LENGTH;

  const handleEnterkey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = text.trim();

      // 文字数制限チェック
      if (trimmed.length > MAX_LENGTH) {
        console.warn("文字数制限を超えています。送信できません。");
        // 送れなかった場合の演出を考える
        return;
      }

      if (trimmed) {
        addChatMessage({ content: text.trim(), role: "user" });
        setText("");
        // 入力欄を無効化
        setIsDisabled(true);

        // 5秒後に再び有効化
        setTimeout(() => {
          setIsDisabled(false);
        }, 5000);
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

      <div className={isOverLimit ? "text-red-500" : "text-gray-500"}>
        {text.length} / {MAX_LENGTH}
      </div>
    </div>
  );
};
