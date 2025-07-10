/** 利用者のデータ */
type WithMeta = {
  value: string;
  description: string; // この項目の意味や目的
};

type HumanData = {
  name: WithMeta; // 利用者の名前
  age: WithMeta; // 利用者の年齢帯
  sex: WithMeta; // 利用者の性別
  occupation: WithMeta; // 利用者の職業
  location: WithMeta; // 利用者の居住地
  interests: WithMeta; // 利用者の興味・関心
};

type HumanPersonality = {
  personalityTraits: WithMeta; // 利用者の性格特性
  motivation: WithMeta; // 利用者の動機や目標
  communicationPreference: WithMeta; // 利用者のコミュニケーションの好み
  prohibitedExpressions: WithMeta; // 利用者が避けたい表現やトピック
};

type HumanLife = {
  lifestyle: WithMeta; // 利用者のライフスタイル
  weeklyRoutine: WithMeta; // 利用者の週のルーチン
  hobbies: WithMeta; // 利用者の趣味
  dislikes: WithMeta; // 利用者の嫌いなこと
};

type HumanProfile = {
  data: HumanData;
  personality: HumanPersonality;
  life: HumanLife;
};

const emptyHumanProfile: HumanProfile = {
  data: {
    name: { value: "", description: "利用者のフルネームまたはニックネーム" },
    age: {
      value: "",
      description: "利用者の年齢帯（例：27歳、30代、アラサー）",
    },
    sex: { value: "", description: "利用者の性別（例：男性、女性、その他）" },
    occupation: {
      value: "",
      description: "利用者の職業（例：エンジニア、学生、主婦）",
    },
    location: {
      value: "",
      description: "利用者の居住地（例：東京都、アメリカ、海外）",
    },
    interests: {
      value: "",
      description: "利用者の興味・関心（例：音楽、スポーツ、旅行）",
    },
  },
  personality: {
    personalityTraits: {
      value: "",
      description: "利用者の性格特性（例：内向的、社交的、好奇心旺盛）",
    },
    motivation: {
      value: "",
      description: "利用者の動機や目標（例：キャリアアップ、自己成長）",
    },
    communicationPreference: {
      value: "",
      description:
        "利用者のコミュニケーションの好み（例：カジュアル、フォーマル、絵文字使用）",
    },
    prohibitedExpressions: {
      value: "",
      description: "利用者が避けたい表現やトピック（例：政治、宗教）",
    },
  },
  life: {
    lifestyle: {
      value: "",
      description: "利用者のライフスタイル（例：健康志向、アウトドア派）",
    },
    weeklyRoutine: {
      value: "",
      description: "利用者の週のルーチン（例：平日は仕事、週末は趣味）",
    },
    hobbies: {
      value: "",
      description: "利用者の趣味（例：釣り、テニス、ゲーム",
    },
    dislikes: {
      value: "",
      description: "利用者の嫌いなこと（例：早起き、混雑）",
    },
  },
};
