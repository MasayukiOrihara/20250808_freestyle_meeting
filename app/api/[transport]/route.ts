import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

// APIキー
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

/**
 * Tavily APIを使用してWeb検索を実行する関数
 */
async function searchWebWithTavily(
  query: string,
  numResults: number = 5
): Promise<string> {
  if (!TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY environment variable is not set");
  }

  const url = "https://api.tavily.com/search";
  const headers = {
    "Content-Type": "application/json",
  };

  const payload = {
    api_key: TAVILY_API_KEY,
    query: query,
    search_depth: "basic",
    max_results: numResults,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const results = await response.json();

    // 結果をテキストとして結合
    const snippets = results.results
      .map((item: { content: string }) => item.content || "")
      .filter((content: string) => content.length > 0);

    return snippets.join("\n\n");
  } catch (error) {
    console.error("Error searching with Tavily:", error);
    throw new Error(
      `Search failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

const handler = createMcpHandler((server) => {
  server.tool(
    "search_web",
    "検索ワードを受け取り、検索結果を文字列で返す関数",
    { word: z.string() },
    async ({ word }) => {
      const result = await searchWebWithTavily(word);
      return { content: [{ type: "text", text: result.toString() }] };
    }
  );
});

export { handler as GET, handler as POST, handler as DELETE };
