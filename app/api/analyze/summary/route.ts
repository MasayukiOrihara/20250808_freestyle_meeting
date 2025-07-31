import {
  getBaseUrl,
  PERSONAL_SEARCH_PATH,
  UNKNOWN_ERROR,
} from "@/lib/contents";
import { runWithFallback, strParser } from "@/lib/models";
import { requestApi } from "@/lib/utils";
import { PromptTemplate } from "@langchain/core/prompts";
import { HumanProfile } from "../personal";
import isEqual from "lodash/isEqual";

// 簡易記録装置
let oldAnalyze: HumanProfile;
let context = "";

/** ユーザーのプロファイル作成 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;

    const { baseUrl } = getBaseUrl(req);

    // データ取得
    const analyze: HumanProfile = await requestApi(
      baseUrl,
      `${PERSONAL_SEARCH_PATH}${sessionId}`
    );

    // 要約実施
    if (analyze && !isEqual(oldAnalyze, analyze)) {
      const template = `以下のユーザープロファイルからどのような人物か、具体的な文章として要約してください。
      分からない部分や情報が提供されてない部分は出力しないでください。

      {analyze_context}`;

      const prompt = PromptTemplate.fromTemplate(template);
      const response = await runWithFallback(
        prompt,
        { analyze_context: analyze },
        "invoke",
        strParser
      );
      context = response.content;
      oldAnalyze = analyze;
      console.log("📂 要約を実行しました。");
    }

    console.log(context);
    return Response.json(context, {
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("📂 Supabase Conversation/generate API POST error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
