import { useState } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { NotebookText, Send, UserCog } from "lucide-react";
import BottomPopup from "./messageui/BottomPopup";
import DetailButton from "./messageui/DetailButton";
import { generateSummary } from "./handle/generateSummary";
import { generateMinutes } from "./handle/generateMinutes";
import { useAiState } from "../provider/AiStateProvider";

const MAX_LENGTH = 140;

/**
 * 入力UI
 * @returns
 */
export const MessageInput = () => {
  const [text, setText] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [showScreen, setShowScreen] = useState(false); // 画面の表示
  const [summary, setSummary] = useState(""); // 要約保持
  const [minutes, setMinutes] = useState(""); // 議事録保持
  const { addChatMessage } = useChatMessages();
  const { aiState } = useAiState();

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
    const parsonalSummary = await generateSummary();
    if (parsonalSummary) return;

    setSummary(parsonalSummary);
    setShowScreen(true); // 表示に切り替える
  };

  // 議事録ボタン
  const handleMinutesButton = async () => {
    const conversationMinutes = await generateMinutes();
    if (conversationMinutes) return;

    setMinutes(conversationMinutes);
    setShowScreen(true); // 表示に切り替える
  };

  return (
    <div className="fixed bottom-0 left-0 w-full mb-2 flex flex-col justify-center items-center z-10">
      <div className="relative px-2 py-1 bg-white shadow-xl rounded-xl">
        {/* テキストエリア */}
        <textarea
          className="resize-none focus:outline-none md:w-2xl w-md p-2 text-zinc-400 placeholder:text-neutral-400 transition-colors duration-300"
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
            <DetailButton
              title="今回の会話の議事録を作成する"
              onClick={handleMinutesButton}
              disabled={isDisabled}
              name="minutes"
              icon={NotebookText}
            />
            {/* アナライズ */}
            <DetailButton
              title="あなたを分析する"
              onClick={handleSummaryButton}
              disabled={isDisabled}
              name="analyze"
              icon={UserCog}
            />
          </div>

          <div className="flex items-center">
            {aiState === "" && <p className="text-xs">ステータス: unknown</p>}
            {aiState === "ready" && (
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
            isOpen={showScreen}
            onClose={() => setShowScreen(false)}
            title="議事録"
            text={minutes}
          />

          {/* アナライズ */}
          <BottomPopup
            isOpen={showScreen}
            onClose={() => setShowScreen(false)}
            title="会話から分かるあなたについて"
            text={summary}
          />
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
      <div className="mt-0.5 text-xs text-zinc-400">
        得られたデータは研究目的で利用されます。個人情報は記入しないでください。
      </div>
    </div>
  );
};
