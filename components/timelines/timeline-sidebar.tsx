import { aiData } from "@/lib/ai-data";
import { Icon } from "./timeline-icon";
import { useAiData } from "./timeline-provider";

export const TimelineSidebar = () => {
  const { aiDataState, setAiDataState } = useAiData();
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
    <div className="h-full mx-1">
      {aiList.map((ai) => (
        <ul key={ai.id} className="flex items-center my-1">
          <li className="border p-1">
            <button
              key={ai.id}
              onClick={() => handleClick(ai.id)}
              className={`transition-opacity duration-300 hover:cursor-pointer hover:opacity-100 ${
                ai.isUse ? "opacity-70" : "opacity-20"
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
