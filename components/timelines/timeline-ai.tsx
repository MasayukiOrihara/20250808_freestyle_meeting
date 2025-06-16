import { AiMessage } from "@/lib/types";
import { Icon } from "./timeline-icon";
import RelativeTime from "./format-timestamp";
import { Heart, Import } from "lucide-react";
import { aiData } from "@/lib/ai-data";

export const TimelineAi = ({ aiMessages }: { aiMessages: AiMessage[] }) => {
  return (
    <div className="grow-[5] h-full pt-10 border overflow-y-auto">
      {aiMessages
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((msg, idx) => (
          <div key={idx} className="flex items-start border-t px-4 py-2">
            {/** アイコン */}
            <Icon iconSrc={aiData[msg.key]?.icon} />

            <div className="ml-2">
              <div className="text-right text-sm text-zinc-400 mb-1">
                {/** 時間表記 */}
                {<RelativeTime timestamp={msg.timestamp} />}
              </div>
              {/** コンテンツ */}
              <div className="mb-1">{msg.content}</div>
              <ul className="flex">
                <li className="mr-10">
                  <Heart className="w-4 h-4 text-zinc-400" />
                </li>
                <li>
                  <Import className="w-4 h-4 text-zinc-400" />
                </li>
              </ul>
            </div>
          </div>
        ))}
      <div className="border-t text-center text-sm text-zinc-400">
        <p className="m-4">ここがはじめてのメッセージです</p>
      </div>
    </div>
  );
};
