import { useState } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { clsx } from "clsx";
import { ChatMessage } from "@/lib/types";
import { useSessionId } from "@/hooks/useSessionId";
import { requestApi } from "@/lib/utils";
import { NotebookText, Send, UserCog } from "lucide-react";

const MAX_LENGTH = 140;
const ANALYZE_SAVE_PATH = "/api/analyze/save";
const ANARYZE_SUMMARY_PATH = "/api/analyze/summary";
const ANARYZE_MINUTES_PATH = "/api/analyze/minutes";

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

/**
 * 入力UI
 * @returns
 */
export const MessageInput = () => {
  const [text, setText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [showScreen, setShowScreen] = useState(false);
  const { chatMessages, userMessages, addChatMessage } = useChatMessages();
  const sessionId = useSessionId();

  const isOverLimit = text.length > MAX_LENGTH;

  // 提出時の反応
  const submitMessage = () => {
    const trimmed = text.trim();

    if (trimmed.length > MAX_LENGTH) {
      console.warn("文字数制限を超えています。送信できません。");
      return;
    }

    if (trimmed) {
      addChatMessage({ content: trimmed, role: "user" });
      setText("");
      setIsDisabled(true);

      setTimeout(() => {
        setIsDisabled(false);
      }, 5000);
    }
  };

  // Enter キーでの呼び出し
  const handleEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  // 要約ボタン
  const handleSummaryButton = async () => {
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
    }
    setShowScreen(true); // 表示に切り替える
  };

  // 議事録ボタン
  const handleMinutesButton = async () => {
    if (userMessages.length != 0) {
      //  議事録を作成し取得
      const conversationMinutes = await requestApi("", ANARYZE_MINUTES_PATH, {
        method: "POST",
        body: { chatMessages, sessionId },
      });
    }
    setShowScreen(true); // 表示に切り替える
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white mb-10 flex flex-col justify-center items-center z-10">
      <div className="relative px-2 py-1 shadow-xl rounded-xl">
        {/* テキストエリア */}
        <textarea
          className="resize-none focus:outline-none w-2xl p-2 text-zinc-400 placeholder:text-neutral-400 transition-colors duration-300"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleEnterKey}
          disabled={isDisabled}
          placeholder={isDisabled ? "" : " [ ENTER で 送信 ... ]"}
        />

        <div className="flex justify-between">
          {/* まとめボタン  */}
          <div>
            {/* 議事録 */}
            <button
              title="今回の会話の議事録を作成する"
              onClick={handleMinutesButton}
              disabled={isDisabled}
              className="cursor-pointer px-3 py-2 border border-white hover:border-gray-400 active:bg-gray-100 text-gray-700 rounded transition"
            >
              <NotebookText className="w-4 h-4 text-zinc-600" />
            </button>
            {/* パーソナライズ */}
            <button
              title="パーソナライズを作成する"
              onClick={handleSummaryButton}
              disabled={isDisabled}
              className="cursor-pointer px-3 py-2 border border-white hover:border-gray-400 active:bg-gray-100 text-gray-700 rounded transition"
            >
              <UserCog className="w-4 h-4 text-zinc-600" />
            </button>
          </div>

          <div className="flex items-center">
            {/* 文字カウンター */}
            <div className="flex-1 w-20 ml-2 h-5 bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-r transition-all duration-200 ${
                  isOverLimit ? "bg-red-300" : "bg-green-300"
                }`}
                style={{ width: `${(text.length / 140) * 100}%` }}
              />
            </div>

            {/* submit ボタン */}
            <div className="ml-2 mr-1">
              <button
                type="submit"
                onClick={submitMessage}
                disabled={isDisabled}
                className="cursor-pointer px-2 py-2 bg-zinc-700 active:bg-gray-400 rounded transition"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {showScreen && (
            <div
              style={{ marginTop: 20, padding: 20, backgroundColor: "#f0f0f0" }}
            >
              <h2>これは表示された画面です</h2>
              <p>ボタンを押したので表示されました。</p>
            </div>
          )}
        </div>

        {/* 全体の非表示 */}
        {isDisabled && (
          <div className="absolute inset-0 bg-zinc-400 opacity-80 shadow-xl rounded-xl transition">
            <div className="flex justify-center items-center">
              <span className="mt-4 text-white text-xl text-center">
                [ 待機中 ... ]
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
