import path from "path";

/** ベクターストアのコレクションネーム */
export const collectionName = "md_docs";

/* ディレクトリパス */
const lineWorksDirs = {
  board: "board",
  regulations: "regulations",
  // history: "history",
} as const;

export const resolvedDirs = Object.fromEntries(
  Object.entries(lineWorksDirs).map(([key, subDir]) => [
    key,
    path.resolve(process.cwd(), "public", "line-works", subDir),
  ])
);

// フリースタイル企業要約
export const FREESTYLE_COMPANY_SUMMARY =
  "株式会社フリースタイル 会社概要\n2006年9月15日に設立されたIT企業で、資本金1,000万円、従業員数約200名（契約・派遣社員、フリーランスを含む）の会社です。代表取締役は青野豪淑氏で、名古屋本社（愛知県名古屋市中区錦）と東京支社（千代田区神田鍛冶町）を構えています。\n設立の理念と事業内容\n 社会になじめず就職ができない若者を雇うために、2006年にIT企業として設立」され、「ペイ・フォワード」を会社理念としています。自分を変えたいと思う若者にITスキルを学ぶ機会を提供し、ITソリューション事業を中心に展開しています。\n主な事業は：\n\nITソリューション事業：ネットワークからサーバ設計・構築・運用・監視・保守まで一貫したサービス\nシステム開発・受託開発：多数の取引先への常駐業務やシステム開発\nゲーム開発事業：2014年から開始し、2019年にはNintendo Switch向けソフト「オバケイドロ！」をリリース\n\n主要取引先\n名古屋大学、九州大学、JBサービス、東建コーポレーション、国立極地研究所、中部電力、豊田合成、ゲオネットワークス、KADOKAWAなど、大学・研究機関から大手企業まで幅広い取引先を持っています。\n特徴\n社会的課題解決を目指すソーシャル企業的側面を持ちながら、ITサービスを通じて「未来を生み出す画期的なITサービス」の創造を目指している点が特徴的です。若者の雇用支援という社会貢献と、技術力向上による事業成長を両立させている企業といえるでしょう。";
