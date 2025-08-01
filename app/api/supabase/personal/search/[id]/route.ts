import { HumanProfile } from "@/app/api/analyze/personal";
import { UNKNOWN_ERROR } from "@/lib/contents";
import { supabaseClient } from "@/lib/models";

/** supabase から保存してた human_profile を取り出す */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // セッション ID

    // DB から読み込み
    const { data, error } = await supabaseClient()
      .from("human_profile")
      .select("*")
      .eq("session_id", id)
      .maybeSingle();

    // 読み込みエラー: PGRST116 = no rows found
    if (error && error?.code !== "PGRST116") {
      console.error("Supabase query error:", error);
      return Response.json({ error: error?.message }, { status: 500 });
    }

    // データ変換
    const humanProfile: HumanProfile = {
      ...data,
      personalityTraits: data.personality_traits,
      communicationPreference: data.communication_preference,
      prohibitedExpressions: data.prohibited_expressions,
      weeklyRoutine: data.weekly_routine,
    };

    return Response.json(humanProfile, {
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🔥 supabase personal search API GET error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
