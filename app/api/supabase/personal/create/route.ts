import { UNKNOWN_ERROR } from "@/lib/contents";
import { supabaseClient } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const humanProfile = body.analyze;
    const sessionId = body.sessionId ?? "";

    // 1. Supabaseのテーブルに合う形式で整形
    const data = {
      ...humanProfile,
      personality_traits: humanProfile.personalityTraits,
      communication_preference: humanProfile.communicationPreference,
      prohibited_expressions: humanProfile.prohibitedExpressions,
      weekly_routine: humanProfile.weeklyRoutine,
      session_id: sessionId,
    };
    delete data.personalityTraits;
    delete data.communicationPreference;
    delete data.prohibitedExpressions;
    delete data.weeklyRoutine;

    // 2. データを Supabase に挿入
    const { error } = await supabaseClient()
      .from("human_profile")
      .upsert([data], {
        onConflict: "session_id",
      });

    // 挿入エラー
    if (error) {
      console.error("❌ human profile insart error:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log("🔥 supabase insert success");

    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🔥 supabase personal API GET error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
