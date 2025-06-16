import { TimelineAi } from "./timelines/timeline-ai";
import { TimelineMenu } from "./timelines/timeline-menu";
import { TimelineSidebar } from "./timelines/timeline-sidebar";

export const Timeline: React.FC = () => {
  return (
    <div className="flex w-full h-full px-4 py-2 bg-white dark:bg-zinc-900">
      <div className="basis-1/8">
        <TimelineSidebar />
      </div>
      <div className="basis-5/8">
        <TimelineAi />
      </div>
      <div className="basis-1/4">
        <TimelineMenu />
      </div>
    </div>
  );
};
