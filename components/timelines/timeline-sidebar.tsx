import { aiData } from "@/lib/ai-data";
import { Icon } from "./timeline-icon";
import { useState } from "react";

export const TimelineSidebar = () => {
  const [aiDataState, setAiDataState] = useState(aiData);
  const aiList = Object.values(aiDataState);

  // アイコンをクリックしたときの処理
  const handleClick = (id: string) => {
    console.log("clicked:", id);
    setAiDataState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isUse: !prev[id].isUse,
      },
    }));
  };

  return (
    <div className="grow-[2] h-full px-4 py-2">
      {aiList.map((ai) => (
        <ul key={ai.id} className="flex items-center py-2">
          <li className="border p-1">
            <button
              key={ai.id}
              onClick={() => handleClick(ai.id)}
              className={`transition-opacity duration-300 ${
                ai.isUse ? "opacity-100" : "opacity-30"
              }`}
            >
              <Icon iconSrc={aiData[ai.id]?.icon} size={120} title={ai.name} />
            </button>
          </li>
        </ul>
      ))}
    </div>
  );
};
