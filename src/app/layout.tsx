import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muramsyah AI",
  description: "Muramsyah AI - asisten pribadi bertenaga Groq dan Gemini",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
