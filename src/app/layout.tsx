import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My AI Chat",
  description: "Chatbot AI pribadi pakai Groq + Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
