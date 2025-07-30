import { OpenAi4_1Nano, strParser } from "@/lib/models";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { PromptTemplate } from "@langchain/core/prompts";

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
      k: 3,
      includeGeneratedAnswer: true,
    });

    const result = await tavily.invoke(query);
    console.log("検索結果: ");
    console.log(
      result.map((doc, index) => `${index} ページ目: ${doc.pageContent}`)
    );
    if (!result || result.length === 0) return null;

    const searchResult = result.map((doc) => doc.pageContent);
    return searchResult;
  } catch (error) {
    console.warn("Tavily検索中にエラー:", error);
    return null;
  }
};

// クエリの取得 + 検索するかどうかの決定
export const searchWeb = async (userMessage: string) => {
  try {
    const template = `次のユーザーメッセージから検索するためのクエリを作成し、クエリのみで出力してください。
  作成できない場合は空欄で出力してください。

    User Message: {user_message}`;
    const prmpt = PromptTemplate.fromTemplate(template);
    const repsponse = await prmpt
      .pipe(OpenAi4_1Nano)
      .pipe(strParser)
      .invoke({ user_message: userMessage });

    if (repsponse && repsponse.length != 0) {
      console.log("🔎 検索実行中...: " + repsponse);
      const search = await getTavilyInfo(repsponse);
      return search;
    }

    return null;
  } catch (error) {
    console.warn("Tavily検索中にエラー:", error);
    return null;
  }
};
