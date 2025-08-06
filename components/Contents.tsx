import { motion, AnimatePresence } from "framer-motion";

import { ResponseContainer } from "./response/ResponseContainer";
import { MessageInput } from "./message/MessageInput";
import { AssistantComment } from "./response/AssistantComment";
import { useAiState } from "./provider/AiStateProvider";

export const Contents: React.FC = () => {
  const { aiState } = useAiState();

  return (
    <motion.div
      key="start-motion"
      className="flex md:flex-row flex-col md:w-[1080px] w-full h-full m-auto my-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* 左 */}
      <div className="flex flex-col md:w-3/5 w-full h-full m-auto">
        <ResponseContainer />
        <MessageInput />
      </div>
      {/* 右 */}
      {aiState !== "start" && (
        <div key="assistant-comment" className="w-full h-full">
          <AssistantComment />
        </div>
      )}
    </motion.div>
  );
};
