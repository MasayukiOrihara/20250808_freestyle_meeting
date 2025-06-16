import { AiMessage } from "@/lib/types";
import { Icon } from "./timeline-icon";
import RelativeTime from "./format-timestamp";
import { Heart, Import } from "lucide-react";
import { AiDataState } from "@/lib/ai-data";

type TimelineAiProps = {
  aiMessages: AiMessage[];
  aiDataState: AiDataState;
};

export const TimelineAi = ({ aiMessages, aiDataState }: TimelineAiProps) => {
  return (
    <div className="grow-[5] h-full pt-10 border overflow-y-auto">
      {aiMessages
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((msg, idx) => (
          <div key={idx} className="flex items-start border-t px-4 py-2">
            {/** アイコン */}
            <Icon iconSrc={aiDataState[msg.key]?.icon} />

            <div className="ml-2">
              <div className="text-right text-sm text-zinc-400 mb-1">
                {/** 時間表記 */}
                {<RelativeTime timestamp={msg.timestamp} />}
              </div>
              {/** コンテンツ */}
              <div className="mb-1">{msg.content}</div>
              <ul className="flex mt-2">
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
