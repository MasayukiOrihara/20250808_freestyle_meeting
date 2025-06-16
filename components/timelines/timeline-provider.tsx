import React, { createContext, useContext, useState, ReactNode } from "react";

import { aiData, AiDataState } from "@/lib/ai-data";
import { AiDataContextType } from "@/lib/types";

const AiDataContext = createContext<AiDataContextType | undefined>(undefined);

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
  const [aiDataState, setAiDataState] = useState<AiDataState>(aiData);

  return (
    <AiDataContext.Provider value={{ aiDataState, setAiDataState }}>
      {children}
    </AiDataContext.Provider>
  );
};

export const useAiData = () => {
  const context = useContext(AiDataContext);
  if (!context) {
    throw new Error("useAiData must be used within AiDataProvider");
  }
  return context;
};
