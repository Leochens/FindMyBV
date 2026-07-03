import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FindMyBV - 找 BV 号小工具",
  description: "在 B 站创作中心快速搜索自己的视频并复制 BV 号的书签脚本。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
