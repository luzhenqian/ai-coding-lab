import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowBoard",
  description: "Personal Kanban Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#1a1a2e] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
