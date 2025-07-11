# ベースイメージ（Node.js公式）
FROM node:24.4.0-bullseye

# 作業ディレクトリの作成
WORKDIR /app

# package.jsonとlockファイルをコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリ全体をコピー
COPY . .

# Next.jsをビルド
RUN npm run build

# ポートを開放（Next.jsのデフォルト）
EXPOSE 3000

# アプリ起動
CMD ["npm", "start"]
