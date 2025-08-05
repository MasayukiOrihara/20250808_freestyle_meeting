import { useChatMessages } from "@/components/provider/ChatMessageProvider";
import { useSessionId } from "@/hooks/useSessionId";
import { ANARYZE_MINUTES_PATH } from "@/lib/contents";
import { requestApi } from "@/lib/utils";

export const generateMinutes = async () => {
  const { userMessages, chatMessages } = useChatMessages();
  const sessionId = useSessionId();

  if (userMessages.length != 0) return null;
  //  議事録を作成し取得
  const conversationMinutes = await requestApi("", ANARYZE_MINUTES_PATH, {
    method: "POST",
    body: { chatMessages, sessionId },
  });
  console.log(conversationMinutes);

  return conversationMinutes;
};
