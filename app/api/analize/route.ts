import { RemoveMessage, SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

import { OpenAi4_1Mini } from "@/lib/models";

/** メッセージを挿入する処理 */
async function insartMessages(state: typeof GraphAnnotation.State) {
  console.log("📩 insart messages");
}

/** 要約したメッセージを追加する処理 */
async function prepareMessages(state: typeof GraphAnnotation.State) {
  console.log("📧 prepare messages");
}

/** 会話を行うか要約するかの判断処理 */
async function shouldContenue(state: typeof GraphAnnotation.State) {
  console.log("❓ should contenue");
}

/** 会話の要約処理 */
async function summarizeConversation(state: typeof GraphAnnotation.State) {
  console.log("📃 summarize conversation");
}

// アノテーションの追加
const GraphAnnotation = Annotation.Root({
  summary: Annotation<string>(),
  ...MessagesAnnotation.spec,
});

// グラフ
const workflow = new StateGraph(GraphAnnotation)
  // ノード追加
  .addNode("insart", insartMessages)
  .addNode("prepare", prepareMessages)
  .addNode("summarize", summarizeConversation)

  // エッジ追加
  .addEdge("__start__", "insart")
  .addEdge("summarize", "prepare")
  .addEdge("prepare", "__end__");

// 記憶の追加
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

/**
 * 会話履歴要約API
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    // 履歴用キー
    const config = { configurable: { thread_id: "abc123" } };
    const results = await app.invoke({ messages: messages }, config);

    // 履歴メッセージの加工
    const conversation = [];
    for (const message of results.messages) {
      const content = String(message.content).replace(/\r?\n/g, "");

      switch (message.getType()) {
        case "human":
          conversation.push(`user: ${content}`);
          break;
        case "ai":
          conversation.push(`assistant: ${content}`);
          break;
        default:
          conversation.push(`${content}`);
      }
    }

    return new Response(JSON.stringify(conversation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error) {
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
