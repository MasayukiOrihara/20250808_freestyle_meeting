import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { OpenAi4_1Mini, qdrantClient } from "@/lib/models";
import {
  buildDocumentChunks,
  checkUpdateDocuments,
  isCollectionMissingOrEmpty,
  saveEmbeddingQdrant,
  searchDocs,
} from "./embedding";
import {
  collectionName,
  FREESTYLE_COMPANY_SUMMARY,
  resolvedDirs,
} from "./contents";
import { FREESTYLE_PROMPT, getBaseUrl } from "@/lib/contents";
import { memoryApi } from "@/lib/api";

/**
 * 社内文書検索API
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const { baseUrl } = getBaseUrl(req);

    console.log(" --- \n🏢 FS API");
    console.log("session: " + body.sessionId);
    console.log("turns: " + body.count);

    // 記憶のID用
    const threadId = "freestyle_" + body.sessionId;
    const turn = body.count;

    // メッセージの処理
    const currentUserMessage = messages[messages.length - 1].content;
    const memoryResponsePromise = memoryApi(baseUrl, messages, threadId, turn);

    /* 社内情報RAG　*/
    // コレクションのアップデートが必要か調べる
    const needsUpdate = await checkUpdateDocuments(resolvedDirs);
    const isCollection = await isCollectionMissingOrEmpty(collectionName);
    if (needsUpdate || !isCollection) {
      // コレクション削除
      await qdrantClient.deleteCollection(collectionName);

      // すべてを登録
      for (const [, dirPath] of Object.entries(resolvedDirs)) {
        await saveEmbeddingQdrant(
          await buildDocumentChunks(dirPath),
          collectionName
        );
      }
    }

    // RAG準備
    const company = await searchDocs(currentUserMessage, collectionName);

    // 過去履歴の同期
    const memoryResponse = await memoryResponsePromise;
    const memory = await memoryResponse.json();

    /** AI */
    const prompt = PromptTemplate.fromTemplate(FREESTYLE_PROMPT);
    const stream = await prompt.pipe(OpenAi4_1Mini).stream({
      history: memory,
      user_message: currentUserMessage,
      freestyle_summary: FREESTYLE_COMPANY_SUMMARY,
      info: company,
    });

    console.log("🏢 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.log("🏢 Freestyle API error :\n" + error);
    if (error instanceof Error) {
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
