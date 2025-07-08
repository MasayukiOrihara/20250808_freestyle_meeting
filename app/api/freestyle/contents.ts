import path from "path";

/** ベクターストアのコレクションネーム */
export const collectionName = "md_docs";

/* ディレクトリパス */
const lineWorksDirs = {
  board: "board",
  regulations: "regulations",
  // history: "history",
} as const;

export const resolvedDirs = Object.fromEntries(
  Object.entries(lineWorksDirs).map(([key, subDir]) => [
    key,
    path.resolve(process.cwd(), "public", "line-works", subDir),
  ])
);
