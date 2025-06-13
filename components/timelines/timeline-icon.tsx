import Image from "next/image";

type IconProps = {
  iconSrc?: string;
  size?: number;
};

const DUMMY_ICON_PATH = "/icon/human_dummy.png";

export const Icon: React.FC<IconProps> = ({ iconSrc, size = 60 }) => {
  return (
    <Image
      src={iconSrc || DUMMY_ICON_PATH}
      alt="icon"
      width={size}
      height={size}
      className="rounded"
    />
  );
};
