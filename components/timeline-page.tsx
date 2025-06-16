import { AiMessage } from "@/lib/types";
import { TimelineAi } from "./timelines/timeline-ai";
import { TimelineMenu } from "./timelines/timeline-menu";
import { TimelineSidebar } from "./timelines/timeline-sidebar";
import { Dispatch, SetStateAction } from "react";
import { AiDataState } from "@/lib/ai-data";

type TimelineProps = {
  aiMessages: AiMessage[];
  aiDataState: AiDataState;
  setAiDataState: Dispatch<SetStateAction<AiDataState>>;
};

export const Timeline: React.FC<TimelineProps> = ({
  aiMessages,
  aiDataState,
  setAiDataState,
}) => {
  return (
    <div className="flex w-full h-full px-4 py-2 bg-white dark:bg-zinc-900">
      <TimelineSidebar
        aiDataState={aiDataState}
        setAiDataState={setAiDataState}
      />
      <TimelineAi aiMessages={aiMessages} aiDataState={aiDataState} />
      <TimelineMenu />
    </div>
  );
};
