import { embeddings, qdrantClient } from "@/lib/models";
import { Document } from "langchain/document";
import { QdrantVectorStore } from "@langchain/qdrant";

/** QDRANT にドキュメントを埋め込む */
export async function saveEmbeddingQdrant(
  documets: Document[],
  collectionName: string
) {
  // ベクトルストアにアップサート
  await QdrantVectorStore.fromDocuments(documets, embeddings, {
    client: qdrantClient,
    collectionName: collectionName,
  });

  console.log("Qdrantへの登録完了");
}

/* すでにあるストアへ検索 */
export async function searchDocs(query: string, collectionName: string) {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      client: qdrantClient,
      collectionName: collectionName,
    }
  );
  const results = await vectorStore.similaritySearch(query, 4);
  const cleaned = results.map(
    (doc, index) => `情報 ${index}: ${doc.pageContent.replace(/[\r\n]+/g, "")}`
  );

  console.log("検索結果:");
  console.log(cleaned);
  return results;
}

/** コレクションが存在するか確認 */
export async function isCollectionMissingOrEmpty(
  collectionName: string
): Promise<boolean> {
  try {
    await qdrantClient.getCollection(collectionName);
  } catch (e) {
    return false;
  }

  const scrollResult = await qdrantClient.scroll(collectionName, {
    limit: 1,
  });

  return scrollResult.points.length === 0 ? false : true;
}
