type DetailButtonProps = {
  title: string;
  onClick: () => void;
  disabled: boolean;
  name: string;
  icon?: React.ElementType;
};

/**
 * 詳細ボタンコンポーネント
 * @param param0
 * @returns
 */
export default function DetailButton({
  title,
  onClick,
  disabled,
  name,
  icon: Icon,
}: DetailButtonProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer px-1 py-2 border border-white hover:border-gray-400 active:bg-gray-100 text-gray-700 rounded transition disabled:opacity-30 disabled:cursor-auto disabled:hover:border-white"
    >
      <span className="flex items-center">
        {Icon && <Icon className="w-4 h-4 text-zinc-600" />}
        <span className="ml-0.5 text-xs">{name}</span>
      </span>
    </button>
  );
}
