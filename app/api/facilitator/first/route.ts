import { LangChainAdapter } from "ai";

import { UNKNOWN_ERROR } from "@/lib/contents";
import { getFakeStream } from "@/lib/models";

/**
 * 司会者 AI
 * 最初の返答
 */
export async function GET() {
  try {
    console.log(" --- \n🎤 FACILITATOR FIRST API");

    // langsmith トレース管理
    process.env.LANGCHAIN_TRACING_V2 = "false";

    // ストリーム
    const responses = [
      "ここはあなたの言葉に複数のAIが反応する空間です。何か入力してみてください。",
    ];
    const stream = await getFakeStream(responses);

    console.log("🎤 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🎤 FACILITATOR FIRST API error :" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
