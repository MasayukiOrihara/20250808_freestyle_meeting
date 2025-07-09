import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import { formatMessage } from "@/lib/utils";
import { OpenAi4oMini, getTavilyInfo } from "@/lib/models";
import {
  buildDocumentChunks,
  checkUpdateDocuments,
  qdrantClient,
  saveEmbeddingQdrant,
  searchDocs,
} from "./embedding";
import {
  collectionName,
  FREESTYLE_COMPANY_SUMMARY,
  resolvedDirs,
} from "./contents";
import { FREESTYLE_PROMPT } from "@/lib/contents";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log(" --- \n🏢 FS API");

    // メッセージの処理
    const currentUserMessage = messages[messages.length - 1].content;
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);

    /* 社内情報RAG　*/
    // コレクションのアップデートが必要か調べる
    const needsUpdate = await checkUpdateDocuments(resolvedDirs);
    if (needsUpdate) {
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

    /** AI */
    const prompt = PromptTemplate.fromTemplate(FREESTYLE_PROMPT);
    const stream = await prompt.pipe(OpenAi4oMini).stream({
      history: formattedPreviousMessages,
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
