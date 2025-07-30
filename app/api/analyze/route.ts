import { RemoveMessage, SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";

import { jsonParser, runWithFallback, strParser } from "@/lib/models";
import {
  validateProfile,
  HumanProfile,
  humanProfileDescriptions,
} from "./personal";
import { PromptTemplate } from "@langchain/core/prompts";
import { getBaseUrl, PERSONAL_CREATE_PATH } from "@/lib/contents";
import { requestApi } from "@/lib/utils";

// /** メッセージを挿入する処理 */
async function insertMessages(state: typeof GraphAnnotation.State) {
  console.log("📩 insart messages");

  console.log(state.messages);
  const messages = state.messages;

  return { messages };
}

/** 分析を行うかの判断処理 */
async function shouldAnalyze(state: typeof GraphAnnotation.State) {
  console.log("❓ should analyze");
  const messages = state.messages;

  if (messages.length > 3) return "analyzeNode";
  return "__end__";
}

/** 会話の分析処理 */
async function analyzeConversation(state: typeof GraphAnnotation.State) {
  console.log("📃 analyze conversation");
  let analyzeContext = state.analyze;

  let analyzeMessage;
  if (analyzeContext) {
    analyzeMessage = `これまでのユーザー分析: {analyzeContext}
    
    上記の新しいメッセージを考慮してユーザー分析を拡張してください。
    以下のフォーマットに従って、これまでのユーザー分析に追記、もしくは発展する形で更新して、出力をJSON形式で生成してください。
    
    出力形式：
      {humanProfileDescriptions} `;
  } else {
    analyzeMessage = `上記の入力からユーザーの情報や趣味趣向や特徴などを分析し、パーソナル情報として記録してください。 
  以下のフォーマットに従って、出力をJSON形式で生成してください。
  情報が読み取れなかった場合は空欄で出力してください。

  出力形式：
    {humanProfileDescriptions}`;
  }

  // 要約処理
  const messages =
    state.messages.map((msg) => msg.content).join("\n") + "\n" + analyzeMessage;
  const prompt = PromptTemplate.fromTemplate(messages);
  const response = await runWithFallback(
    prompt,
    {
      analyzeContext: analyzeContext,
      humanProfileDescriptions: humanProfileDescriptions,
    },
    "invoke",
    jsonParser
  );
  // const json = JSON.parse(response.content);
  const parsed = await jsonParser.parse(response.content);

  const validProfile = validateProfile(parsed);
  if (validProfile) analyzeContext = validProfile;

  // 要約したメッセージ除去
  const deleteMessages = state.messages
    .slice(0, -1)
    .map((m) => new RemoveMessage({ id: m.id! }));

  return { analyze: analyzeContext, messages: deleteMessages };
}

async function generateUserText(state: typeof GraphAnnotation.State) {
  const analyzeContext = state.analyze;

  let context = "";
  if (analyzeContext) {
    const template = `以下のユーザー分析をほかの LLM が情報を扱いやすいように具体的な文章として要約してください。\n\n{analyze_context}`;

    const prompt = PromptTemplate.fromTemplate(template);
    context = await runWithFallback(
      prompt,
      { analyze_context: analyzeContext },
      "invoke",
      strParser
    );
  }
  const messages = [...state.messages, new SystemMessage(context)];
  return { context: context, messages: messages };
}

// アノテーションの追加
const GraphAnnotation = Annotation.Root({
  analyze: Annotation<HumanProfile>(),
  context: Annotation<string>(),
  ...MessagesAnnotation.spec,
});

// グラフ
const workflow = new StateGraph(GraphAnnotation)
  // ノード追加
  .addNode("insertNode", insertMessages)
  .addNode("analyzeNode", analyzeConversation)
  .addNode("textNode", generateUserText)

  // エッジ追加
  .addEdge("__start__", "insertNode")
  .addConditionalEdges("insertNode", shouldAnalyze)
  .addEdge("analyzeNode", "textNode")
  .addEdge("textNode", "__end__");

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
    const userMessages = body.userMessages;
    const threadId = body.sessionId ?? "analyze-abc123";
    const { baseUrl } = getBaseUrl(req);

    console.log("📂 Analize API | ID: " + threadId);
    const currentUserMessages = userMessages[userMessages.length - 1];
    // 履歴用キー
    const config = { configurable: { thread_id: threadId } };
    const results = await app.invoke({ messages: currentUserMessages }, config);

    // DB への追加
    const analyzeData = results.analyze;
    if (analyzeData) {
      await requestApi(baseUrl, PERSONAL_CREATE_PATH, {
        method: "POST",
        body: { analyzeData, threadId },
      });
    }

    return Response.json(results, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("📂 Analize API error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
