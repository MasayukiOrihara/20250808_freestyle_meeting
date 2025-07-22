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
  postConversasionGenerate,
  postConversasionSave,
  postConversasionSearch,
} from "@/lib/api";
import { formatContent, formatConversation } from "./utils";
import { ConversationMemory, MessageMemory } from "@/lib/types";

// 定数
const SUMMARY_MAX_COUNT = 6;

/** メッセージをDBから取得する処理 */
async function loadConversation(state: typeof GraphAnnotation.State) {
  const formatted: string[] = [];
  let summary = state.summary;
  const count = state.turn % SUMMARY_MAX_COUNT;

  // conversation データ取得
  const conversation: ConversationMemory = await postConversasionSearch(
    state.sessionId,
    count
  );

  console.log("🐶 conversationId" + conversation);
  let conversationId;
  if (conversation) {
    conversationId = conversation.id;
  } else {
    // もし取得できなかった場合、新たにconversationを作成する
    conversationId = await postConversasionGenerate(state.sessionId);
    return { formatted: formatted, conversationId: conversationId };
  }

  // 会話要約の確認
  if (!summary) {
    const savedSummary = conversation.summary;
    if (savedSummary && savedSummary != "") summary = savedSummary;
  }

  // メッセージをx件取得する
  const latestMessages = conversation.messages
    .reverse()
    .map((msg) => `${msg.role}: ${msg.content}`);

  return {
    formatted: [...formatted, ...latestMessages],
    summary: summary,
    conversationId: conversationId,
  };
}

/** 会話を行うか要約するかの判断処理 */
async function shouldContenue(state: typeof GraphAnnotation.State) {
  const should = (state.turn + 1) % SUMMARY_MAX_COUNT === 0;
  if (should) return "summarize";
  return "store";
}

/** メッセージを DB に登録する処理 */
async function storeConversation(state: typeof GraphAnnotation.State) {
  const messages = state.messages;
  const formatted: string[] = state.formatted;

  // messages テーブルに保存
  const { roles, contents } = formatContent(messages, state.sessionId);
  const length = Math.min(roles.length, contents.length);

  // メッセージの作成
  const arrMessage = [];
  let message: MessageMemory;
  for (let i = 0; i < length; i++) {
    message = { role: roles[i], content: contents[i] };
    arrMessage.push(message);
  }
  // Conversation の作成
  const conversation: ConversationMemory = {
    id: state.conversationId,
    summary: state.summary,
    messages: arrMessage,
  };

  await postConversasionSave(conversation);

  // 加工後のメッセージを追加する
  const formattedMessages: string[] = formatConversation(roles, contents);

  // 使った messages は初期化
  const deleteMessages = messages.map((m) => new RemoveMessage({ id: m.id! }));
  return {
    messages: deleteMessages,
    formatted: [...formatted, ...formattedMessages],
  };
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
  const response = await OpenAi4_1Mini.invoke(formatted);

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
  const conversation = formatConversation(roles, contents);

  return { summary: conversation.join("") };
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
  .addNode("load", loadConversation)
  .addNode("store", storeConversation)
  .addNode("prepare", prepareSummary)
  .addNode("summarize", summarizeConversation)
  .addNode("marge", margeSummaryAndFormatted)

  // エッジ追加
  .addEdge("__start__", "load")
  .addConditionalEdges("load", shouldContenue)
  .addEdge("summarize", "prepare")
  .addEdge("prepare", "store")
  .addEdge("store", "marge")
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
