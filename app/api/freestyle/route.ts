import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { formatMessage } from "@/lib/utils";
import {
  FREESTYLE_COMPANY_SUMMARY,
  FREESTYLE_JUDGE_PROMPT,
  FREESTYLE_PROMPT,
  START_MESSAGE,
} from "@/lib/contents";
import {
  Sonnet4YN,
  OpenAi4oMini,
  strParser,
  getTavilyInfo,
  getFakeStream,
} from "@/lib/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log(" --- \n🏢 FS API");

    // メッセージの処理
    const currentUserMessage = messages[messages.length - 1].content;
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);

    const queryMessage = "site:freestyles.jp/ " + currentUserMessage;

    // フリースタイルの話かどうかの判断
    let isFreestyle = false;
    if (!currentUserMessage.includes(START_MESSAGE)) {
      const judgeTemplate = FREESTYLE_JUDGE_PROMPT;
      const checkJudgeFreestyle = await PromptTemplate.fromTemplate(
        judgeTemplate
      )
        .pipe(Sonnet4YN)
        .pipe(strParser)
        .invoke({
          input: currentUserMessage,
          summry: FREESTYLE_COMPANY_SUMMARY,
        });

      console.log("🏢 フリースタイルの話: " + checkJudgeFreestyle);
      if (checkJudgeFreestyle.includes("YES")) {
        isFreestyle = true;
      }
    }

    if (isFreestyle) {
      /** AI */
      const prompt = PromptTemplate.fromTemplate(FREESTYLE_PROMPT);
      const info = await getTavilyInfo(queryMessage);
      const stream = await prompt.pipe(OpenAi4oMini).stream({
        history: formattedPreviousMessages,
        user_message: currentUserMessage,
        info: info,
      });

      console.log("🏢 COMPLITE \n --- ");
      return LangChainAdapter.toDataStreamResponse(stream);
    } else {
      console.log("🏢 COMPLITE (NO USE) \n --- ");
      return LangChainAdapter.toDataStreamResponse(await getFakeStream());
    }
  } catch (error) {
    console.log("🏢 Freestyle API error :\n" + error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
