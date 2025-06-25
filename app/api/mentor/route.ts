import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { formatMessage } from "@/lib/utils";
import {
  MENTOR_JUDGE_PROMPT,
  MENTOR_PROMPT,
  MENTOR_QUESTIONS,
  START_MESSAGE,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import {
  Sonnet4YN,
  OpenAi4oMini,
  strParser,
  getFakeStream,
} from "@/lib/models";

let isUserWorried = false;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log(" --- \n🔮 MENTOR API");

    // メッセージ処理
    const currentUserMessage = messages[messages.length - 1].content;
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);

    // 悩み相談かどうかの判断

    if (!currentUserMessage.includes(START_MESSAGE)) {
      const judgeTemplate = MENTOR_JUDGE_PROMPT;
      const checkJudgeMentor = await PromptTemplate.fromTemplate(judgeTemplate)
        .pipe(Sonnet4YN)
        .pipe(strParser)
        .invoke({ question: currentUserMessage });

      if (checkJudgeMentor.includes("YES")) {
        console.log("💛 悩み相談: " + checkJudgeMentor);
        isUserWorried = true;
      }
    }

    if (isUserWorried) {
      // 悩みがあった場合
      const prompt = PromptTemplate.fromTemplate(MENTOR_PROMPT);
      const stream = await prompt.pipe(OpenAi4oMini).stream({
        question_list: MENTOR_QUESTIONS,
        history: formattedPreviousMessages,
        user_message: currentUserMessage,
      });

      console.log("🔮 COMPLITE \n --- ");
      return LangChainAdapter.toDataStreamResponse(stream);
    } else {
      console.log("🔮 COMPLITE (NO USE) \n --- ");
      return LangChainAdapter.toDataStreamResponse(await getFakeStream());
    }
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
