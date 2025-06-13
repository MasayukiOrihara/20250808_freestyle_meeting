"use client";

import { useState } from "react";
import { SubPage } from "./sub-page";
import { Timeline } from "./timeline-page";

export const MainPage: React.FC = () => {
  const [aiMessages, setAiMessages] = useState<string[]>([]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row max-w-7xl mx-auto gap-2">
      <Timeline aiMessages={aiMessages} />
      <SubPage setAiMessages={setAiMessages} />
    </div>
  );
};
