import os
from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv
import requests

load_dotenv()
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# FastMCPサーバを初期化
mcp = FastMCP("test")


# ツールを定義。型ヒントやdocstringをきちんと記載する必要がある。
@mcp.tool()
def search_web_freestyle(word: str) -> str:
    """
    株式会社フリースタイル関係の検索ワードを受け取り、検索結果を文字列で返す関数。

    Args:
        word (str): 検索ワード

    Returns:
        str: 検索の結果
    """
    
    def search_web_with_tavily(query: str, num_results: int = 5) -> str:
        url = "https://api.tavily.com/search"
        headers = {
            "Content-Type": "application/json",
        }
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": query,
            "search_depth": "basic",
            "max_results": num_results,
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        results = response.json()

        # 結果をテキストとして結合
        snippets = [item.get("content", "") for item in results.get("results", [])]
        return "\n\n".join(snippets)
    
    query = "site:freestyles.jp " + word
    return search_web_with_tavily(query)

# 実行処理
if __name__ == "__main__":
    mcp.run(transport="stdio")