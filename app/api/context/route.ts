import { local } from "@/lib/contents";

/**
 * コンテキストを作成し取得する
 * @param req
 * @returns
 */
export async function GET() {
  try {
    console.log("🧻 コンテキスト");
    // 日にち
    const dateRes = await fetch(local + "api/information/date");
    const dateData = await dateRes.json();
    // 場所
    const locationRes = await fetch(local + "api/information/location");
    const locationData = await locationRes.json();
    // 言語
    const languageRes = await fetch(local + "api/information/language");
    const languageData = await languageRes.json();
    // 会話履歴
    // const memoryRes = await fetch(local + "api/memory");
    // const memoryData = await memoryRes.json();

    // とりあえず集約してみる
    const data: string[] = [];
    data.push(dateData);
    data.push(locationData);
    data.push(languageData);

    return Response.json(data, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
