import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { FakeListChatModel } from "@langchain/core/utils/testing";

import * as CONTENTS from "./contents";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { PromptTemplate } from "@langchain/core/prompts";

// パサー
export const strParser = new StringOutputParser();

// OPENAI(4o)
export const OpenAi4o = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: CONTENTS.OPEN_AI_4O,
  temperature: 0.8,
  tags: CONTENTS.TAGS,
});

// OPENAI(4o-mini)
export const OpenAi4oMini = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: CONTENTS.OPEN_AI_4O_MINI,
  temperature: 0.6,
  tags: CONTENTS.TAGS,
});

// Haiku3_5
export const Haiku3_5 = new ChatAnthropic({
  model: CONTENTS.ANTHROPIC_HAIKU_3_5,
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxTokens: 256,
  temperature: 0.3,
  tags: CONTENTS.TAGS,
});

// sonnet（判断用）
export const Sonnet4YN = new ChatAnthropic({
  model: CONTENTS.ANTHROPIC_SONNET_4,
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxTokens: 5,
  temperature: 0.2,
  tags: CONTENTS.TAGS,
});

/** フェイク用のモデルを使用して、そのまま応答を送信 */
export const getFakeStream = async () => {
  const fakeModel = new FakeListChatModel({
    responses: ["関連性なし"],
  });
  const prompt = PromptTemplate.fromTemplate("TEMPLATE1");

  return await prompt.pipe(fakeModel).stream({});
};

/** tavilyでクエリから記事を取得するための関数 */
export const getTavilyInfo = async (query: string) => {
  // API チェック
  const api = process.env.TAVILY_API_KEY;
  if (!api) throw new Error(CONTENTS.TAVILY_ERROR);

  // query チェック
  if (!query || query.trim().length === 0) {
    throw new Error("Tavilyに渡すqueryが空です");
  }

  // Tavilyツールの準備
  const tavily = new TavilySearchAPIRetriever({
    apiKey: api,
    k: 1,
    includeGeneratedAnswer: true,
  });

  return await tavily.invoke(query);
};
