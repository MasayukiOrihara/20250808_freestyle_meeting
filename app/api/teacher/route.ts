import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { LangChainAdapter, Message as VercelChatMessage } from "ai";

// 定数
// const PYTHON_PATH = process.cwd() + "/mcp-server/.venv/Scripts/python.exe";
// const SEARCH_PY_PATH = process.cwd() + "/mcp-server/search.py";
const SEARCH_JS_PATH = process.cwd() + "/mcp-server/search-server.js";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const ANTHROPIC_MODEL_3_5 = "claude-3-5-haiku-20241022";

// OPENAI
const openAi = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  temperature: 0.8,
  cache: true,
  tags: ["reflect_whiteboard"],
});

// ANTHROPIC
const anthropic = new ChatAnthropic({
  model: ANTHROPIC_MODEL_3_5,
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxTokens: 256,
  temperature: 0.3,
  cache: true,
  tags: ["reflect_whiteboard"],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log("🔎 TEACHER API");

    const currentUserMessage = messages[messages.length - 1].content;
    const formatMessage = (message: VercelChatMessage) => {
      return `${message.role}: ${message.content}`;
    };
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);

    if (!TAVILY_API_KEY) {
      throw new Error("TAVILY_API_KEY environment variable is not set: ");
    }

    /** MCPサーバー */
    console.log("SEARCH_PY_PATH" + SEARCH_JS_PATH);
    const transportSearch = new StdioClientTransport({
      command: "node",
      args: [SEARCH_JS_PATH],
      env: {
        API_KEY: TAVILY_API_KEY,
      },
    });
    const client = new Client({
      name: "mcp-client",
      version: "1.0.0",
    });
    await client.connect(transportSearch);

    /** ツール */
    const listRes = await client.listTools();
    const availableTools = listRes.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      schema: tool.inputSchema,
    }));

    const selectTools = await anthropic.invoke(currentUserMessage, {
      tools: availableTools,
    });
    console.log(selectTools.content);
    console.log(selectTools.tool_calls);

    /**
     * 応答処理とツール・コールの処理
     */
    let info = "";
    if (selectTools.tool_calls && selectTools.tool_calls.length > 0) {
      for (const tool of selectTools.tool_calls) {
        const result = await client.callTool({
          name: tool.name,
          arguments: tool.args,
        });
        info = JSON.stringify(result.content);
        console.log(info);
      }
    }

    /** AI */
    const prompt = PromptTemplate.fromTemplate(
      "あなたは教えたがりの真面目なAIです。userのメッセージに対してinfoを参考に140文字程度で追加情報を教えてください。メッセージに対する反応はいりません。\n\nCurrent conversation: ---\n{history}\n---\n\ninfo: {info}\nuser: {user_message}\nassistant: "
    );
    const stream = await prompt.pipe(openAi).stream({
      history: formattedPreviousMessages,
      user_message: currentUserMessage,
      info: info,
    });

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
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
