import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { formatMessage } from "@/lib/utils";
import {
  COMMENT_PROMPT,
  MENTOR_QUESTIONS,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { openAi } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log(" --- \n💬 COMMENT API");
    console.log("LANGSMITH_TRACING:", process.env.LANGSMITH_TRACING);

    // メッセージ処理
    const currentUserMessage = messages[messages.length - 1].content;
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);
    const prompt = PromptTemplate.fromTemplate(COMMENT_PROMPT);

    const stream = await prompt.pipe(openAi).stream({
      question_list: MENTOR_QUESTIONS,
      history: formattedPreviousMessages,
      user_message: currentUserMessage,
    });

    console.log("💬 COMPLITE \n --- ");

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
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
