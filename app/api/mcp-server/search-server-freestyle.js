"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastmcp_1 = require("fastmcp");
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
// 環境変数からTavily API Keyを取得
dotenv_1.default.config();
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const server = new fastmcp_1.FastMCP({
    name: "My Server",
    version: "1.0.0",
});
/**
 * Tavily APIを使用してWeb検索を実行する関数
 */
function searchWebWithTavily(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, numResults = 5) {
        if (!TAVILY_API_KEY) {
            throw new Error("TAVILY_API_KEY environment variable is not set: " + TAVILY_API_KEY);
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
            const response = yield fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const results = yield response.json();
            // 結果をテキストとして結合
            const snippets = results.results
                .map((item) => item.content || "")
                .filter((content) => content.length > 0);
            return snippets.join("\n\n");
        }
        catch (error) {
            console.error("Error searching with Tavily:", error);
            throw new Error(`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    });
}
server.addTool({
    name: "search_web_freestyle",
    description: "株式会社フリースタイル関係の検索ワードを受け取り、検索結果を文字列で返す関数。",
    parameters: zod_1.z.object({
        word: zod_1.z.string(),
    }),
    execute: (_a) => __awaiter(void 0, [_a], void 0, function* ({ word }) {
        const query = "site:freestyles.jp " + word;
        return yield searchWebWithTavily(query);
    }),
});
server.start({
    transportType: "stdio",
});
