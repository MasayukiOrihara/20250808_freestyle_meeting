import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { formatMessage } from "@/lib/utils";
import { UNKNOWN_ERROR } from "@/lib/contents";
import { OpenAi4oMini } from "@/lib/models";
import { aiData } from "@/lib/ai-data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    const id = req.headers.get("id") ?? "comment";

    console.log(" --- \n💬 COMMENT API");

    // メッセージ処理
    const currentUserMessage = messages[messages.length - 1].content;
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);

    // bot情報取得
    const bot = Object.values(aiData).find((item) => item.id === id);

    // プロンプトの確認
    if (!bot?.aiMeta.prompt) throw new Error("プロンプトが設定されていません");
    const prompt = PromptTemplate.fromTemplate(bot?.aiMeta.prompt);

    const stream = await prompt.pipe(OpenAi4oMini).stream({
      history: formattedPreviousMessages,
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
