import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { getBaseUrl, UNKNOWN_ERROR } from "@/lib/contents";
import { OpenAi4_1Mini } from "@/lib/models";
import { assistantData } from "@/lib/assistantData";
import { memoryApi } from "@/lib/api";

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
    const memoryResponsePromise = memoryApi(baseUrl, messages, threadId, turn);

    // bot情報取得
    const bot = Object.values(assistantData).find((item) => item.id === id);

    // プロンプトの確認
    if (!bot?.aiMeta.prompt) throw new Error("プロンプトが設定されていません");
    const prompt = PromptTemplate.fromTemplate(bot?.aiMeta.prompt);

    // 過去履歴の同期
    const memoryResponse = await memoryResponsePromise;
    const memory = await memoryResponse.json();

    console.log("💿 記憶 ---");
    console.log(memory);
    console.log(" --- ");

    // ストリーム
    const stream = await prompt.pipe(OpenAi4_1Mini).stream({
      history: memory,
      user_message: currentUserMessage,
    });

    console.log("💬 COMPLITE \n --- ");

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.log("💬 COMMENT API error :\n" + error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: UNKNOWN_ERROR }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
