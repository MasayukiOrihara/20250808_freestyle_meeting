import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { formatMessage, getInfoUsingTools } from "@/lib/utils";
import { TAVILY_ERROR, TEACHER_PROMPT, UNKNOWN_ERROR } from "@/lib/contents";
import { client, openAi, transportSearch } from "@/lib/models";
import { TAVILY_CLIENT } from "../../../lib/contents";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log(" --- \n🔎 TEACHER API");

    // メッセージの処理
    const currentUserMessage = messages[messages.length - 1].content;
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);

    // TAVILY APIチェック
    if (!process.env.TAVILY_API_KEY) throw new Error(TAVILY_ERROR);

    /** MCPサーバー */
    const transport = transportSearch();
    const tavilyClient = client({ mcpName: TAVILY_CLIENT });
    await tavilyClient.connect(transport);

    /** AI */
    const prompt = PromptTemplate.fromTemplate(TEACHER_PROMPT);
    const info = await getInfoUsingTools(tavilyClient, currentUserMessage);
    const stream = await prompt.pipe(openAi).stream({
      history: formattedPreviousMessages,
      user_message: currentUserMessage,
      info: info,
    });

    console.log("🔎 COMPLITE \n --- ");

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
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
