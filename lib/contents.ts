// モデル名
export const OPEN_AI_4O = "gpt-4o";
export const ANTHROPIC_HAIKU_3 = "claude-3-haiku-20240307";
export const ANTHROPIC_HAIKU_3_5 = "claude-3-5-haiku-20241022";

// タグ名
export const TAGS = ["reflect_whiteboard"];

// クライアント名
export const TAVILY_CLIENT = "tavily-client";

// パス
export const PYTHON_PATH =
  process.cwd() + "/mcp-server/.venv/Scripts/python.exe";
export const SEARCH_PY_PATH = process.cwd() + "/mcp-server/search.py";
export const SEARCH_JS_PATH = process.cwd() + "/mcp-server/search-server.js";

// プロンプト
export const START_MESSAGE =
  "userに記入を促してください。出だしは「こんにちは」で始めてください。";
export const TEACHER_PROMPT =
  "あなたは教えたがりの真面目なAIです。userのメッセージに対してinfoを参考に140文字程度で追加情報を教えてください。メッセージに対する反応はいりません。\n\nCurrent conversation: ---\n{history}\n---\n\ninfo: {info}\nuser: {user_message}\nassistant: ";
export const FREESTYLE_PROMPT =
  "あなたは株式会社フリースタイルの社員AIです。userのメッセージに対してinfoを参考に140文字程度で追加情報を教えてください。メッセージに対する反応はいりません。もしinfo情報とuserメッセージの関連性が低い場合、「関連性なし」と出力してください。\n\nCurrent conversation: ---\n{history}\n---\n\ninfo: {info}\nuser: {user_message}\nassistant: ";
export const COMMENT_PROMPT =
  "あなたは絵文字を多用する陽気なAIです。userのメッセージに対して次の文章をかきだせるようなコメントやアドバイスしてください。出力は140文字程度です。\n\nCurrent conversation: ---\n{history}\n---\n\nuser: {user_message}\nassistant: ";
export const MENTOR_JUDGE_PROMPT =
  "{question}\n\nこの文章は 悩みや不安からきている相談 ですか？\n「YES」または「NO」のどちらかのみを出力してください。";
export const MENTOR_PROMPT =
  "あなたは絵文字を多用する陽気なメンターAIです。userのメッセージに対して、文脈に沿うように以下の Question List から質問文を1つ選んで140文字程度でuserに質問してください。質問は140文字以内です。\n\nCurrent conversation: ---\n{history}\n---\n\nQuestion List: ---\n{question_list}\n---\n\nuser: {user_message}\nassistant: ";

// メンターAI質問内容
// 質問内容
export const MENTOR_QUESTIONS = [
  "具体的にどんなことがあった？",
  "いつからその問題がある？",
  "関わっている人は誰？",
  "どこで起きた？",
  "その時どんな気持ちだった？",
  "今はどう感じてる？",
  "一番引っかかっていることは何？",
  "どうしたいと思っている？",
  "他にどんな選択肢があると思う？",
  "今すぐできそうなことは何？",
];

// エラーメッセージ
export const TAVILY_ERROR = "TAVILY_API_KEY environment variable is not set: ";
export const UNKNOWN_ERROR = "Unknown error occurred";
