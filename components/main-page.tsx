"use client";

import { SubPage } from "./sub-page";
import { Timeline } from "./timeline-page";
import { MessageProvider } from "./messages/message-provider";
import { TimelineProvider } from "./timelines/timeline-provider";
import { MessageAiProvider } from "./messages/message-ai-provider";
import { HumanProfileProvider } from "./human-profile-context";

export const MainPage: React.FC = () => {
  return (
    <HumanProfileProvider>
      <MessageProvider>
        <MessageAiProvider>
          <TimelineProvider>
            <div className="w-full h-full flex flex-col md:flex-row max-w-7xl mx-auto gap-2">
              <SubPage />
              <Timeline />
            </div>
          </TimelineProvider>
        </MessageAiProvider>
      </MessageProvider>
    </HumanProfileProvider>
  );
};
