import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell/AppShell";

export const metadata: Metadata = {
  title: "人生設計シート",
  description: "PDCAサイクルで人生を設計する",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
