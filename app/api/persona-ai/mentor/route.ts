import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";
import { v4 as uuidv4 } from "uuid";

import { getBaseUrl, MENTOR_PROMPT, UNKNOWN_ERROR } from "@/lib/contents";
import { OpenAi4_1Mini } from "@/lib/models";
import { memoryApi, mentorGraphApi } from "@/lib/api";

// 記憶のID用
const threadId = uuidv4();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const { baseUrl } = getBaseUrl(req);

    console.log(" --- \n🔮 MENTOR API");

    // メッセージ処理
    const currentUserMessage = messages[messages.length - 1].content;
    const memoryResponsePromise = memoryApi(baseUrl, messages, threadId);

    /* mentor graph API */
    const mentorGraphResponse = await mentorGraphApi(baseUrl, messages);
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
