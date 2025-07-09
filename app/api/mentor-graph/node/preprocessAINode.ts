import { Haiku3_5, langsmithClient, strParser } from "@/lib/models";
import { BaseMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChecklistItem } from "../checklist";

type AiNode = {
  messages: BaseMessage[];
  checklist: ChecklistItem[][];
  step: number;
};

// 出力するオブジェクトの型
export type LangsmithOutput = {
  checkContenueTalk: string;
  checkUserMessage: string;
  selectNextQuestion: string;
  summarizeMessage: string;
};

/**
 *
 * @param messages
 */
export async function preprocessAINode({ messages, checklist, step }: AiNode) {
  /* 1. 必要情報の準備 */
  // すべてのプロンプトを用意
  const langsmithPrompts = await loadLangsmithPrompts();
  const contenueTemplate = langsmithPrompts[0].manifest.kwargs.template;
  const userTemplate = langsmithPrompts[1].manifest.kwargs.template;
  const selectTemplate = langsmithPrompts[2].manifest.kwargs.template;
  const summarizeTemplate = langsmithPrompts[3].manifest.kwargs.template;

  // ユーザーの発言を取得
  const userMessage = messages[messages.length - 1].content;

  // AIに次の質問を渡す用として整形
  let checklistQuestion = "";
  console.log("\n --- \n");
  console.log(step);
  console.log(checklist[step]);
  console.log("\n --- \n");
  for (const item of checklist[step]) {
    checklistQuestion += "・" + item.question + "\n";
  }

  const [
    checkContenueTalk,
    checkUserMessage,
    selectNextQuestion,
    summarizeMessage,
  ] = await Promise.all([
    /* 2. 会話の意思を確認 */
    PromptTemplate.fromTemplate(contenueTemplate)
      .pipe(Haiku3_5)
      .pipe(strParser)
      .invoke({ user_message: userMessage }),

    /* 3. チェックリストの質問との一致項目を特定 */
    PromptTemplate.fromTemplate(userTemplate)
      .pipe(Haiku3_5)
      .pipe(strParser)
      .invoke({
        checklist_text: formattedChecklistToText(checklist),
        user_message: userMessage,
      }),

    /* 4. どれを質問するかを決めさせる */
    PromptTemplate.fromTemplate(selectTemplate)
      .pipe(Haiku3_5)
      .pipe(strParser)
      .invoke({
        checklist_question: checklistQuestion,
        user_message: userMessage,
      }),

    /* 5. チェックリストを参考に総括をする */
    // ※※ 現在のターンの入力がありません
    PromptTemplate.fromTemplate(summarizeTemplate)
      .pipe(Haiku3_5)
      .pipe(strParser)
      .invoke({ checklist_text: formattedChecklistToText(checklist) }),
  ]);

  console.log("会話終了の意思: " + checkContenueTalk);
  console.log("一致項目の回答結果:\n" + checkUserMessage);
  console.log("一致項目の回答結果:\n" + selectNextQuestion);
  console.log("総括:\n" + summarizeMessage);

  const aiContexts: LangsmithOutput = {
    checkContenueTalk,
    checkUserMessage,
    selectNextQuestion,
    summarizeMessage,
  };
  return { aiContexts };
}

/** langsmith から使用するプロンプトを読み込み */
async function loadLangsmithPrompts() {
  // langsmith側のプロンプトの名前
  const promptnames = [
    "mentor_check-contenue-talk",
    "mentor_check-user-message",
    "mentor_select-next-question",
    "mentor_summarize-message",
  ];
  // 読み込み開始
  const promises = promptnames.map((name) =>
    langsmithClient.pullPromptCommit(name)
  );
  // 処理待ち
  const results = await Promise.all(promises);
  const prompts = results.filter(
    (prompt): prompt is NonNullable<typeof prompt> => prompt !== null
  );

  return prompts;
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
