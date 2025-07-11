import { useChatMessages } from "../provider/ChatMessageProvider";

export const MessageOutput = () => {
  const { userMessages } = useChatMessages();
  return (
    <div className="flex flex-col items-center font-serif">
      {/* 表示エリア */}
      <div className="relative w-full h-[200px] perspective-[1000px] overflow-hidden bg-white shadow-inner border border-gray-200 rounded">
        {userMessages.map((line, i) => {
          const age = userMessages.length - 1 - i;

          const depth = age * 40;
          const rotateX = age * 35; // ← 強めの角度で倒す（例: 12°ずつ）
          const opacity = 1 - age * 0.1;
          const scale = 1 - age * 0.04;
          const blur = age * 0.5;

          const maxOffset = 30;
          const overlapOffset = age === 0 ? 0 : maxOffset / (age + 1);

          return (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-700 ease-out"
              style={{
                top: 60 - overlapOffset,
                transform: `translateZ(-${depth}px) rotateX(${rotateX}deg) scale(${scale})`,
                transformOrigin: "top center", // 🔸 上辺を軸に倒す
                opacity,
                filter: `blur(${blur}px)`,
                transformStyle: "preserve-3d",
                zIndex: i,
              }}
            >
              {line.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
