import Image from "next/image";

import { IconProps } from "@/lib/types";
import { DUMMY_ICON_PATH } from "@/lib/contents";

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
        className={`rounded w-full h-full ${className}`}
      />
    </div>
  );
};
