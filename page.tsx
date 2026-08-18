"use client";

import { useChat } from "ai/react";

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <main className="flex h-screen flex-col bg-black text-white">
      <header className="border-b border-white/10 p-4 text-center font-semibold">
        My AI Chat
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-white/50">Kirim pesan untuk mulai chat.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-auto w-fit max-w-[80%] rounded-2xl bg-blue-600 px-4 py-2"
                : "mr-auto w-fit max-w-[80%] rounded-2xl bg-white/10 px-4 py-2"
            }
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 p-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Tulis pesan..."
          className="flex-1 rounded-xl bg-white/10 px-4 py-2 outline-none placeholder:text-white/40"
        />
        <button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold">Kirim</button>
      </form>
    </main>
  );
}
