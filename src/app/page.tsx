"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

type Lampiran = {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  text?: string;
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  lampiran?: Lampiran[];
};

const contoh = [
  "Halo, perkenalkan dirimu",
  "Buatkan pantun tentang Depok",
  "Jelaskan AI secara sederhana",
];

const MAKS_FILE = 4 * 1024 * 1024;
const EKSTENSI_TEKS =
  /\.(txt|md|csv|json|js|jsx|ts|tsx|html|css|xml|yml|yaml|py|java|c|cpp|h|sh|sql|log|ini|env)$/i;

function formatUkuran(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

function bersihkan(t: string) {
  return t
    .replace(/```/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/_{2,}/g, "");
}

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lampiran, setLampiran] = useState<Lampiran[]>([]);
  const bawahRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bawahRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function bacaFile(f: File): Promise<Lampiran> {
    if (f.size > MAKS_FILE) {
      throw new Error('File "' + f.name + '" terlalu besar (maks 4MB).');
    }
    if (f.type.startsWith("image/")) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(new Error("Gagal membaca gambar."));
        r.readAsDataURL(f);
      });
      return { name: f.name, type: f.type, size: f.size, dataUrl };
    }
    if (
      f.type.startsWith("text/") ||
      f.type === "application/json" ||
      EKSTENSI_TEKS.test(f.name)
    ) {
      const teks = await f.text();
      return { name: f.name, type: f.type, size: f.size, text: teks.slice(0, 20000) };
    }
    return { name: f.name, type: f.type, size: f.size };
  }

  async function onPilihFile(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    try {
      const hasil: Lampiran[] = [];
      for (const f of files) hasil.push(await bacaFile(f));
      setLampiran((prev) => [...prev, ...hasil]);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function hapusLampiran(idx: number) {
    setLampiran((prev) => prev.filter((_, i) => i !== idx));
  }

  async function kirim(teks: string) {
    const pesan = teks.trim();
    if ((!pesan && lampiran.length === 0) || isLoading) return;
    setError("");
    setInput("");
    const bawa = lampiran.length ? lampiran : undefined;
    setLampiran([]);
    const baru: Msg[] = [...messages, { role: "user", content: pesan, lampiran: bawa }];
    setMessages(baru);
    setIsLoading(true);
    try {
      const apiMessages = baru.map((m) => {
        if (m.role === "assistant") return { role: "assistant", content: m.content };
        const parts: any[] = [];
        if (m.content) parts.push({ type: "text", text: m.content });
        for (const l of m.lampiran ?? []) {
          if (l.dataUrl) {
            parts.push({ type: "image", image: l.dataUrl });
          } else if (l.text) {
            parts.push({ type: "text", text: 'Isi file "' + l.name + '":\n' + l.text });
          } else {
            parts.push({
              type: "text",
              text:
                "[File terlampir: " +
                l.name +
                " | jenis: " +
                (l.type || "tidak diketahui") +
                " | ukuran: " +
                formatUkuran(l.size) +
                "]",
            });
          }
        }
        return { role: "user", content: parts.length ? parts : "" };
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Error " + res.status);
      } else {
        setMessages([...baru, { role: "assistant", content: bersihkan(data.reply) }]);
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
          <h1 className="font-semibold leading-tight">Muramsyah AI</h1>
          <p className="text-xs text-emerald-400">● Online · Groq + Gemini otomatis</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !isLoading && (
          <div className="mx-auto mt-16 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
            <div className="text-4xl">👋</div>
            <h2 className="mt-3 font-semibold">Halo, aku Muramsyah</h2>
            <p className="mt-1 text-sm text-white/60">
              Ketik pesan, atau lampirkan foto/file lewat tombol 📎.
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
            className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow " +
                (m.role === "user"
                  ? "rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600"
                  : "rounded-bl-sm border border-white/10 bg-white/10 backdrop-blur")
              }
            >
              {m.lampiran && m.lampiran.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {m.lampiran.map((l, j) =>
                    l.dataUrl ? (
                      <img
                        key={j}
                        src={l.dataUrl}
                        alt={l.name}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    ) : (
                      <span
                        key={j}
                        className="flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-xs"
                      >
                        📄 {l.name} · {formatUkuran(l.size)}
                      </span>
                    )
                  )}
                </div>
              )}
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

      {lampiran.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-white/10 bg-white/5 px-4 pt-2">
          {lampiran.map((l, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1 pr-3 text-xs"
            >
              {l.dataUrl ? (
                <img src={l.dataUrl} alt={l.name} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="pl-2">📄</span>
              )}
              <span className="max-w-[140px] truncate">{l.name}</span>
              <button onClick={() => hapusLampiran(i)} className="text-red-300">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          kirim(input);
        }}
        className="flex items-center gap-2 border-t border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
      >
        <input type="file" multiple hidden ref={fileRef} onChange={onPilihFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg"
        >
          📎
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan ke Muramsyah..."
          className="flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm outline-none placeholder:text-white/40 focus:border-indigo-400"
        />
        <button
          disabled={isLoading || (!input.trim() && lampiran.length === 0)}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
        >
          Kirim
        </button>
      </form>
    </main>
  );
              }
m outline-none placeholder:text-white/40 focus:border-indigo-400"
        />
        <button
          disabled={isLoading || (!input.trim() && lampiran.length === 0)}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
        >
          Kirim
        </button>
      </form>
    </main>
  );
}
