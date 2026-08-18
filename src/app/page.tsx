"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const contoh = [
  "Halo, perkenalkan dirimu",
  "Buatkan pantun tentang Depok",
  "Jelaskan AI secara sederhana",
];

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const bawahRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bawahRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function kirim(teks: string) {
    const pesan = teks.trim();
    if (!pesan || isLoading) return;
    setError("");
    setInput("");
    const baru: Msg[] = [...messages, { role: "user", content: pesan }];
    setMessages(baru);
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: baru }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || `Error ${res.status}`);
      } else {
        setMessages([...baru, { role: "assistant", content: data.reply }]);
      }
    } catch (e) {
      setError("Tidak bisa terhubung ke server: " + String(e));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white">
      <header className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg">
          🤖
        </div>
        <div>
          <h1 className="font-semibold leading-tight">My AI Chat</h1>
          <p className="text-xs text-emerald-400">● Online</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !isLoading && (
          <div className="mx-auto mt-16 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
            <div className="text-4xl">✨</div>
            <h2 className="mt-3 font-semibold">Mulai Percakapan</h2>
            <p className="mt-1 text-sm text-white/60">
              Kirim pesan atau coba contoh di bawah.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {contoh.map((c) => (
                <button
                  key={c}
                  onClick={() => kirim(c)}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow ${
                m.role === "user"
                  ? "rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600"
                  : "rounded-bl-sm border border-white/10 bg-white/10 backdrop-blur"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/70 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/70 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}
        <div ref={bawahRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          kirim(input);
        }}
        className="flex items-center gap-2 border-t border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-indigo-400"
        />
        <button
          disabled={isLoading || !input.trim()}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
        >
          Kirim
        </button>
      </form>
    </main>
  );
}
