type BottomPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
};

/**
 * ポップアップコンポーネント
 * @param param0
 * @returns
 */
export default function BottomPopup({
  isOpen,
  onClose,
  title,
  text,
}: BottomPopupProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 w-full h-2/5 bg-white shadow-lg p-4 border-t transition-transform duration-300 z-40 ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="w-1/3 m-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-gray-700">{text}</p>
      </div>
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className=" mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-400 cursor-pointer"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
