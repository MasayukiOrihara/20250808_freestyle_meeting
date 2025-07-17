import { RemoveMessage, SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

import { OpenAi4_1Mini } from "@/lib/models";
import { formattedMessage } from "./utils";
import {
  local,
  MEMORY_SUMMARY_PROMPT,
  MEMORY_UPDATE_PROMPT,
} from "@/lib/contents";
import { getConversasionSearch, postConversasionGenerate } from "@/lib/api";

/** メッセージを挿入する処理 */
async function insertMessages(state: typeof GraphAnnotation.State) {
  const messages = state.messages;

  // メッセージを DB に登録する
  const conversation = await getConversasionSearch(state.sessionId);
  if (!conversation) {
    // もし取得できなかった場合、新たにconversationを登録する
    await postConversasionGenerate(state.sessionId);
  }
  console.log("- メッセージ -");
  console.log(messages);

  return { messages: messages };
}

/** 要約したメッセージを追加する処理 */
async function prepareMessages(state: typeof GraphAnnotation.State) {
  const summary = state.summary;
  // 要約をシステムメッセージとして追加
  const systemMessage = `Previous conversation summary: ${summary}`;
  const messages = [new SystemMessage(systemMessage)];

  return { messages: messages };
}

/** 会話を行うか要約するかの判断処理 */
async function shouldContenue(state: typeof GraphAnnotation.State) {
  const messages = state.messages;

  if (messages.length > 6) return "summarize";
  return "__end__";
}

/** 会話の要約処理 */
async function summarizeConversation(state: typeof GraphAnnotation.State) {
  const summary = state.summary;

  let summaryMessage;

  if (summary) {
    summaryMessage = MEMORY_UPDATE_PROMPT.replace("{summary}", summary);
  } else {
    summaryMessage = MEMORY_SUMMARY_PROMPT;
  }

  // 要約処理
  const messages = [...state.messages, new SystemMessage(summaryMessage)];
  const response = await OpenAi4_1Mini.invoke(messages);

  // 要約したメッセージ除去
  const deleteMessages = messages
    .slice(0, -2)
    .map((m) => new RemoveMessage({ id: m.id! }));
  return { summary: response.content, messages: deleteMessages };
}

// アノテーションの追加
const GraphAnnotation = Annotation.Root({
  summary: Annotation<string>(),
  sessionId: Annotation<string>(),
  ...MessagesAnnotation.spec,
});

// グラフ
const workflow = new StateGraph(GraphAnnotation)
  // ノード追加
  .addNode("insert", insertMessages)
  .addNode("prepare", prepareMessages)
  .addNode("summarize", summarizeConversation)

  // エッジ追加
  .addEdge("__start__", "insert")
  .addConditionalEdges("insert", shouldContenue)
  .addEdge("summarize", "prepare")
  .addEdge("prepare", "__end__");

// 記憶の追加
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });
const cacheIdList: string[] = [];

/**
 * 会話履歴要約API
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const threadId = body.threadId ?? "memory-abc123";

    // 2行取得
    const len = messages.length;
    const previousMessage = messages.slice(Math.max(0, len - 2), len);

    // 履歴用キー
    const config = { configurable: { thread_id: threadId } };
    const results = await app.invoke(
      { messages: previousMessage, sessionId: threadId },
      config
    );

    // 会話履歴を記録した id をため込む
    const haveNotId = cacheIdList.every((id) => id !== threadId);
    if (haveNotId) {
      cacheIdList.push(threadId);
    }

    // 履歴メッセージの加工
    const conversation = formattedMessage(results.messages, threadId);

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

/**
 * すべての会話履歴要約API
 * @returns
 */
export async function GET() {
  try {
    if (cacheIdList && cacheIdList.length > 0) {
      for (const cache of cacheIdList) {
        const config = { configurable: { thread_id: cache } };
        const savedState = await memory.get(config);

        console.log(savedState);
      }
    }
    return new Response(JSON.stringify("conversation"), {
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
