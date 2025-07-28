import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

import { remark } from "remark";
import strip from "strip-markdown";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import _ from "lodash";
import {
  getGlobalHashData,
  getSupabaseHashData,
  postGlobalHashData,
  postSupabaseHashData,
} from "@/lib/api";

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

// ハッシュ化
function hashDocContent(buffer: Buffer<ArrayBufferLike>) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// でーぷコピー
function deepCopyString2DArray(arr: string[][]): string[][] {
  return arr.map((inner) => [...inner]);
}

// 順番関係なしに比較
function isEqualIgnoreOrder(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return _.isEqual(sortedA, sortedB);
}

/** 更新チェック */
export async function checkUpdateDocuments(
  url: string,
  resolvedDirs: {
    [k: string]: string;
  }
) {
  const hashData: string[][] = [];

  // データの取得
  const vectorDb = process.env.VECTOR_DB;
  let globalHashData: string[] = [];
  switch (vectorDb) {
    case "docker":
      globalHashData = await getGlobalHashData(url);
      break;
    case "supabase":
      globalHashData = await getSupabaseHashData(url);
      break;
    default:
      console.error("Unsupported VECTOR_DB type" + vectorDb);
  }

  // ハッシュの取得
  for (const [, dirPath] of Object.entries(resolvedDirs)) {
    const files = await fs.readdir(dirPath);

    const hash: string[] = [];
    await Promise.allSettled(
      files.map(async (file) => {
        try {
          const content = await fs.readFile(path.join(dirPath, file));
          hash.push(hashDocContent(content));
        } catch (error) {
          console.warn(`処理失敗: ${file}`, error);
          return;
        }
      })
    );
    hashData.push(hash);
  }
  // 比較
  const flatHashData = hashData.flat();
  const isEqual = isEqualIgnoreOrder(globalHashData, flatHashData);
  if (!isEqual) {
    // データ更新
    switch (vectorDb) {
      case "docker":
        await postGlobalHashData(url, flatHashData);
        break;
      case "supabase":
        await postSupabaseHashData(url, flatHashData);
        break;
      default:
        console.error("Unsupported VECTOR_DB type" + vectorDb);
    }
  }
  return !isEqual;
}

/* ベクターストアに入れるドキュメントの作成 */
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
            break;
          case ".pdf":
            const pdfData = await pdfParse(content);
            text = pdfData.text;
            break;
          case ".txt":
            text = await content.toString("utf-8");
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
