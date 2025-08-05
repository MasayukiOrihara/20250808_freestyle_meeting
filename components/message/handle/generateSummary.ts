import { useChatMessages } from "@/components/provider/ChatMessageProvider";
import { useSessionId } from "@/hooks/useSessionId";
import { ANALYZE_SAVE_PATH, ANARYZE_SUMMARY_PATH } from "@/lib/contents";
import { requestApi } from "@/lib/utils";

// 要約ボタン
export const generateSummary = async () => {
  const { userMessages } = useChatMessages();
  const sessionId = useSessionId();

  if (userMessages.length != 0) return null;
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

  return parsonalSummary;
};
