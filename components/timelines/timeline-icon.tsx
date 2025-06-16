import { DUMMY_ICON_PATH } from "@/lib/contents";
import Image from "next/image";

type IconProps = {
  iconSrc?: string;
  size?: number;
  title?: string;
};

export const Icon: React.FC<IconProps> = ({
  iconSrc,
  size = 60,
  title = "",
}) => {
  return (
    <Image
      src={iconSrc || DUMMY_ICON_PATH}
      alt="icon"
      title={title}
      width={size}
      height={size}
      className="rounded"
    />
  );
};
