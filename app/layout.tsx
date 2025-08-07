import type { Metadata } from "next";
import { Host_Grotesk, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

const host_Grotesk = Host_Grotesk({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reflect Whiteboard",
  description: "壁打ちAI: まだ形になっていないあなたの悩みを浮き上がらせるもの",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJp.variable} ${host_Grotesk.className} antialiased font-noto-sans-jp`}
      >
        {children}
      </body>
    </html>
  );
}
