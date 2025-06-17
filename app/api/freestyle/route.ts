import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";
import { FakeListChatModel } from "@langchain/core/utils/testing";

import { formatMessage, getInfoUsingTools } from "@/lib/utils";
import {
  FREESTYLE_COMPANY_SUMMARY,
  FREESTYLE_PROMPT,
  START_MESSAGE,
  TAVILY_CLIENT,
  TAVILY_ERROR,
} from "@/lib/contents";
import {
  client,
  Haiku3_5_YN,
  OpenAi,
  strParser,
  transportSearch,
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
      const judgeTemplate =
        "以下の会社概要に、次のユーザーの文章は関連していますか？「YES」または「NO」のみを出力してください。\n\n[会社概要: {summry}]\n[ユーザーの文章: {input}]\n\n出力: ";
      const summry = FREESTYLE_COMPANY_SUMMARY;
      const checkJudgeFreestyle = await PromptTemplate.fromTemplate(
        judgeTemplate
      )
        .pipe(Haiku3_5_YN)
        .pipe(strParser)
        .invoke({ input: currentUserMessage, summry: summry });

      console.log("🏢 フリースタイルの話: " + checkJudgeFreestyle);
      if (checkJudgeFreestyle.includes("YES")) {
        isFreestyle = true;
      }
    }

    if (isFreestyle) {
      // API チェック
      const tavily = process.env.TAVILY_API_KEY;
      if (!tavily) throw new Error(TAVILY_ERROR);

      /** MCPサーバー */
      const transport = transportSearch({ apiKey: tavily });
      const tavilyClient = client({ mcpName: TAVILY_CLIENT });
      await tavilyClient.connect(transport);

      /** AI */
      const prompt = PromptTemplate.fromTemplate(FREESTYLE_PROMPT);
      const info = await getInfoUsingTools(tavilyClient, queryMessage);
      const stream = await prompt.pipe(OpenAi).stream({
        history: formattedPreviousMessages,
        user_message: currentUserMessage,
        info: info,
      });

      console.log("🏢 COMPLITE \n --- ");

      return LangChainAdapter.toDataStreamResponse(stream);
    } else {
      //  フェイク用のモデルを使用して、そのまま応答を送信
      const fakeModel = new FakeListChatModel({
        responses: ["関連性なし"],
      });
      const prompt = PromptTemplate.fromTemplate("TEMPLATE1");
      const stream = await prompt.pipe(fakeModel).stream({});

      console.log("🏢 COMPLITE (NO USE) \n --- ");

      return LangChainAdapter.toDataStreamResponse(stream);
    }
  } catch (error) {
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
