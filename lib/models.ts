import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
  JsonOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { Client } from "langsmith";

import * as CONTENTS from "./contents";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { PromptTemplate } from "@langchain/core/prompts";
import { createClient } from "@supabase/supabase-js";

// パサー
export const strParser = new StringOutputParser();
export const jsonParser = new JsonOutputParser();

// langsmithからプロンプトの取得
export const langsmithClient = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

// supabase のクライアント
export const supabaseClient = () => {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseKey) throw new Error(`Expected SUPABASE_SERVICE_ROLE_KEY`);
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error(`Expected env var SUPABASE_URL`);

  const supabaseClient = createClient(url, supabaseKey);
  return supabaseClient;
};

// 埋め込み初期化
export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

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

// OPENAI(4.1-mini)
export const OpenAi4_1Mini = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: CONTENTS.OPEN_AI_4_1_MINI,
  temperature: 0.2,
  tags: CONTENTS.TAGS,
});

// Haiku3_5
export const Haiku3_5 = new ChatAnthropic({
  model: CONTENTS.ANTHROPIC_HAIKU_3_5,
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxTokens: 256,
  temperature: 0.2,
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

/**
 * tavilyでクエリから記事を取得するための関数
 * もし何らかのエラーで取得できなかった場合は null を返す
 */
export const getTavilyInfo = async (query: string) => {
  // API チェック
  const api = process.env.TAVILY_API_KEY;
  if (!api) {
    console.error("APIキーが未設定です");
    return null;
  }

  // query チェック
  if (!query || query.trim().length === 0) {
    console.warn("空のクエリが渡されました");
    return null;
  }

  // Tavilyツールの準備
  try {
    const tavily = new TavilySearchAPIRetriever({
      apiKey: api,
      k: 2,
      includeGeneratedAnswer: true,
    });

    const result = await tavily.invoke(query);
    console.log("検索結果: ");
    console.log(
      result.map((doc, index) => `${index} ページ目: ${doc.pageContent}`)
    );
    if (!result || result.length === 0) return null;

    return result;
  } catch (error) {
    console.warn("Tavily検索中にエラー:", error);
    return null;
  }
};
