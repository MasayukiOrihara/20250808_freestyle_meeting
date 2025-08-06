import Image from "next/image";
import { motion } from "framer-motion";

import { IconProps } from "@/lib/types";
import {
  DUMMY_ICON_PATH,
  FACILITATOR_ICON_PATH_01_hand,
  FACILITATOR_ICON_PATH_02_hand,
  FACILITATOR_ICON_PATH_NOHAND,
} from "@/lib/contents";
import { useAiState } from "../provider/AiStateProvider";
import { useEffect, useState } from "react";

/* アイコン表示 */
export const AssistantIcon: React.FC<IconProps> = ({
  iconSrc,
  size = 60,
  title = "",
  className,
}) => {
  return (
    <div className=" aspect-[1/1]">
      <Image
        src={iconSrc || DUMMY_ICON_PATH}
        alt="icon"
        title={title}
        width={size}
        height={size}
        priority
        className={`rounded ${className}`}
      />
    </div>
  );
};

export const FacilitatorIcon = () => {
  const { aiState } = useAiState();
  const [handPath, setHandPath] = useState(FACILITATOR_ICON_PATH_01_hand);

  useEffect(() => {
    if (aiState === "ready") {
      setHandPath(FACILITATOR_ICON_PATH_02_hand);
      return;
    }
    setHandPath(FACILITATOR_ICON_PATH_01_hand);
  }, [aiState]);

  return (
    <div className="relative w-[200px] h-[200px] m-auto">
      <div className="absolute rounded-full bg-slate-50 border-6 border-double border-blue-100 shadow-md overflow-hidden">
        <AssistantIcon
          iconSrc={FACILITATOR_ICON_PATH_NOHAND}
          size={1200}
          className="w-11/12 m-auto transform translate-y-[20px]"
        />
      </div>
      <motion.div
        key={handPath}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <AssistantIcon
          iconSrc={handPath}
          size={1200}
          className="absolute top-[25px] left-1/2 w-11/12 transform -translate-x-1/2"
        />
      </motion.div>
    </div>
  );
};
