"use client";

import { AppProviders } from "./AppProviders";
import { Contents } from "./Contents";

export const MainPage: React.FC = () => {
  return (
    <div className="w-full h-full [background-image:linear-gradient(90deg,rgba(219,234,254,0.4)_1px,transparent_1px),linear-gradient(0deg,rgba(219,234,254,0.4)_1px,transparent_1px)] [background-size:32px_32px] [background-color:white]">
      {/* 背景 */}
      <div className="flex flex-col max-w-[1440px] h-full m-auto">
        <AppProviders>
          <Contents />
        </AppProviders>
      </div>
    </div>
  );
};
