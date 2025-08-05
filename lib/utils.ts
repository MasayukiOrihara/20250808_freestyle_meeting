import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { UNKNOWN_ERROR } from "./contents";

// 型
type RequestBody = Record<string, unknown>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type HttpMethod = "GET" | "POST";
type RequestOptions = {
  method?: HttpMethod;
  body?: RequestBody;
  maxRetries?: number;
  baseDelay?: number;
};

// api 共通関数
export const requestApi = async (
  baseUrl: string,
  path: string,
  {
    method = "GET",
    body,
    maxRetries = 3,
    baseDelay = 200, // ミリ秒
  }: RequestOptions = {}
) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.request({
        url: baseUrl + path,
        method,
        data: method === "POST" ? body : undefined,
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      return response.data; // axiosはレスポンスデータがここに入る
    } catch (error) {
      const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

      let isRetryable = true;
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        isRetryable =
          !status || // ネットワーク系 (タイムアウトなど)
          (status >= 500 && status < 600); // サーバーエラー
      }

      if (attempt === maxRetries || !isRetryable) {
        console.error("APIリクエストエラー:", message);
        throw error;
      }

      const delay = Math.min(baseDelay * 2 ** attempt, 5000); // 最大5秒
      const jitter = Math.random() * 100;

      console.warn(
        `API失敗 (試行${attempt + 1}/${maxRetries})。${
          delay + jitter
        }ms 待機してリトライ...`
      );
      await new Promise((res) => setTimeout(res, delay + jitter));
    }
  }
  throw new Error("最大リトライ回数を超えました");
};

// バイナリから手動で降り除く
export const decodeStreamChunk = (value: Uint8Array): string => {
  const decoder = new TextDecoder("utf-8");
  const chars: string[] = [];

  let i = 0;
  while (i < value.length) {
    // パターン: 48 58 34 → '0:"'
    if (value[i] === 48 && value[i + 1] === 58 && value[i + 2] === 34) {
      i += 3; // "0:"をスキップ

      const charBytes: number[] = [];
      while (i < value.length && value[i] !== 34) {
        charBytes.push(value[i]);
        i++;
      }

      const char = decoder.decode(new Uint8Array(charBytes));
      chars.push(char);

      // スキップ: 終わりの `"`（34）と改行（10）を飛ばす
      if (value[i] === 34) i++;
      if (value[i] === 10) i++;
    } else {
      i++; // パターン外のバイトは無視
    }
  }

  return chars.join("");
};
