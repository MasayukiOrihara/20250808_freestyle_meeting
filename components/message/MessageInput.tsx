import { useRef, useState } from "react";
import { Send } from "lucide-react";

import { useChatMessages } from "../provider/ChatMessageProvider";
import BottomPopup from "./messageui/BottomPopup";
import { useAiState } from "../provider/AiStateProvider";
import { SummaryButton } from "./handle/SummaryButton";
import { MinutesButton } from "./handle/MinutesButton";

const MAX_LENGTH = 140;

/**
 * 入力UI
 * @returns
 */
export const MessageInput = () => {
  const [text, setText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [showSummaryScreen, setShowSummaryScreen] = useState(false); // 画面の表示
  const [showMinutesScreen, setShowMinutesScreen] = useState(false); // 画面の表示
  const [summary, setSummary] = useState(""); // 要約保持
  const [minutes, setMinutes] = useState(""); // 議事録保持
  const { addChatMessage } = useChatMessages();
  const { aiState, setAiState } = useAiState();

  const isOverLimit = text.length > MAX_LENGTH;
  const isFirstSubmitRef = useRef(false); // 最初の提出

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
      }, 3000);
    }
  };

  // Enter キーでの呼び出し
  const handleEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      isFirstSubmitRef.current = true;
      submitMessage();
    }
  };

  // ポップアップウィンドウを閉じた時の処理
  const handleClosePoupup = () => {
    // loading
    setAiState("ready");
    setShowMinutesScreen(false);
    setShowSummaryScreen(false);
  };

  return (
    <div className="w-full  mb-2 justify-center items-center mt-2 z-10">
      <div className="relative px-2 py-1 mx-4 bg-white border shadow-xl rounded-xl">
        {/* テキストエリア */}
        <textarea
          className="resize-none focus:outline-none w-full p-2 text-zinc-400 placeholder:text-neutral-400 transition-colors duration-300"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleEnterKey}
          disabled={isDisabled}
          placeholder={
            isDisabled
              ? ""
              : isFirstSubmitRef.current
              ? " [ ENTER で 送信 ... ]"
              : "わたしの 名前は 〇〇 です... [ ENTER で 送信 ... ]"
          }
        />

        <div className="flex justify-between">
          {/* まとめボタン  */}
          <div>
            {/* 議事録 */}
            <MinutesButton
              setMinutes={setMinutes}
              setShowScreen={setShowMinutesScreen}
              isDisabled={isDisabled}
            />

            {/* アナライズ */}
            <SummaryButton
              setSummary={setSummary}
              setShowScreen={setShowSummaryScreen}
              isDisabled={isDisabled}
            />
          </div>

          <div className="flex items-center">
            {aiState === "" && <p className="text-xs">ステータス: unknown</p>}
            {(aiState === "ready" || aiState === "start") && (
              <p className="text-xs">ステータス: 🟢 入力できます</p>
            )}
            {aiState === "loading" && (
              <p className="text-xs">ステータス: ⌛ 読み込み中...</p>
            )}
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

          {/* ポップアップ本体 */}
          {/* 議事録 */}
          <BottomPopup
            isOpen={showMinutesScreen}
            onClose={handleClosePoupup}
            title="議事録"
            text={minutes}
          />

          {/* アナライズ */}
          <BottomPopup
            isOpen={showSummaryScreen}
            onClose={handleClosePoupup}
            title="会話から分かるあなたについて"
            text={summary}
          />
        </div>

        {/* 全体の非表示 */}
        {(isDisabled || aiState === "loading") && (
          <div className="absolute inset-0 bg-zinc-400 opacity-80 shadow-xl rounded-xl transition">
            <div className="flex justify-center items-center">
              <span className="mt-4 text-white text-xl text-center">
                [ 待機中 ... ]
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-0.5 text-center text-xs text-zinc-400">
        得られたデータは研究目的で利用されます。個人情報は記入しないでください。
      </div>
    </div>
  );
};
