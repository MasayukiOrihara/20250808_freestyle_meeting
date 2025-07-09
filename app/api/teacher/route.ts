import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { formatMessage } from "@/lib/utils";
import { TEACHER_PROMPT, UNKNOWN_ERROR } from "@/lib/contents";
import { getTavilyInfo, OpenAi4oMini } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log(" --- \n🔎 TEACHER API");

    // メッセージの処理
    const currentUserMessage = messages[messages.length - 1].content;
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);

    /** AI */
    const prompt = PromptTemplate.fromTemplate(TEACHER_PROMPT);
    const info = await getTavilyInfo(currentUserMessage);
    const stream = await prompt.pipe(OpenAi4oMini).stream({
      history: formattedPreviousMessages,
      user_message: currentUserMessage,
      info: "今日の天気は晴れ",
    });

    console.log("🔎 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.log("🔎 Teacher API error :\n" + error);
    if (error instanceof Error) {
      console.log(error);
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
