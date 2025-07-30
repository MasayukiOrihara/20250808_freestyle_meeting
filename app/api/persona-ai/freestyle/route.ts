import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { runWithFallback, supabaseClient } from "@/lib/models";
import {
  FREESTYLE_COMPANY_SUMMARY,
  queryName,
  resolvedDirs,
  tableName,
} from "./contents";
import {
  FREESTYLE_PROMPT,
  getBaseUrl,
  MEMORY_PATH,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import {
  isTableMissingOrEmpty,
  saveEmbeddingSupabase,
  searchDocuments,
} from "./supabase";
import { buildDocumentChunks, checkUpdateDocuments } from "./embedding";
import { requestApi } from "@/lib/utils";

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
    const memoryResPromise = requestApi(baseUrl, MEMORY_PATH, {
      method: "POST",
      body: {
        messages,
        threadId,
        turn,
      },
    });

    /* 社内情報RAG　*/
    // コレクションのアップデートが必要か調べる
    // ※※ 全消去→再挿入にしているので、差分更新に変えたい
    // vercelに上げる場合差分チェックを行いません（ファイルはローカルにしかないので）
    const isLocal = getBaseUrl(req).host.includes("localhost");
    if (isLocal) {
      const needsUpdate = await checkUpdateDocuments(baseUrl, resolvedDirs);
      const isSupabaseTable = await isTableMissingOrEmpty(tableName);
      if (needsUpdate || !isSupabaseTable) {
        // すべて削除
        const { error } = await supabaseClient()
          .from(tableName)
          .delete()
          .not("id", "is", null);
        if (error) console.error("supabase table 削除エラー", error);
        // すべてを登録
        for (const [, dirPath] of Object.entries(resolvedDirs)) {
          await saveEmbeddingSupabase(
            await buildDocumentChunks(dirPath),
            tableName,
            queryName
          );
        }
      }
    }

    const company = await searchDocuments(
      currentUserMessage,
      4,
      tableName,
      queryName
    );

    // 過去履歴の同期
    const memory = await memoryResPromise;

    /** AI */
    const prompt = PromptTemplate.fromTemplate(FREESTYLE_PROMPT);
    const stream = await runWithFallback(
      prompt,
      {
        history: memory,
        user_message: currentUserMessage,
        freestyle_summary: FREESTYLE_COMPANY_SUMMARY,
        info: company,
      },
      "stream"
    );

    console.log("🏢 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🏢 Freestyle API error :" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
