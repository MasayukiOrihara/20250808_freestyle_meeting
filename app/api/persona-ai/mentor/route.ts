import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import {
  CHECK_CONTENUE_PROMPT_EN,
  CONSULTING_FINISH_MESSAGE,
  getBaseUrl,
  MEMORY_PATH,
  MENTOR_GRAPH_PATH,
  MENTOR_PROMPT,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { OpenAi4_1Nano, runWithFallback, strParser } from "@/lib/models";
import { requestApi } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const { baseUrl } = getBaseUrl(req);

    console.log(" --- \n🔮 MENTOR API");
    console.log("session: " + body.sessionId);
    console.log("turns: " + body.count);

    // 記憶のID用
    const threadId = "mentor_" + body.sessionId;
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

    /* mentor graph API */
    const checkPrompt = PromptTemplate.fromTemplate(CHECK_CONTENUE_PROMPT_EN);
    const checkContenue = await checkPrompt
      .pipe(OpenAi4_1Nano)
      .pipe(strParser)
      .invoke({ user_message: currentUserMessage });

    console.log("🔮 悩みの判断: " + checkContenue);
    let contexts = CONSULTING_FINISH_MESSAGE;
    if (checkContenue.includes("YES")) {
      const mentorGraph = await requestApi(baseUrl, MENTOR_GRAPH_PATH, {
        method: "POST",
        body: {
          messages,
        },
      });
      contexts = mentorGraph.contexts;
    }

    // 過去履歴の同期
    let memory: string[] = [];
    try {
      memory = await memoryResPromise;
    } catch (error) {
      console.warn("🔮 会話記憶が取得できませんでした");
    }

    /* AI */
    const prompt = PromptTemplate.fromTemplate(MENTOR_PROMPT);
    const stream = await runWithFallback(
      prompt,
      {
        question_context: contexts,
        history: memory,
        user_message: currentUserMessage,
      },
      "stream"
    );

    console.log("🔮 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🔮 MENTOR API error :" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
