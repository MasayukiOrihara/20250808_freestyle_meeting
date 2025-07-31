import { RemoveMessage } from "@langchain/core/messages";
import {
  Annotation,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

import { runWithFallback, strParser } from "@/lib/models";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  CONVERSATION_SEARCH_PATH,
  getBaseUrl,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { requestApi } from "@/lib/utils";
import { ConversationMemory } from "@/lib/types";

let globalBaseUrl: string = "";
const CONVERSATION_SEARCHLIKE_PATH = "/api/supabase/conversation/searchLike/";

/** メッセージを挿入する処理 */
async function insertMessages(state: typeof GraphAnnotation.State) {
  const messages = state.messages;
  // 全取得
  const sessionId = state.sessionId;

  let conversationMessages: string[] = [];
  // conversation データ取得
  try {
    const conversation: string[] | null = await requestApi(
      globalBaseUrl,
      `${CONVERSATION_SEARCHLIKE_PATH}${sessionId}`
    );

    // userメッセージを分離
    if (conversation) {
      conversationMessages = conversation;

      return { conversationMessages: conversationMessages };
    }
  } catch (error) {
    console.warn("⚠️ DB から message を取得できませんでした。: " + error);
  }

  // DB からメッセージを取得できなかった場合
  conversationMessages = messages.map((msg) => `${msg.name}: ${msg.content}`);

  return { conversationMessages: conversationMessages };
}

/** 分析を行うかの判断処理 */
async function shouldAnalyze(state: typeof GraphAnnotation.State) {
  const conversationMessages = state.conversationMessages;

  if (conversationMessages.length > 0) return "analyzeNode";
  return "__end__";
}

/** 会話の分析処理 */
async function analyzeConversation(state: typeof GraphAnnotation.State) {
  const conversationMessages = state.conversationMessages;

  const PERSONAL_ANALYZE_PROMPT = `上記の入力は、ユーザー1人に対して4種類のAIとの会話の内容です。
  会話の流れがわかるように、この会話の議事録を簡潔に作成してください。`;

  // 要約処理
  const template =
    conversationMessages.join("\n") + "\n" + PERSONAL_ANALYZE_PROMPT;
  const prompt = PromptTemplate.fromTemplate(template);
  const response = await runWithFallback(prompt, {}, "invoke", strParser);
  const parsed = response.content;

  console.log("📂 議事録を作成しました" + parsed);

  // 要約したメッセージ除去
  const deleteMessages = state.messages
    .slice(0, -1)
    .map((m) => new RemoveMessage({ id: m.id! }));

  return { context: parsed, messages: deleteMessages };
}

// アノテーションの追加
const GraphAnnotation = Annotation.Root({
  sessionId: Annotation<string>(),
  conversationMessages: Annotation<string[]>(),
  context: Annotation<string>(),
  ...MessagesAnnotation.spec,
});

// グラフ
const workflow = new StateGraph(GraphAnnotation)
  // ノード追加
  .addNode("insertNode", insertMessages)
  .addNode("analyzeNode", analyzeConversation)

  // エッジ追加
  .addEdge("__start__", "insertNode")
  .addConditionalEdges("insertNode", shouldAnalyze)
  .addEdge("analyzeNode", "__end__");

// 記憶の追加
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

/**
 * ユーザー分析データ保存API
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.chatMessages;
    const threadId = body.sessionId ?? "analyze-abc123";

    // URL を取得
    const { baseUrl } = getBaseUrl(req);
    globalBaseUrl = baseUrl;

    console.log("📂 Analyze save API | ID: " + threadId);
    // 履歴用キー
    const config = { configurable: { thread_id: threadId } };
    const minutes = await app.invoke(
      { messages: messages, sessionId: threadId },
      config
    );

    return new Response(minutes.context, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("📂 Analyze Save API error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
