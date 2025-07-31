import { RemoveMessage } from "@langchain/core/messages";
import {
  Annotation,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

import { jsonParser, runWithFallback } from "@/lib/models";
import {
  validateProfile,
  HumanProfile,
  humanProfileDescriptions,
} from "../personal";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  CONVERSATION_SEARCH_PATH,
  getBaseUrl,
  PERSONAL_CREATE_PATH,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { requestApi } from "@/lib/utils";
import { ConversationMemory } from "@/lib/types";

let globalBaseUrl: string = "";

/** メッセージを挿入する処理 */
async function insertMessages(state: typeof GraphAnnotation.State) {
  const messages = state.messages;
  // ※※ sessionID の命名規則が personaAI名 + セッションID のため、とりあえず コメントAI から取得
  const sessionId = "comment_" + state.sessionId;

  let userMessages: string[] = [];
  // conversation データ取得
  try {
    const conversation: ConversationMemory | null = await requestApi(
      globalBaseUrl,
      `${CONVERSATION_SEARCH_PATH}${sessionId}`,
      { method: "POST", body: { count: 1000 } }
    );
    // userメッセージを分離
    if (conversation) {
      userMessages = conversation.messages
        .filter((msg) => msg.role === "user")
        .map((msg) => msg.content);
      return { userMessages: userMessages };
    }
  } catch (error) {
    console.warn("⚠️ DB から message を取得できませんでした。: " + error);
  }

  // DB からメッセージを取得できなかった場合
  const contents = messages.map((msg) => msg.content);
  userMessages = contents.map((c) => c.toString());

  return { userMessages: userMessages };
}

/** 分析を行うかの判断処理 */
async function shouldAnalyze(state: typeof GraphAnnotation.State) {
  const userMessages = state.userMessages;

  if (userMessages.length > 0) return "analyzeNode";
  return "__end__";
}

/** 会話の分析処理 */
async function analyzeConversation(state: typeof GraphAnnotation.State) {
  console.log("📂 analyze conversation");
  const userMessages = state.userMessages;
  let humanProfile = state.humanProfile;

  const PERSONAL_ANALYZE_PROMPT = `上記の入力からユーザーの情報や趣味趣向や特徴などを分析し、パーソナル情報として記録してください。 
  以下のフォーマットに従って、出力をJSON形式で生成してください。
  情報が読み取れなかった場合は空欄で出力してください。

  出力形式：
    {humanProfileDescriptions}`;

  // 要約処理
  const template = userMessages.join("\n") + "\n" + PERSONAL_ANALYZE_PROMPT;
  const prompt = PromptTemplate.fromTemplate(template);
  const response = await runWithFallback(
    prompt,
    {
      humanProfileDescriptions: humanProfileDescriptions,
    },
    "invoke",
    jsonParser
  );
  const parsed = await jsonParser.parse(response.content);

  const validProfile = validateProfile(parsed);
  if (validProfile) humanProfile = validProfile;

  // 要約したメッセージ除去
  const deleteMessages = state.messages
    .slice(0, -1)
    .map((m) => new RemoveMessage({ id: m.id! }));

  return { humanProfile: humanProfile, messages: deleteMessages };
}

async function updateDatabase(state: typeof GraphAnnotation.State) {
  const humanProfile = state.humanProfile;
  const sessionId = state.sessionId;

  // DB への追加
  try {
    if (humanProfile) {
      await requestApi(globalBaseUrl, PERSONAL_CREATE_PATH, {
        method: "POST",
        body: { humanProfile, sessionId },
      });
    }
  } catch (error) {
    console.warn("⚠️ DB を更新できませんでした。: " + error);
  }
}

// アノテーションの追加
const GraphAnnotation = Annotation.Root({
  humanProfile: Annotation<HumanProfile>(),
  sessionId: Annotation<string>(),
  userMessages: Annotation<string[]>(),
  context: Annotation<string>(),
  ...MessagesAnnotation.spec,
});

// グラフ
const workflow = new StateGraph(GraphAnnotation)
  // ノード追加
  .addNode("insertNode", insertMessages)
  .addNode("analyzeNode", analyzeConversation)
  .addNode("updateNode", updateDatabase)

  // エッジ追加
  .addEdge("__start__", "insertNode")
  .addConditionalEdges("insertNode", shouldAnalyze)
  .addEdge("analyzeNode", "updateNode")
  .addEdge("updateNode", "__end__");

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
    const userMessages = body.userMessages;
    const threadId = body.sessionId ?? "analyze-abc123";

    // URL を取得
    const { baseUrl } = getBaseUrl(req);
    globalBaseUrl = baseUrl;

    console.log("📂 Analyze save API | ID: " + threadId);
    // 履歴用キー
    const config = { configurable: { thread_id: threadId } };
    await app.invoke({ messages: userMessages, sessionId: threadId }, config);

    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("📂 Analyze Save API error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
