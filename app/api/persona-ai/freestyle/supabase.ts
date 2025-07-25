import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { Document } from "langchain/document";

import { embeddings } from "@/lib/models";

/** supabase にドキュメントを埋め込む */
export async function saveEmbeddingSupabase(documets: Document[]) {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseKey) throw new Error(`Expected SUPABASE_SERVICE_ROLE_KEY`);
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error(`Expected env var SUPABASE_URL`);

  try {
    const supabaseClient = createClient(url, supabaseKey);

    // ストアの作成
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: "documents",
      queryName: "match_documents",
    });

    // ドキュメントの追加
    await vectorStore.addDocuments(documets);
  } catch (error) {
    throw new Error(
      `ストアの作成および ドキュメントの追加を失敗しました。 ${error}`
    );
  }

  console.log("supabade への登録完了");
}
