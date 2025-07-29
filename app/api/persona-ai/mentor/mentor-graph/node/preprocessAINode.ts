import { runWithFallback, strParser } from "@/lib/models";
import { BaseMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChecklistItem } from "../checklist";
import {
  CHECK_USER_MESSAGE_PROMPT_EN,
  SELECT_NEXT_QUESTION_PROMPT_EN,
} from "@/lib/contents";

type AiNode = {
  messages: BaseMessage[];
  checklist: ChecklistItem[][];
  step: number;
};

// 出力するオブジェクトの型
export type LangsmithOutput = {
  checkUserMessage: string;
  selectNextQuestion: string;
};

/**
 *
 * @param messages
 */
export async function preprocessAINode({ messages, checklist, step }: AiNode) {
  /* 1. 必要情報の準備 */
  // ユーザーの発言を取得
  const userMessage = messages[messages.length - 1].content;

  // プロンプトとチェインの用意
  const checkPrompt = PromptTemplate.fromTemplate(CHECK_USER_MESSAGE_PROMPT_EN);
  const selectPrompt = PromptTemplate.fromTemplate(
    SELECT_NEXT_QUESTION_PROMPT_EN
  );

  // AIに次の質問を渡す用として整形
  let checklistQuestion = "";
  for (const item of checklist[step]) {
    checklistQuestion += "・" + item.question + "\n";
  }

  const [checkUserMessageLlm, selectNextQuestionLlm] = await Promise.all([
    /* 2. チェックリストの質問との一致項目を特定 */
    runWithFallback(
      checkPrompt,
      {
        checklist_text: formattedChecklistToText(checklist),
        user_message: userMessage,
      },
      "invoke",
      strParser
    ),

    /* 3. どれを質問するかを決めさせる */
    runWithFallback(
      selectPrompt,
      {
        checklist_question: checklistQuestion,
        user_message: userMessage,
      },
      "invoke",
      strParser
    ),
  ]);

  const checkUserMessage: string = checkUserMessageLlm.content;
  const selectNextQuestion: string = selectNextQuestionLlm.content;
  const aiContexts: LangsmithOutput = {
    checkUserMessage,
    selectNextQuestion,
  };
  return { aiContexts };
}

/* チェックリストを LLM 用に整形 */
const formattedChecklistToText = (checklist: ChecklistItem[][]) => {
  let allText = "";
  for (const subList of checklist) {
    for (const item of subList) {
      allText +=
        "question: " +
        item.question +
        "\n" +
        "checked: " +
        item.checked +
        "\n" +
        "comment: " +
        item.comment +
        "\n --- \n";
    }
  }
  return allText;
};
