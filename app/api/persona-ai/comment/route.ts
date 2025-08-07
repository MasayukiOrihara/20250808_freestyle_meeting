import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import {
  COMMENT_PROMPT,
  CONTEXT_PATH,
  getBaseUrl,
  MEMORY_PATH,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { runWithFallback } from "@/lib/models";
import { requestApi } from "@/lib/utils";

/**
 * パーソナAI: コメント
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const { baseUrl } = getBaseUrl(req);

    // langsmith トレース管理
    process.env.LANGCHAIN_TRACING_V2 = "false";

    console.log(" --- \n💬 COMMENT API");
    console.log("session: " + body.sessionId);
    console.log("turns: " + body.count);

    // 記憶のID用
    const threadId = "comment_" + body.sessionId;
    const turn = body.count;

    // メッセージ処理
    const currentUserMessage = messages[messages.length - 1].content;
    const memoryResPromise = requestApi(baseUrl, MEMORY_PATH, {
      method: "POST",
      body: {
        messages,
        threadId,
        turn,
      },
    });

    // プロンプトの確認
    const prompt = PromptTemplate.fromTemplate(COMMENT_PROMPT);

    // コンテキストの取得
    let context = "";
    try {
      context = await requestApi(baseUrl, CONTEXT_PATH);
    } catch (error) {
      console.warn("💬 コンテキストが取得できませんでした: " + error);
    }

    // 過去履歴の同期
    let memory: string[] = [];
    try {
      memory = await memoryResPromise;

      console.log("💿 記憶 ---");
      console.log(memory);
      console.log(" --- ");
    } catch (error) {
      console.warn("💬 会話記憶が取得できませんでした: " + error);
    }

    // ストリーム
    const stream = await runWithFallback(
      prompt,
      {
        context: context,
        history: memory.join("\n"),
        user_message: currentUserMessage,
      },
      "stream"
    );

    console.log("💬 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("💬 COMMENT API error :" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
