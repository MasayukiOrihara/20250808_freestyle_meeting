import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import {
  CONTEXT_PATH,
  getBaseUrl,
  MEMORY_PATH,
  TEACHER_PROMPT,
  TEACHER_PROMPT_NO_INFO,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { runWithFallback } from "@/lib/models";
import { requestApi } from "@/lib/utils";
import { searchWeb } from "./tavily";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const { baseUrl } = getBaseUrl(req);

    console.log(" --- \n🔎 TEACHER API");
    console.log("session: " + body.sessionId);
    console.log("turns: " + body.count);

    // 記憶のID用
    const threadId = "teacher_" + body.sessionId;
    const turn = body.count;

    // メッセージの処理
    const currentUserMessage = messages[messages.length - 1].content;
    const infoPromise = searchWeb(currentUserMessage);
    const memoryResPromise = requestApi(baseUrl, MEMORY_PATH, {
      method: "POST",
      body: {
        messages,
        threadId,
        turn,
      },
    });

    // コンテキストの取得
    let context = "";
    try {
      context = await requestApi(baseUrl, CONTEXT_PATH);
    } catch (error) {
      console.warn("🔎 コンテキストが取得できませんでした: " + error);
    }

    // 過去履歴の同期
    let memory: string[] = [];
    try {
      memory = await memoryResPromise;
    } catch (error) {
      console.warn("🔎 会話記憶が取得できませんでした: " + error);
    }

    // 検索結果の取得状況によってプロンプト取得
    let prompt;
    const info: string[] | null = await infoPromise;
    let infoContext = "";
    if (info && info.length > 0) {
      prompt = PromptTemplate.fromTemplate(TEACHER_PROMPT);
      infoContext = info.join("\n");
    } else {
      prompt = PromptTemplate.fromTemplate(TEACHER_PROMPT_NO_INFO);
    }

    /** AI */
    const stream = await runWithFallback(
      prompt,
      {
        context: context,
        history: memory.join("\n"),
        user_message: currentUserMessage,
        info: infoContext,
      },
      "stream"
    );

    console.log("🔎 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🔎 Teacher API error :" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
