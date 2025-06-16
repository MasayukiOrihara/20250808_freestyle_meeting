"use client";

import { useState } from "react";
import { SubPage } from "./sub-page";
import { Timeline } from "./timeline-page";
import { AiMessage } from "@/lib/types";
import { aiData } from "@/lib/ai-data";

export const MainPage: React.FC = () => {
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiDataState, setAiDataState] = useState(aiData);

  return (
    <div className="w-full h-full flex flex-col md:flex-row max-w-7xl mx-auto gap-2">
      <SubPage setAiMessages={setAiMessages} aiDataState={aiDataState} />
      <Timeline
        aiMessages={aiMessages}
        aiDataState={aiDataState}
        setAiDataState={setAiDataState}
      />
    </div>
  );
};
