"use client";

import { ResponseContainer } from "./response/ResponseContainer";
import { MessageInput } from "./message/MessageInput";
import { AppProviders } from "./AppProviders";

export const MainPage: React.FC = () => {
  return (
    <div className="w-full h-full">
      {/* ぼかし背景 */}
      {/* <div className="absolute inset-0 bg-[url('/background/gptlike_blue-and-yello.png')] bg-center bg-cover filter blur-sm opacity-60" /> */}
      <div className="flex flex-col max-w-[1440px] h-full m-auto overflow-hidden">
        <AppProviders>
          <ResponseContainer />
          <MessageInput />
        </AppProviders>
      </div>
    </div>
  );
};
