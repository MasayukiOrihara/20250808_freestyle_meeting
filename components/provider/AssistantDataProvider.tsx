import React, { createContext, useContext } from "react";

import { AssistantData, assistantData } from "@/lib/assistantData";

const AssistantDataContext =
  createContext<Record<string, AssistantData>>(assistantData);

export const useAssistantData = () => useContext(AssistantDataContext);

/**
 * assistant data プロバイダー
 * @param param0
 * @returns
 */
export const AssistantDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <AssistantDataContext.Provider value={assistantData}>
      {children}
    </AssistantDataContext.Provider>
  );
};
