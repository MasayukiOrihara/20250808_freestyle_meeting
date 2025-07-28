import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { MENTOR_PROMPT, UNKNOWN_ERROR } from "@/lib/contents";
import { OpenAi4_1Mini } from "@/lib/models";
import { memoryApi, mentorGraphApi } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log(" --- \n🔮 MENTOR API");
    console.log("session: " + body.sessionId);
    console.log("turns: " + body.count);

    // 記憶のID用
    const threadId = "mentor_" + body.sessionId;
    const turn = body.count;

    // メッセージ処理
    const currentUserMessage = messages[messages.length - 1].content;
    const memoryResponsePromise = memoryApi(messages, threadId, turn);

    /* mentor graph API */
    const mentorGraphResponse = await mentorGraphApi(messages);
    const mentorGraph = await mentorGraphResponse.json();

    // 過去履歴の同期
    const memoryResponse = await memoryResponsePromise;
    const memory = await memoryResponse.json();

    /* AI */
    const prompt = PromptTemplate.fromTemplate(MENTOR_PROMPT);
    const stream = await prompt.pipe(OpenAi4_1Mini).stream({
      question_context: mentorGraph.contexts,
      history: memory,
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
