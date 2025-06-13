export const TimelineAi = ({ aiMessages }: { aiMessages: string[] }) => {
  return (
    <div className="grow-[5] h-full px-4 py-2 border">
      {aiMessages.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
    </div>
    /*
    <div className="w-full h-full">
      <div className="mb-2 text-blue-300">ここにAI💬</div>
      {currentAiCommentMessage && (
        <div
          className="my-2 py-2 px-6 bg-zinc-800/60 rounded"
          key={currentAiCommentMessage.id}
        >
          <span className="text-white">{currentAiCommentMessage.content}</span>
        </div>
      )}
      {currentAiTeacherMessage && (
        <div
          className="my-2 py-2 px-6 bg-zinc-800/60 rounded"
          key={currentAiTeacherMessage.id}
        >
          <span className="text-white">{currentAiTeacherMessage.content}</span>
        </div>
      )}
      {currentAiFreestyleMessage &&
        currentAiFreestyleMessage.content !== "関連性なし" && (
          <div
            className="my-2 py-2 px-6 bg-zinc-800/60 rounded"
            key={currentAiFreestyleMessage.id}
          >
            <span className="text-white">
              {currentAiFreestyleMessage.content}
            </span>
          </div>
        )}
    </div>
  );*/
  );
};
