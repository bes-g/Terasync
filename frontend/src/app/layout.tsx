import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeraSync - Spare Parts Reverse-RFQ Marketplace",
  description:
    "Reverse-RFQ marketplace with escrow settlement for automotive and industrial spare parts in Addis Ababa, Ethiopia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
