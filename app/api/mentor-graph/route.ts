import { PromptTemplate } from "@langchain/core/prompts";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import {
  Annotation,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { checklist, ChecklistItem } from "./checklist";
import { initializeStatesNode } from "./node/initializeStatesNode";
import { LangsmithOutput, preprocessAINode } from "./node/preprocessAINode";
import { prepareContextNode } from "./node/prepareContextNode";

/** mentorAPIでの状態定義 */
export type MentorStates = {
  isConsulting: boolean;
  hasQuestion: boolean;
};

// 遷移の状態保存
const transitionStates: MentorStates = {
  isConsulting: false, // メンターモードか
  hasQuestion: true, // 質問することがあるか
};

// 繰り返した回数
let count = 0;
// チェックリスト
let checklistUse: ChecklistItem[][] = checklist.map((group) =>
  group.map((item) => ({ ...item }))
);

/**
 * ノード定義
 */
async function initializeStates() {
  console.log("🔧 初期設定ノード");

  const { states, step } = await initializeStatesNode({
    states: transitionStates,
    checklist: checklistUse,
    count: count,
  });

  return {
    transition: { ...states },
    step: step,
  };
}

async function preprocessAI(state: typeof MentorAnnotation.State) {
  console.log("🧠 AI準備ノード");

  const { aiContexts } = await preprocessAINode({
    messages: state.messages,
    checklist: checklistUse,
    step: state.step,
  });
  return { aiContexts: aiContexts };
}

async function prepareContext(state: typeof MentorAnnotation.State) {
  console.log("📝 コンテキスト準備ノード");

  const { transition, checklist, contexts } = prepareContextNode({
    aiContexts: state.aiContexts,
    transition: state.transition,
    checklist: checklistUse,
  });

  checklistUse = checklist.map((group) => group.map((item) => ({ ...item })));
  return { transition: transition, contexts: contexts };
}

/** データを保存するノード */
async function saveData() {
  console.log("💾 データ保存ノード");

  count++;
}

/**
 * グラフ定義
 */
const MentorAnnotation = Annotation.Root({
  contexts: Annotation<string[]>(),
  aiContexts: Annotation<LangsmithOutput>(),
  step: Annotation<number>(),
  transition: Annotation<MentorStates>({
    value: (
      state: MentorStates = {
        isConsulting: false,
        hasQuestion: true,
      },
      action: Partial<MentorStates>
    ) => ({
      ...state,
      ...action,
    }),
  }),
  ...MessagesAnnotation.spec,
});

const MentorGraph = new StateGraph(MentorAnnotation)
  // ノード追加
  .addNode("init", initializeStates)
  .addNode("ai", preprocessAI)
  .addNode("context", prepareContext)
  .addNode("save", saveData)
  // エッジ追加
  .addEdge("__start__", "init")
  .addEdge("init", "ai")
  .addEdge("ai", "context")
  .addEdge("context", "save")
  .addEdge("save", "__end__");

// コンパイル
const app = MentorGraph.compile();

/**
 * チャット応答AI
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const modelName = body.model ?? "fake-llm";

    console.log("💛 メンターチャットAPI ");
    console.log("🧠 モデル: ", modelName);
    console.log("---");

    /** メッセージ */
    const currentMessageContent = messages[messages.length - 1].content;

    /** LangGraph */
    const result = await app.invoke({
      messages: currentMessageContent,
    });

    const text = result.contexts.join("\n");
    console.log("📈 LangGraph: \n" + text);

    return new Response(JSON.stringify(result));
  } catch (error) {
    if (error instanceof Error) {
      console.error("API 500 error: " + error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Unknown error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
