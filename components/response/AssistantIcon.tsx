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
    <Image
      src={iconSrc || DUMMY_ICON_PATH}
      alt="icon"
      title={title}
      width={size}
      height={size}
      className={`rounded ${className}`}
    />
  );
};
