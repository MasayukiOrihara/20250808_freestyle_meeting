import { ChecklistItem } from "../checklist";
import { LangsmithOutput } from "./preprocessAINode";

// 定数
const CONSULTING_FINISH_MESSAGE = `AI指示:
過去の体験を思い出すような語り口で、やんわりと気づきを与えてください。

その語りは、直接的なアドバイスではなく、
「昔こんなことがあってね……」と架空の思い出を語るようなものにしてください。`;

type ContextNode = {
  aiContexts: LangsmithOutput;
  hasQuestion: boolean;
  checklist: ChecklistItem[][];
};

export function prepareContextNode({
  aiContexts,
  hasQuestion,
  checklist,
}: ContextNode) {
  const contexts: string[] = [];

  // 会話継続の意思を確認
  if (aiContexts.checkContenueTalk.includes("NO")) {
    // 会話の終了処理
    hasQuestion = false;
    contexts.push(CONSULTING_FINISH_MESSAGE);
    return { hasQuestion, checklist, contexts };
  }

  // チェックリストの質問との一致項目を特定
  // ※※ anthropicくんの機嫌で崩れたフォーマット送ってくる可能性もあるからフォーマットチェックはした方がいい
  const COMMENT_LABEL = "comment: ";
  const blocks = aiContexts.checkUserMessage
    .split("---")
    .map((block) => block.trim())
    .filter(Boolean);

  for (const item of blocks) {
    const calams = item
      .split("\n")
      .map((calam) => calam.trim())
      .filter(Boolean);

    for (const group of checklist) {
      for (const item of group) {
        if (calams[0]?.includes(item.question)) {
          item.checked = calams[1]?.toLowerCase().includes("true") ?? false;

          if (calams[2]) {
            const index = calams[2].indexOf(COMMENT_LABEL);
            if (index !== -1) {
              item.comment =
                (item.comment ?? "") +
                calams[2].slice(index + COMMENT_LABEL.length) +
                ", ";
            }
          }
        }
      }
    }
  }
  // コンテキストを準備
  contexts.push(aiContexts.selectNextQuestion);
  return { hasQuestion, checklist, contexts };
}
