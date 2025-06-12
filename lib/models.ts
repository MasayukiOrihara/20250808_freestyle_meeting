import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StringOutputParser } from "@langchain/core/output_parsers";

import * as CONTENTS from "./contents";

// パサー
export const strParser = new StringOutputParser();

// OPENAI
export const openAi = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: CONTENTS.OPEN_AI_4O,
  temperature: 0.8,
  cache: true,
  tags: CONTENTS.TAGS,
});

// Haiku3_5
export const Haiku3_5 = new ChatAnthropic({
  model: CONTENTS.ANTHROPIC_HAIKU_3_5,
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxTokens: 256,
  temperature: 0.3,
  cache: true,
  tags: CONTENTS.TAGS,
});

// MCPクライアント作成
export const client = ({ mcpName }: { mcpName: string }) =>
  new Client(
    {
      name: mcpName,
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

// TAVILY: MCPサーバー接続
export const transportSearch = () =>
  new StdioClientTransport({
    command: "cmd",
    args: [
      "/c",
      "npx",
      "-y",
      "@smithery/cli@latest",
      "run",
      "@tavily-ai/tavily-mcp",
      "--key",
      "b8370370-2226-41e7-8390-4392770ab70d",
      "--config",
      '"{\\"tavilyApiKey\\":\\"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\\"}"',
    ],
    env: {
      API_KEY: process.env.TAVILY_API_KEY!,
    },
  });
