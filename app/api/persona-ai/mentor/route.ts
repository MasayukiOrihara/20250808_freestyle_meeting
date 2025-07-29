import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import {
  CHECK_CONTENUE_PROMPT_EN,
  CONSULTING_FINISH_MESSAGE,
  getBaseUrl,
  MENTOR_PROMPT,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { OpenAi4_1Mini, OpenAi4_1Nano, strParser } from "@/lib/models";
import { memoryApi, mentorGraphApi } from "@/lib/api";

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
    const memoryResponsePromise = memoryApi(baseUrl, messages, threadId, turn);

    /* mentor graph API */
    const checkPrompt = PromptTemplate.fromTemplate(CHECK_CONTENUE_PROMPT_EN);
    const checkContenue = await checkPrompt
      .pipe(OpenAi4_1Nano)
      .pipe(strParser)
      .invoke({ user_message: currentUserMessage });

    console.log("🔮 悩みの判断: " + checkContenue);
    let contexts = CONSULTING_FINISH_MESSAGE;
    if (checkContenue.includes("YES")) {
      const mentorGraphResponse = await mentorGraphApi(baseUrl, messages);
      const mentorGraph = await mentorGraphResponse.json();
      contexts = mentorGraph.contexts;
    }

    // 過去履歴の同期
    const memoryResponse = await memoryResponsePromise;
    const memory = await memoryResponse.json();

    /* AI */
    const prompt = PromptTemplate.fromTemplate(MENTOR_PROMPT);
    const stream = await prompt.pipe(OpenAi4_1Mini).stream({
      question_context: contexts,
      history: memory,
      user_message: currentUserMessage,
    });

    console.log("🔮 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🔮 MENTOR API error :" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
