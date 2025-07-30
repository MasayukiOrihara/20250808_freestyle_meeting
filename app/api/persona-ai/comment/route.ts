import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { getBaseUrl, MEMORY_PATH, UNKNOWN_ERROR } from "@/lib/contents";
import { runWithFallback } from "@/lib/models";
import { assistantData } from "@/lib/assistantData";
import { requestApi } from "@/lib/utils";

/**
 * パーソナAI: コメント
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const { baseUrl } = getBaseUrl(req);

    const id = req.headers.get("id") ?? "comment";

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

    // bot情報取得
    const bot = Object.values(assistantData).find((item) => item.id === id);

    // プロンプトの確認
    if (!bot?.aiMeta.prompt) throw new Error("プロンプトが設定されていません");
    const prompt = PromptTemplate.fromTemplate(bot?.aiMeta.prompt);

    // 過去履歴の同期
    let memory: string[] = [];
    try {
      memory = await memoryResPromise;

      console.log("💿 記憶 ---");
      console.log(memory);
      console.log(" --- ");
    } catch (error) {
      console.warn("💬 会話記憶が取得できませんでした");
    }

    // ストリーム
    const stream = await runWithFallback(
      prompt,
      {
        history: memory,
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
