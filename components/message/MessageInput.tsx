import { useState } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { clsx } from "clsx";
import { ChatMessage } from "@/lib/types";
import { useSessionId } from "@/hooks/useSessionId";
import { requestApi } from "@/lib/utils";

const MAX_LENGTH = 140;
const ANALYZE_SAVE_PATH = "/api/analyze/save";
const ANARYZE_SUMMARY_PATH = "/api/analyze/summary";

async function fetchAnalize(
  url: string,
  userMessages: ChatMessage[],
  sessionId: string | null = null
) {
  const res = await fetch("/api/analyze/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessages, sessionId }),
  });
  const data = await res.json();
  return data;
}

export const MessageInput = () => {
  const [text, setText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [showScreen, setShowScreen] = useState(false);
  const { userMessages, addChatMessage } = useChatMessages();
  const sessionId = useSessionId();

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

  const handleButton = async () => {
    if (userMessages.length != 0) {
      // 1. プロファイル情報を作成して DB に保存
      await requestApi("", ANALYZE_SAVE_PATH, {
        method: "POST",
        body: { userMessages, sessionId },
      });

      // 2. 要約を作成し取得
      const parsonalSummary = await requestApi("", ANARYZE_SUMMARY_PATH, {
        method: "POST",
        body: { sessionId },
      });
      console.log(parsonalSummary);
    }
    setShowScreen(true); // 表示に切り替える
  };

  return (
    <div className="w-full flex flex-col justify-center">
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

      {/* 文字カウンター */}
      <div className={isOverLimit ? "text-red-500" : "text-gray-500"}>
        {text.length} / {MAX_LENGTH}
      </div>

      {/* まとめボタン  */}
      <div>
        <button onClick={handleButton} className="cursor-pointer">
          ボタン
        </button>
      </div>

      {showScreen && (
        <div style={{ marginTop: 20, padding: 20, backgroundColor: "#f0f0f0" }}>
          <h2>これは表示された画面です</h2>
          <p>ボタンを押したので表示されました。</p>
        </div>
      )}
    </div>
  );
};
