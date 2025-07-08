import { ChecklistItem } from "../checklist";
import { MentorStates } from "../route";
import { LangsmithOutput } from "./preprocessAINode";

type ContextNode = {
  aiContexts: LangsmithOutput;
  transition: MentorStates;
  checklist: ChecklistItem[][];
};

export function prepareContextNode({
  aiContexts,
  transition,
  checklist,
}: ContextNode) {
  let contexts = "";

  // 会話継続の意思を確認
  if (aiContexts.checkContenueTalk.includes("YES")) {
    // 会話の終了処理
    transition.hasQuestion = false;
    contexts = "";
    return { transition, checklist, contexts };
  }

  // チェックリストの質問との一致項目を特定
  // ※※ anthropicくんの機嫌で崩れたフォーマット送ってくる可能性もあるからフォーマットチェックはした方がいい
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
            const index = calams[2].indexOf("COMMENT: ");
            if (index !== -1) {
              item.comment =
                (item.comment ?? "") +
                calams[2].slice(index + "COMMENT: ".length) +
                ", ";
            }
          }
        }
      }
    }
  }
  // コンテキストを準備
  contexts = aiContexts.selectNextQuestion;
  return { transition, checklist, contexts };
}
