import { AiMessage } from "@/lib/types";
import { TimelineAi } from "./timelines/timeline-ai";
import { TimelineMenu } from "./timelines/timeline-menu";
import { TimelineSidebar } from "./timelines/timeline-sidebar";

export const Timeline: React.FC<{ aiMessages: AiMessage[] }> = ({
  aiMessages,
}: {
  aiMessages: AiMessage[];
}) => (
  <div className="flex w-full h-full px-4 py-2 bg-white dark:bg-zinc-900">
    <TimelineSidebar />
    <TimelineAi aiMessages={aiMessages} />
    <TimelineMenu />
  </div>
);
