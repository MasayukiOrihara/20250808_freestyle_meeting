import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Document } from "langchain/document";

import { embeddings, supabaseClient } from "@/lib/models";

/** supabase にドキュメントを埋め込む */
export async function saveEmbeddingSupabase(
  documets: Document[],
  tableName: string,
  queryName: string
) {
  try {
    // ストアの作成
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient(),
      tableName: tableName,
      queryName: queryName,
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

/**
 * Supabaseテーブルが「存在して」「空でない」かどうか判定する
 */
export async function isTableMissingOrEmpty(
  tableName: string
): Promise<boolean> {
  // 1. テーブルが存在するかを情報スキーマから確認
  const { data: tables, error: schemaError } = await supabaseClient()
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")
    .eq("table_name", tableName);

  if (schemaError || !tables || tables.length === 0) {
    // テーブルが存在しない
    return true;
  }

  // 2. 中身が空かチェック（limit 1 で十分）
  const { data: rows, error: dataError } = await supabaseClient()
    .from(tableName)
    .select("id") // 何か1列だけでOK
    .limit(1);

  if (dataError || !rows || rows.length === 0) {
    // 空のテーブル
    return true;
  }

  // テーブルが存在して、かつデータが入っている
  return false;
}

/**
 * 類似度検索クエリ
 * @param query
 * @param k
 * @returns
 */
export async function searchDocuments(
  query: string,
  k = 4,
  tableName: string,
  queryName: string
) {
  // VectorStoreをSupabaseのテーブル 'documents' で初期化
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient(),
    tableName: tableName,
    queryName: queryName, // 事前にSQLで作成している関数名
  });

  // 類似度検索
  const results = await vectorStore.similaritySearch(query, k);
  return results; // { pageContent, metadata } の配列
}
