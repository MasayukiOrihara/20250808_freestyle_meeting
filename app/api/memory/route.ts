import {
  BaseMessage,
  RemoveMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  Annotation,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

import { OpenAi4_1Mini } from "@/lib/models";
import {
  local,
  MEMORY_SUMMARY_PROMPT,
  MEMORY_UPDATE_PROMPT,
} from "@/lib/contents";
import {
  getConversasionSearch,
  getMessagSearch,
  postConversasionGenerate,
  postConversasionMessages,
} from "@/lib/api";
import { formatContent, formatConversation } from "./utils";

// 定数
const SUMMARY_MAX_COUNT = 8;

/** メッセージを取得する処理 */
async function insartMessage(state: typeof GraphAnnotation.State) {
  const formatted: string[] = [];
  const messages = state.messages;

  console.log("===insartMessage===");
  console.log(messages);
  console.log("======");

  // conversation テーブルを参照
  let conversationId: string = await getConversasionSearch(state.sessionId);
  if (!conversationId) {
    // もし取得できなかった場合、新たにconversationを作成する
    conversationId = await postConversasionGenerate(state.sessionId);
    return { formatted: formatted };
  }

  // DB からメッセージをx件取得する
  const latestTwoMessage: string = await getMessagSearch(conversationId, 3);
  console.log("🐶 latestTwoMessage: ");
  console.log(latestTwoMessage);
  return { formatted: [...formatted, ...latestTwoMessage] };
}

/** メッセージを DB に登録する処理 */
async function storeMessage(state: typeof GraphAnnotation.State) {
  const messages = state.messages;
  const formatted: string[] = state.formatted;
  console.log("===storeMessage===");
  console.log(messages);
  console.log("======");

  // conversation テーブルを参照
  let conversationId: string = await getConversasionSearch(state.sessionId);
  if (!conversationId) {
    // もし取得できなかった場合、新たにconversationを作成する
    conversationId = await postConversasionGenerate(state.sessionId);
  }

  // messages テーブルに保存
  const { roles, contents } = formatContent(messages, state.sessionId);
  const length = Math.min(roles.length, contents.length);
  for (let i = 0; i < length; i++) {
    await postConversasionMessages(conversationId, roles[i], contents[i]);
  }

  // 加工後のメッセージを追加する
  const formattedMessages: string[] = formatConversation(roles, contents);

  console.log("======");
  console.log(formattedMessages);
  console.log("======");

  console.log("🐶: ");
  console.log(formatted);
  // 使った messages は初期化
  const deleteMessages = messages.map((m) => new RemoveMessage({ id: m.id! }));
  return {
    messages: deleteMessages,
    formatted: [...formatted, ...formattedMessages],
  };
}

/** 要約したメッセージを追加する処理 */
async function prepareMessages(state: typeof GraphAnnotation.State) {
  const summary = state.summary;

  // 要約をシステムメッセージとして追加
  const systemMessage = `Previous conversation summary: ${summary}`;
  const messages = [new SystemMessage(systemMessage)];

  // フォーマット
  const { roles, contents } = formatContent(messages, state.sessionId);
  const conversation: string[] = formatConversation(roles, contents);

  console.log("🐶: " + state.formatted);
  return { formatted: [...conversation] };
}

/** 会話を行うか要約するかの判断処理 */
async function shouldContenue(state: typeof GraphAnnotation.State) {
  const formatted = state.formatted;

  console.log("🐶: " + formatted);
  if (formatted.length > SUMMARY_MAX_COUNT) return "summarize";
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
  const messages = [new SystemMessage(summaryMessage)];
  const { roles, contents } = formatContent(messages, state.sessionId);
  const conversation: string[] = formatConversation(roles, contents);

  const formatted = [...state.formatted, ...conversation];
  const response = await OpenAi4_1Mini.invoke(formatted);

  return { summary: response.content };
}

// アノテーションの追加
const GraphAnnotation = Annotation.Root({
  formatted: Annotation<string[]>(),
  summary: Annotation<string>(),
  sessionId: Annotation<string>(),

  ...MessagesAnnotation.spec,
});

// グラフ
const workflow = new StateGraph(GraphAnnotation)
  // ノード追加
  .addNode("insart", insartMessage)
  .addNode("save", storeMessage)
  .addNode("prepare", prepareMessages)
  .addNode("summarize", summarizeConversation)

  // エッジ追加
  .addEdge("__start__", "insart")
  .addEdge("insart", "save")
  .addConditionalEdges("save", shouldContenue)
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
    const previousMessage: BaseMessage[] = messages.slice(
      Math.max(0, len - 2),
      len
    );

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

    console.log(results.formatted);

    return new Response(JSON.stringify(results.formatted), {
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
