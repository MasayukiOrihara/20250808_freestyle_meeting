import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import {
  getBaseUrl,
  TEACHER_PROMPT,
  TEACHER_PROMPT_NO_INFO,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { getTavilyInfo, runWithFallback } from "@/lib/models";
import { memoryApi } from "@/lib/api";

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
    const infoPromise = getTavilyInfo(currentUserMessage);
    const memoryResponsePromise = memoryApi(baseUrl, messages, threadId, turn);

    // 過去履歴の同期
    const memoryResponse = await memoryResponsePromise;
    const memory = await memoryResponse.json();

    const info = await infoPromise;

    // プロンプト取得
    let prompt;
    if (info && info.length > 0) {
      prompt = PromptTemplate.fromTemplate(TEACHER_PROMPT);
    } else {
      prompt = PromptTemplate.fromTemplate(TEACHER_PROMPT_NO_INFO);
    }

    /** AI */
    const stream = await runWithFallback(
      prompt,
      {
        history: memory,
        user_message: currentUserMessage,
        info: info,
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
