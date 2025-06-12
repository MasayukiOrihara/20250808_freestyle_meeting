import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { formatMessage, getInfoUsingTools } from "@/lib/utils";
import { FREESTYLE_PROMPT, TAVILY_CLIENT, TAVILY_ERROR } from "@/lib/contents";
import { client, openAi, transportSearch } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log(" --- \n🏢 FS API");

    // メッセージの処理
    const currentUserMessage = messages[messages.length - 1].content;
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);

    const queryMessage = "site:freestyles.jp/ " + currentUserMessage;

    // API チェック
    if (!process.env.TAVILY_API_KEY) throw new Error(TAVILY_ERROR);

    /** MCPサーバー */
    const transport = transportSearch();
    const tavilyClient = client({ mcpName: TAVILY_CLIENT });
    await tavilyClient.connect(transport);

    /** AI */
    const prompt = PromptTemplate.fromTemplate(FREESTYLE_PROMPT);
    const info = await getInfoUsingTools(tavilyClient, queryMessage);
    const stream = await prompt.pipe(openAi).stream({
      history: formattedPreviousMessages,
      user_message: currentUserMessage,
      info: info,
    });

    console.log("🏢 COMPLITE \n --- ");

    return LangChainAdapter.toDataStreamResponse(stream);
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
