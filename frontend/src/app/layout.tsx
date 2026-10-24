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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050506] text-[#F5F5F5] font-sans antialiased selection:bg-[#D93A10] selection:text-white">{children}</body>
    </html>
  );
}
