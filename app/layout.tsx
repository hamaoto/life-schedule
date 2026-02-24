import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell/AppShell";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "人生設計シート | PDCAで人生をアップデートする",
  description: "「忘れる」をなくし、「信頼」を積み上げる。人生、フェーズ、年、月、週。すべてのレイヤーが連動する、最強の自己管理ツール。",
  keywords: ["人生設計", "PDCA", "目標管理", "自己啓発", "タスク管理"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
