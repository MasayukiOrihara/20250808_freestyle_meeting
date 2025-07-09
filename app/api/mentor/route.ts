import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { formatMessage } from "@/lib/utils";
import {
  MENTOR_PROMPT,
  NATSUKASHI_PROMPT,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { OpenAi4oMini, getFakeStream } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log(" --- \n🔮 MENTOR API");

    // メッセージ処理
    const currentUserMessage = messages[messages.length - 1].content;
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);

    /* mentor graph API */
    const host = req.headers.get("host") ?? "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    const response = await fetch(baseUrl + "/api/mentor-graph", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, // vercel用
      },
      body: JSON.stringify({ messages }),
    });
    const graph = await response.json();

    // 悩みがあった場合
    const prompt = PromptTemplate.fromTemplate(MENTOR_PROMPT);
    const stream = await prompt.pipe(OpenAi4oMini).stream({
      question_context: graph.contexts,
      history: formattedPreviousMessages,
      user_message: currentUserMessage,
    });

    console.log("🔮 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.log("🔮 MENTOR API error :\n" + error);
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
