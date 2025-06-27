import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

import { remark } from "remark";
import strip from "strip-markdown";

import path from "path";
import fs from "fs/promises";
import pdfParse from "pdf-parse";

// Qdrantクライアントと埋め込み初期化
export const qdrantClient = new QdrantClient({ url: "http://localhost:6333" });
export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

// 整形
function cleanText(text: string) {
  return (
    text
      // ** や __、~~ などのMarkdown強調記号を除去
      .replace(/(\*\*|__|~~)/g, "")
      // 連続改行を2つ（段落区切り）にまとめる（3つ以上を2つに）
      .replace(/\n{3,}/g, "\n\n")
      // 文中の改行（単一改行）をスペースに置換（ただし段落は残す）
      .replace(/([^\n])\n([^\n])/g, "$1 $2")
      // 先頭・末尾の空白行削除
      .trim()
  );
}

// アドレスやURLの処理
function normalizeUrlsAndEmails(text: string) {
  // URLパターン（簡易版）
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // メールアドレスパターン（簡易版）
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // 電話番号パターン（簡易版）
  const phoneRegex = /\b\d{2,4}[-(]?\d{2,4}[-)]?\d{3,4}\b/g;

  return text
    .replace(urlRegex, "[URL]")
    .replace(emailRegex, "[メールアドレス]")
    .replace(phoneRegex, "[電話番号]");
}

// チャンク分割器を作成（例: 500文字, 100文字オーバーラップ）
export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

// マークダウンドキュメントの作成
export const buildDocumentChunks = async (dir: string) => {
  const files = await fs.readdir(dir);
  const documents: Document[] = [];

  const results = await Promise.allSettled(
    files.map(async (file) => {
      console.log("ファイル: " + file);
      const ext = path.extname(file);

      // 1. ファイルの読み込み
      try {
        const content = await fs.readFile(path.join(dir, file));

        // 2. ファイルごとの処理
        let text = "";
        switch (ext) {
          case ".md":
            // マークダウン形式を除去
            const plainText = await remark()
              .use(strip)
              .process(content.toString("utf-8"));
            text = String(plainText);
            console.log("Markdown処理完了");
            break;
          case ".pdf":
            const pdfData = await pdfParse(content);
            text = pdfData.text;
            console.log("PDF処理完了");
            break;
          case ".txt":
            text = await content.toString("utf-8");
            console.log("TXT処理完了");
            break;
          default:
            console.log(`未対応: ${file}`);
            return;
        }

        // メールアドレスやURLの正規化
        const normalText = normalizeUrlsAndEmails(text);
        // テキストを前処理（改行除去や正規化など）
        const cleanedText = cleanText(normalText);

        // チャンク分割
        const chunks = await textSplitter.splitText(cleanedText);

        return chunks.map(
          (chunk, i) =>
            new Document({
              pageContent: chunk,
              metadata: {
                source: file,
                chunkIndex: i,
              },
            })
        );
      } catch (err) {
        console.warn(`処理失敗: ${file}`, err);
        return;
      }
    })
  );

  // 成功した分だけを結合
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      documents.push(...result.value);
    }
  }

  console.log("ドキュメント完了");
  return documents;
};

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
