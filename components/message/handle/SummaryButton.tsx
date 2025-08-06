import { UserCog } from "lucide-react";

import { useChatMessages } from "@/components/provider/ChatMessageProvider";
import { useSessionId } from "@/hooks/useSessionId";
import { ANALYZE_SAVE_PATH, ANARYZE_SUMMARY_PATH } from "@/lib/contents";
import { requestApi } from "@/lib/utils";
import DetailButton from "../messageui/DetailButton";

type SummaryButtonProps = {
  setSummary: (summary: string) => void;
  setShowScreen: (showScreen: boolean) => void;
  isDisabled: boolean;
};

// 要約ボタン
export const SummaryButton = ({
  setSummary,
  setShowScreen,
  isDisabled,
}: SummaryButtonProps) => {
  const { userMessages } = useChatMessages();
  const sessionId = useSessionId();

  const hasMessage = userMessages.length != 0;

  const handleClick = async () => {
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

    setSummary(parsonalSummary);
    setShowScreen(true); // 表示に切り替える
  };

  return (
    <DetailButton
      title="あなたを分析する"
      onClick={handleClick}
      disabled={isDisabled || !hasMessage}
      name="analyze"
      icon={UserCog}
    />
  );
};
