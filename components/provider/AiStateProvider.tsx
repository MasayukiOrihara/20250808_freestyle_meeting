import React, { createContext, ReactNode, useContext, useState } from "react";

type AiStateContextType = {
  aiState: string;
  setAiState: (aiState: string) => void;
};

const AiStateContext = createContext<AiStateContextType | undefined>(undefined);

/**
 * プロバイダー
 * @param param0
 * @returns
 */
export const AiStateProvider = ({ children }: { children: ReactNode }) => {
  const [aiState, setAiState] = useState<string>("");

  return (
    <AiStateContext.Provider value={{ aiState, setAiState }}>
      {children}
    </AiStateContext.Provider>
  );
};

export const useAiState = () => {
  const context = useContext(AiStateContext);
  if (!context)
    throw new Error("AiStateContext must be used within AiStateProvider");
  return context;
};
