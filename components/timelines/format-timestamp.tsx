import React from "react";

type Props = {
  timestamp: string | number; // UNIXミリ秒 or ISO8601文字列想定
};

const formatTimestamp = (time: string | number) => {
  const now = Date.now();
  const then = typeof time === "number" ? time : new Date(time).getTime();
  const diffMs = now - then;

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "just now"; // 1分未満
  if (diffMinutes < 60) return `${diffMinutes}m`; // 1分〜59分
  if (diffHours < 24) return `${diffHours}h`; // 1時間〜23時間
  // 24時間以上は日付表示（例：2025/06/13）
  const date = new Date(then);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const RelativeTime: React.FC<Props> = ({ timestamp }) => {
  return <span>{formatTimestamp(timestamp)}</span>;
};

export default RelativeTime;
