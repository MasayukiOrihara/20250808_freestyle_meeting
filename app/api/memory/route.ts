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
  getConversasionSearchSummary,
  getMessagSearch,
  postConversasionGenerate,
  postConversasionMessages,
  postConversasionSaveSummary,
} from "@/lib/api";
import { formatContent, formatConversation } from "./utils";

// 定数
const SUMMARY_MAX_COUNT = 6;

/** メッセージを取得する処理 */
async function insartMessage(state: typeof GraphAnnotation.State) {
  const formatted: string[] = [];
  let summary = state.summary;

  // conversation テーブルを参照
  let conversationId: string = await getConversasionSearch(state.sessionId);
  if (!conversationId) {
    // もし取得できなかった場合、新たにconversationを作成する
    conversationId = await postConversasionGenerate(state.sessionId);
    return { formatted: formatted };
  }
  // DB に会話要約の確認
  if (!summary) {
    const savedSummary = await getConversasionSearchSummary(conversationId);
    if (savedSummary) summary = savedSummary;
    console.log("取得した要約: " + savedSummary);
  }

  // DB からメッセージをx件取得する
  const count = state.turn % SUMMARY_MAX_COUNT;
  const latestMessage: string = await getMessagSearch(conversationId, count);

  return {
    formatted: [...formatted, ...latestMessage],
    summary: summary,
    conversationId: conversationId,
  };
}

/** メッセージを DB に登録する処理 */
async function storeMessage(state: typeof GraphAnnotation.State) {
  const messages = state.messages;
  const formatted: string[] = state.formatted;

  // messages テーブルに保存
  const { roles, contents } = formatContent(messages, state.sessionId);
  const length = Math.min(roles.length, contents.length);
  for (let i = 0; i < length; i++) {
    await postConversasionMessages(state.conversationId, roles[i], contents[i]);
  }

  // 加工後のメッセージを追加する
  const formattedMessages: string[] = formatConversation(roles, contents);

  // 使った messages は初期化
  const deleteMessages = messages.map((m) => new RemoveMessage({ id: m.id! }));
  return {
    messages: deleteMessages,
    formatted: [...formatted, ...formattedMessages],
  };
}

/** 会話を行うか要約するかの判断処理 */
async function shouldContenue(state: typeof GraphAnnotation.State) {
  const should = (state.turn + 1) % SUMMARY_MAX_COUNT === 0;
  if (should) return "summarize";
  return "marge";
}

/** 会話の要約生成 */
async function summarizeConversation(state: typeof GraphAnnotation.State) {
  let summary = state.summary;

  // プロンプトの作成
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
  console.log("🐶 ai に何の文章ツッコむか確認" + formatted);
  const response = await OpenAi4_1Mini.invoke(formatted);
  console.log("🐶 要約確認" + response.content);

  return { summary: response.content };
}

/** 要約したメッセージを追加する処理 */
async function prepareSummary(state: typeof GraphAnnotation.State) {
  const summary = state.summary;

  // 要約をシステムメッセージとして追加
  const systemMessage = `Previous conversation summary: ${summary}`;
  const messages = [new SystemMessage(systemMessage)];

  // フォーマット
  const { roles, contents } = formatContent(messages, state.sessionId);
  const conversation: string[] = formatConversation(roles, contents);

  // DBに追加
  const id = await getConversasionSearch(state.sessionId);
  await postConversasionSaveSummary(id, conversation.join(""));
}

/** 要約文と会話文の合成 */
async function margeSummaryAndFormatted(state: typeof GraphAnnotation.State) {
  const summary = state.summary;
  const formatted = state.formatted;

  let conversation;
  if (summary) {
    conversation = [summary, ...formatted];
  } else {
    conversation = [...formatted];
  }

  console.log("要約" + summary);
  console.log("最終出力: " + conversation);

  return { formatted: conversation };
}

// アノテーションの追加
const GraphAnnotation = Annotation.Root({
  formatted: Annotation<string[]>(),
  summary: Annotation<string>(),
  sessionId: Annotation<string>(),
  turn: Annotation<number>(),
  conversationId: Annotation<string>(),

  ...MessagesAnnotation.spec,
});

// グラフ
const workflow = new StateGraph(GraphAnnotation)
  // ノード追加
  .addNode("insart", insartMessage)
  .addNode("save", storeMessage)
  .addNode("prepare", prepareSummary)
  .addNode("summarize", summarizeConversation)
  .addNode("marge", margeSummaryAndFormatted)

  // エッジ追加
  .addEdge("__start__", "insart")
  .addEdge("insart", "save")
  .addConditionalEdges("save", shouldContenue)
  .addEdge("summarize", "prepare")
  .addEdge("prepare", "marge")
  .addEdge("marge", "__end__");

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
    const turn = body.turn ?? 0;

    // 2行取得
    const len = messages.length;
    const previousMessage: BaseMessage[] = messages.slice(
      Math.max(0, len - 2),
      len
    );

    // 履歴用キー
    const config = { configurable: { thread_id: threadId } };
    const results = await app.invoke(
      { messages: previousMessage, sessionId: threadId, turn: turn },
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
