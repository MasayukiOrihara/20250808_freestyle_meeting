import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import {
  CONTEXT_PATH,
  getBaseUrl,
  MEMORY_PATH,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { runWithFallback } from "@/lib/models";
import { requestApi } from "@/lib/utils";

/**
 * 司会者 AI
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const assistantMessages = body.assistantLog ?? [];

    const { baseUrl } = getBaseUrl(req);

    console.log(" --- \n🎤 FACILITATOR API");
    console.log("session: " + body.sessionId);
    console.log("turns: " + body.count);

    console.log(assistantMessages);

    // 記憶のID用
    const threadId = "facilitator_" + body.sessionId;
    const turn = body.count;

    // メッセージ処理
    const currentUserMessage = messages[messages.length - 1].content;
    const memoryResPromise = requestApi(baseUrl, MEMORY_PATH, {
      method: "POST",
      body: {
        messages,
        threadId,
        turn,
      },
    });

    // プロンプトの確認
    const FACILITATOR_PROMPT = `"あなたは複数のAIを取りまとめ、ユーザーとの会話を進行させる司会者AIです。
    
    # キャラ性格
    - 名前：司会者ロボ
    - 性格：自分の感情を交えずに淡々としている。少しロボっぽい。
    - 口調：ですます口調。
    
    # 指示
    - userから次の返答を得るために、userに質問を投げかけてください。
    - 質問は他のAIの返答を汲み、現在の話題から会話が続くようにしてください。
    - 出力は80文字程度です。
    
    # context
    {context}
    
    Current conversation: ---  
    {history}
    ---

    AI: 
    {ai_message} 
    
    user: {user_message}
    
    assistant: `;
    const prompt = PromptTemplate.fromTemplate(FACILITATOR_PROMPT);

    // コンテキストの取得
    let context = "";
    try {
      context = await requestApi(baseUrl, CONTEXT_PATH);
    } catch (error) {
      console.warn("🎤 コンテキストが取得できませんでした: " + error);
    }

    // 過去履歴の同期
    let memory: string[] = [];
    try {
      memory = await memoryResPromise;

      console.log("💿 記憶 ---");
      console.log(memory);
      console.log(" --- ");
    } catch (error) {
      console.warn("🎤 会話記憶が取得できませんでした: " + error);
    }

    // ストリーム
    const stream = await runWithFallback(
      prompt,
      {
        context: context,
        history: memory,
        ai_message: assistantMessages,
        user_message: currentUserMessage,
      },
      "stream"
    );

    console.log("🎤 COMPLITE \n --- ");
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🎤 FACILITATOR API error :" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
