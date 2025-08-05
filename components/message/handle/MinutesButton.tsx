import { NotebookText } from "lucide-react";

import { useChatMessages } from "@/components/provider/ChatMessageProvider";
import { useSessionId } from "@/hooks/useSessionId";
import { ANARYZE_MINUTES_PATH } from "@/lib/contents";
import { requestApi } from "@/lib/utils";
import DetailButton from "../messageui/DetailButton";

type MinutesButtonProps = {
  setMinutes: (minutes: string) => void;
  setShowScreen: (showScreen: boolean) => void;
  isDisabled: boolean;
};

export const MinutesButton = ({
  setMinutes,
  setShowScreen,
  isDisabled,
}: MinutesButtonProps) => {
  const { userMessages, chatMessages } = useChatMessages();
  const sessionId = useSessionId();

  const hasMessage = userMessages.length != 0;

  const handleClick = async () => {
    //  議事録を作成し取得
    const conversationMinutes = await requestApi("", ANARYZE_MINUTES_PATH, {
      method: "POST",
      body: { chatMessages, sessionId },
    });
    console.log(conversationMinutes);

    setMinutes(conversationMinutes);
    setShowScreen(true); // 表示に切り替える
  };

  return (
    <DetailButton
      title="今回の会話の議事録を作成する"
      onClick={handleClick}
      disabled={isDisabled || !hasMessage}
      name="minutes"
      icon={NotebookText}
    />
  );
};
