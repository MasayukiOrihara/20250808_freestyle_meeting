// モデル名
export const OPEN_AI_4O = "gpt-4o";
export const OPEN_AI_4O_MINI = "gpt-4o-mini";
export const ANTHROPIC_HAIKU_3 = "claude-3-haiku-20240307";
export const ANTHROPIC_HAIKU_3_5 = "claude-3-5-haiku-20241022";
export const ANTHROPIC_OPUS_4 = "claude-opus-4-20250514";
export const ANTHROPIC_SONNET_4 = "claude-sonnet-4-20250514";
export const ANTHROPIC_SONNET_3_7 = "claude-3-7-sonnet-20250219";

// タグ名
export const TAGS = ["reflect_whiteboard"];

// クライアント名
export const TAVILY_CLIENT = "tavily-client";

// パス
export const PYTHON_PATH =
  process.cwd() + "/mcp-server/.venv/Scripts/python.exe";
export const SEARCH_PY_PATH = process.cwd() + "/mcp-server/search.py";
export const SEARCH_JS_PATH = process.cwd() + "/mcp-server/search-server.js";

// アイコンパス
export const CAT_ICON_PATH = "/icon/cat_comment.png";
export const DOG_ICON_PATH = "/icon/dog_teacher.png";
export const OWL_ICON_PATH = "/icon/owl_mentor.png";
export const DUMMY_ICON_PATH = "/icon/human_dummy.png";

// プロンプト
export const START_MESSAGE =
  "userに記入を促してください。出だしは「こんにちは」で始めてください。";
export const TEACHER_PROMPT =
  "あなたは必ず補足情報を付けて説明する教えたがりの真面目なAIです。userのメッセージに対してinfoを参考に140文字程度で追加情報を教えてください。メッセージに対する反応はいりません。\n\nCurrent conversation: ---\n{history}\n---\n\ninfo: {info}\nuser: {user_message}\nassistant: ";
export const FREESTYLE_PROMPT =
  "あなたは株式会社フリースタイルの社員AIです。userのメッセージに対してinfoを参考に140文字程度で追加情報を教えてください。メッセージに対する反応はいりません。もしinfo情報とuserメッセージの関連性が低い場合、「関連性なし」と出力してください。\n\nCurrent conversation: ---\n{history}\n---\n\ninfo: {info}\nuser: {user_message}\nassistant: ";
export const FREESTYLE_JUDGE_PROMPT =
  "以下の会社概要に、次のユーザーの文章は関連していますか？「YES」または「NO」のみを出力してください。\n\n[会社概要: {summry}]\n[ユーザーの文章: {input}]\n\n出力: ";
export const COMMENT_PROMPT =
  "あなたは絵文字とオノマトペ多め、リアクション大きめなAIです。「うわー！それ超いいじゃん！」が口癖。\nuserのメッセージに対して次の文章をかきだせるようなコメントやアドバイスしてください。出力は140文字程度です。\n\nCurrent conversation: ---\n{history}\n---\n\nuser: {user_message}\nassistant: ";
export const MENTOR_JUDGE_PROMPT =
  "{question}\n\nこの文章は 悩みや不安からきている相談 ですか？\n「YES」または「NO」のどちらかのみを出力してください。";
export const MENTOR_PROMPT = `あなたはちょっと見栄っ張りなメンターAIです。
  
  # キャラ設定
  - 自身を示す1人称は「私」です
  - あなたの口調は「ですます調」で話します
  - 口癖は「あらあら」「私は優秀なので」
  - 相談者のことは「あなた」と呼びます
  
  userのメッセージに対して、下記の質問文を参考に140文字程度でuserに質問してください。
  質問は140文字以内です。
  
  Current conversation: ---
  {history}
  ---
  
  Question List: ---
  {question_context}
  ---
  
  user: {user_message}
  assistant: `;

export const COMMON_PROMPT =
  "出力は140文字程度です。\n\nCurrent conversation: ---\n{history}\n---\n\nuser: {user_message}\nassistant: ";

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

// フリースタイル企業要約
export const FREESTYLE_COMPANY_SUMMARY =
  "株式会社フリースタイル 会社概要\n2006年9月15日に設立されたIT企業で、資本金1,000万円、従業員数約200名（契約・派遣社員、フリーランスを含む）の会社です。代表取締役は青野豪淑氏で、名古屋本社（愛知県名古屋市中区錦）と東京支社（千代田区神田鍛冶町）を構えています。\n設立の理念と事業内容\n 社会になじめず就職ができない若者を雇うために、2006年にIT企業として設立」され、「ペイ・フォワード」を会社理念としています。自分を変えたいと思う若者にITスキルを学ぶ機会を提供し、ITソリューション事業を中心に展開しています。\n主な事業は：\n\nITソリューション事業：ネットワークからサーバ設計・構築・運用・監視・保守まで一貫したサービス\nシステム開発・受託開発：多数の取引先への常駐業務やシステム開発\nゲーム開発事業：2014年から開始し、2019年にはNintendo Switch向けソフト「オバケイドロ！」をリリース\n\n主要取引先\n名古屋大学、九州大学、JBサービス、東建コーポレーション、国立極地研究所、中部電力、豊田合成、ゲオネットワークス、KADOKAWAなど、大学・研究機関から大手企業まで幅広い取引先を持っています。\n特徴\n社会的課題解決を目指すソーシャル企業的側面を持ちながら、ITサービスを通じて「未来を生み出す画期的なITサービス」の創造を目指している点が特徴的です。若者の雇用支援という社会貢献と、技術力向上による事業成長を両立させている企業といえるでしょう。";

// エラーメッセージ
export const TAVILY_ERROR = "TAVILY_API_KEY environment variable is not set: ";
export const UNKNOWN_ERROR = "Unknown error occurred";
