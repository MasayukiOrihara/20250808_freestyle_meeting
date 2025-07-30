import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

// 型
type RequestBody = Record<string, any>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// post 共通関数
export const postApi = async (
  baseUrl: string,
  path: string,
  body: RequestBody
) => {
  try {
    const response = await axios.post(baseUrl + path, body, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // axiosはレスポンスデータがここに入る
  } catch (error) {
    console.error("APIリクエストエラー:", error);
    throw error;
  }
};

// get 共通関数
export const getApi = async (baseUrl: string, path: string) => {
  try {
    const response = await axios.get(baseUrl + path, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("GET API エラー:", error);
    throw error;
  }
};
