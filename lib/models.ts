import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
  JsonOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
import { FakeListChatModel } from "@langchain/core/utils/testing";

import * as CONTENTS from "./contents";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { PromptTemplate } from "@langchain/core/prompts";
import { createClient } from "@supabase/supabase-js";
import { Runnable } from "@langchain/core/runnables";

// パサー
export const strParser = new StringOutputParser();
export const jsonParser = new JsonOutputParser();

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
  apiKey: process.env.OPENAI_API_KEY!,
});

// OPENAI(4.1-mini)
export const OpenAi4_1Mini = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: CONTENTS.OPEN_AI_4_1_MINI,
  temperature: 0.6,
  tags: CONTENTS.TAGS,
});
// OPENAI(4o-mini)
export const OpenAi4oMini = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: CONTENTS.OPEN_AI_4O_MINI,
  temperature: 0.6,
  tags: CONTENTS.TAGS,
});

/**
 * OPENAI(4.1-nano)
 * メンターグラフを使用するかの判断
 */
export const OpenAi4_1Nano = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: CONTENTS.OPEN_AI_4_1_NANO,
  temperature: 0.2,
  tags: CONTENTS.TAGS,
});

// フォールバック可能なLLM一覧
const fallbackLLMs: Runnable[] = [OpenAi4_1Mini, OpenAi4oMini, OpenAi4_1Nano];
// レート制限に達したときに別のモデルに切り替える対策 + 指数バックオフ付き
export async function runWithFallback(
  runnable: Runnable,
  input: Record<string, any>,
  mode: "invoke" | "stream" = "invoke",
  parser?: Runnable,
  maxRetries = 3,
  baseDelay = 200
) {
  for (const model of fallbackLLMs) {
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const pipeline = runnable.pipe(model);
        if (parser) pipeline.pipe(parser);
        const result =
          mode === "stream"
            ? await pipeline.stream(input)
            : await pipeline.invoke(input);

        // ✅ 成功モデルのログ
        console.log(`[LLM] Using model: ${model.lc_kwargs.model}`);
        return result;
      } catch (err: any) {
        const message = err?.message ?? "";
        const isRateLimited =
          message.includes("429") ||
          message.includes("rate limit") ||
          message.includes("overloaded") ||
          err.type === "rate_limit_exceeded";
        if (!isRateLimited) throw err;

        // 指数バックオフの処理
        const delay = Math.min(baseDelay * 2 ** retry, 5000); // 最大5秒
        const jitter = Math.random() * 100;
        console.warn(
          `Model ${model.lc_kwargs.model} failed with rate limit (${
            retry + 1
          }/${maxRetries}): ${message}`
        );
        await new Promise((res) => setTimeout(res, delay + jitter));
      }
    }
    // 次のモデルにフォールバック（次のループへ）
    console.warn(
      `Model ${model.lc_kwargs.model} failed all retries. Trying next model.`
    );
  }
  // どのモデルでも成功しなかった場合
  throw new Error("All fallback models failed.");
}

export /** フェイク用のモデルを使用して、そのまま応答を送信 */
const getFakeStream = async () => {
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
