import { format } from "date-fns";

export const TimelineMenu = () => {
  const day = format(new Date(), "yyyy-MM-dd");
  const time = format(new Date(), "HH : mm");

  return (
    <div className="h-full my-1 ml-1 p-2 bg-zinc-400/20 rounded">
      <h2 className="mb-2 font-bold">共通情報</h2>
      <ul className="[&>li]:mb-4 [&>li]:text-sm [&>li]:text-zinc-400 [&>li>p]:text-zinc-800 [&>li>p]:text-base">
        <li className="">
          1 日付
          <p>{day}</p>
        </li>
        <li>
          2 時間
          <p>{time}</p>
        </li>
        <li>3 現在地</li>
        <li>4 名前</li>
      </ul>
    </div>
  );
};
