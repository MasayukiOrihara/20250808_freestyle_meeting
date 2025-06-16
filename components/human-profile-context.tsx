import React, { createContext, useContext, useState } from "react";

import { emptyHumanProfile, HumanProfile } from "@/lib/personal";

const humanProfile: HumanProfile = JSON.parse(
  JSON.stringify(emptyHumanProfile)
);

const HumanProfileContext = createContext<{
  profile: HumanProfile;
  setProfile: React.Dispatch<React.SetStateAction<HumanProfile>>;
} | null>(null);

export const HumanProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<HumanProfile>(humanProfile);
  return (
    <HumanProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </HumanProfileContext.Provider>
  );
};

export const useHumanProfile = () => {
  const context = useContext(HumanProfileContext);
  if (!context)
    throw new Error(
      "useHumanProfile must be used within a HumanProfileProvider"
    );
  return context;
};
