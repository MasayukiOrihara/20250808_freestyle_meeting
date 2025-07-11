import {
  Annotation,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { checklist, ChecklistItem } from "./checklist";
import { initializeStatesNode } from "./node/initializeStatesNode";
import { LangsmithOutput, preprocessAINode } from "./node/preprocessAINode";
import { prepareContextNode } from "./node/prepareContextNode";

/** mentorAPIでの状態定義 */
export type MentorStates = {
  hasQuestion: boolean;
  count: number;
};

// チェックリスト
let checklistUse: ChecklistItem[][] = checklist.map((group) =>
  group.map((item) => ({ ...item }))
);

/**
 * ノード定義
 */
async function initializeStates(state: typeof MentorAnnotation.State) {
  console.log("🔧 初期設定ノード");

  const { count, step, hasQuestion } = await initializeStatesNode({
    count: state.count,
    checklist: checklistUse,
  });

  return {
    hasQuestion: hasQuestion,
    count: count,
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

  const { hasQuestion, checklist, contexts } = prepareContextNode({
    aiContexts: state.aiContexts,
    hasQuestion: state.hasQuestion,
    checklist: checklistUse,
  });

  checklistUse = checklist.map((group) => group.map((item) => ({ ...item })));
  return { hasQuestion: hasQuestion, contexts: contexts };
}

/** データを保存するノード */
async function saveData(state: typeof MentorAnnotation.State) {
  console.log("💾 データ保存ノード");

  if (state.hasQuestion) {
    state.count++;
  } else {
    // 初期化
    state.hasQuestion = true;
    state.count = 0;
  }

  return { hasQuestion: state.hasQuestion, count: state.count };
}

/**
 * グラフ定義
 */
const MentorAnnotation = Annotation.Root({
  contexts: Annotation<string[]>(),
  aiContexts: Annotation<LangsmithOutput>(),
  hasQuestion: Annotation<boolean>(),
  step: Annotation<number>(),
  count: Annotation<number>(),

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

// コンパイル 記憶の追加
const memory = new MemorySaver();
const app = MentorGraph.compile({ checkpointer: memory });

/**
 * チャット応答AI
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    console.log("💛 メンターグラフAPI ");
    console.log("---");

    /** メッセージ */
    const currentMessageContent = messages[messages.length - 1].content;

    /** LangGraph */
    const config = { configurable: { thread_id: "mentor-abc123" } };
    const results = await app.invoke(
      { messages: currentMessageContent },
      config
    );

    const text = results.contexts.join("\n");
    console.log("📈 LangGraph: \n" + text);

    return new Response(JSON.stringify(results));
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
