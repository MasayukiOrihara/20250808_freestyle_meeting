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
export const buildMdDocumentChunks = async () => {
  const boardDir = path.resolve(process.cwd(), "public", "line-works", "board");
  const files = await fs.readdir(boardDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  // すべてのテキストとIDをためる
  const documents: Document[] = [];

  for (const file of mdFiles) {
    const content = await fs.readFile(path.join(boardDir, file), "utf-8");
    // メールアドレスやURLの正規化
    const normalText = normalizeUrlsAndEmails(content);
    // マークダウン形式を除去
    const plainText = await remark().use(strip).process(normalText);
    // 開業などの除去
    const cleanedText = cleanText(String(plainText));

    // チャンク分割
    const chunks = await textSplitter.splitText(cleanedText);

    chunks.forEach((chunk, i) => {
      documents.push(
        new Document({
          pageContent: chunk,
          metadata: {
            source: file,
            chunkIndex: i,
          },
        })
      );
    });
  }
  console.log("md ドキュメント完了");
  return documents;
};

// pdfドキュメントの作成
export const buildPdfDocumentChunks = async () => {
  const regulationsDir = path.resolve(
    process.cwd(),
    "public",
    "line-works",
    "regulations"
  );
  // 動的インポートでpdf-parseを読み込み
  const files = await fs.readdir(regulationsDir);
  const pdfFiles = files.filter((f) => f.endsWith(".pdf"));

  // すべてのテキストとIDをためる
  const documents: Document[] = [];

  for (const file of pdfFiles) {
    const filePath = path.join(regulationsDir, file);
    console.log("ファイル" + filePath);

    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);

    // 開業などの除去
    const cleanedText = cleanText(pdfData.text);

    // チャンク分割
    const chunks = await textSplitter.splitText(cleanedText);

    chunks.forEach((chunk, i) => {
      documents.push(
        new Document({
          pageContent: chunk,
          metadata: {
            source: file,
            chunkIndex: i,
          },
        })
      );
    });
  }
  console.log("pdf ドキュメント完了");
  return documents;
};

// txtドキュメントの作成
export const buildTextDocumentChunks = async () => {
  const historyDir = path.resolve(
    process.cwd(),
    "public",
    "line-works",
    "history"
  );
  const files = await fs.readdir(historyDir);
  const txtFiles = files.filter((f) => f.endsWith(".txt"));

  // すべてのテキストとIDをためる
  const documents: Document[] = [];

  for (const file of txtFiles) {
    const filePath = path.join(historyDir, file);
    console.log("読み込み中: " + filePath);

    // ファイルの中身を取得
    const rawText = await fs.readFile(filePath, "utf-8");

    // メールアドレスやURLの正規化
    const normalText = normalizeUrlsAndEmails(rawText);
    // テキストを前処理（改行除去や正規化など）
    const cleanedText = cleanText(normalText);
    // チャンク分割
    const chunks = await textSplitter.splitText(cleanedText);

    chunks.forEach((chunk, i) => {
      documents.push(
        new Document({
          pageContent: chunk,
          metadata: {
            source: file,
            chunkIndex: i,
          },
        })
      );
    });
  }

  console.log("txt ドキュメント完了");
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
