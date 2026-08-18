"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

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

const EKSTENSI_TEKS = new RegExp(
  "\\.(txt|md|csv|json|js|jsx|ts|tsx|html|css|xml|" +
    "yml|yaml|py|java|c|cpp|h|sh|sql|log|ini|env)$",
  "i"
);

const GAYA_HALAMAN =
  "flex h-screen flex-col text-white bg-gradient-to-br " +
  "from-slate-950 via-indigo-950 to-black";

const GAYA_HEADER =
  "flex items-center gap-3 px-4 py-3 backdrop-blur " +
  "border-b border-white/10 bg-white/5";

const GAYA_AVATAR =
  "flex h-10 w-10 items-center justify-center " +
  "rounded-full text-lg bg-gradient-to-br " +
  "from-indigo-500 to-fuchsia-500";

const GAYA_AREA_CHAT =
  "flex-1 space-y-4 overflow-y-auto px-4 py-6";

const GAYA_KARTU =
  "mx-auto mt-16 max-w-sm rounded-2xl p-6 text-center " +
  "border border-white/10 bg-white/5 backdrop-blur";

const GAYA_TOMBOL_CONTOH =
  "rounded-full px-4 py-2 text-sm hover:bg-white/20 " +
  "border border-white/15 bg-white/10";

const GAYA_BUBBLE_USER =
  "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 " +
  "py-2.5 text-sm leading-relaxed shadow " +
  "rounded-br-sm bg-gradient-to-br " +
  "from-indigo-500 to-violet-600";

const GAYA_BUBBLE_AI =
  "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 " +
  "py-2.5 text-sm leading-relaxed shadow " +
  "rounded-bl-sm border border-white/10 bg-white/10 " +
  "backdrop-blur";

const GAYA_GAMBAR = "h-24 w-24 rounded-lg object-cover";

const GAYA_CHIP_FILE =
  "flex items-center gap-1 rounded-full bg-black/30 " +
  "px-3 py-1 text-xs";

const GAYA_TYPING =
  "flex gap-1.5 rounded-2xl px-4 py-3 " +
  "border border-white/10 bg-white/10";

const GAYA_TITIK =
  "h-2 w-2 animate-bounce rounded-full bg-white/70";

const GAYA_ERROR =
  "rounded-xl px-4 py-3 text-sm text-red-300 " +
  "border border-red-500/40 bg-red-500/10";

const GAYA_BAR_LAMPIRAN =
  "flex flex-wrap gap-2 px-4 pt-2 " +
  "border-t border-white/10 bg-white/5";

const GAYA_CHIP_LAMPIRAN =
  "flex items-center gap-2 rounded-full py-1 pl-1 " +
  "pr-3 text-xs border border-white/15 bg-white/10";

const GAYA_THUMB = "h-7 w-7 rounded-full object-cover";

const GAYA_FORM =
  "flex items-center gap-2 px-4 py-3 backdrop-blur " +
  "border-t border-white/10 bg-white/5";

const GAYA_CLIP =
  "flex h-10 w-10 items-center justify-center " +
  "rounded-full text-lg border border-white/10 " +
  "bg-white/10";

const GAYA_INPUT =
  "flex-1 rounded-full px-4 py-2.5 text-sm " +
  "outline-none border border-white/10 bg-white/10 " +
  "placeholder:text-white/40 " +
  "focus:border-indigo-400";

const GAYA_KIRIM =
  "rounded-full px-5 py-2.5 text-sm font-semibold " +
  "bg-gradient-to-r from-indigo-500 to-fuchsia-500 " +
  "disabled:opacity-40";

function formatUkuran(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) {
    return (b / 1024).toFixed(1) + " KB";
  }
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
    bawahRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  async function bacaFile(f: File): Promise<Lampiran> {
    if (f.size > MAKS_FILE) {
      throw new Error(
        'File "' + f.name + '" terlalu besar (maks 4MB).'
      );
    }
    if (f.type.startsWith("image/")) {
      const dataUrl = await new Promise<string>(
        (resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = () =>
            reject(new Error("Gagal membaca gambar."));
          r.readAsDataURL(f);
        }
      );
      return {
        name: f.name,
        type: f.type,
        size: f.size,
        dataUrl,
      };
    }
    if (
      f.type.startsWith("text/") ||
      f.type === "application/json" ||
      EKSTENSI_TEKS.test(f.name)
    ) {
      const teks = await f.text();
      return {
        name: f.name,
        type: f.type,
        size: f.size,
        text: teks.slice(0, 20000),
      };
    }
    return { name: f.name, type: f.type, size: f.size };
  }

  async function onPilihFile(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    try {
      const hasil: Lampiran[] = [];
      for (const f of files) {
        hasil.push(await bacaFile(f));
      }
      setLampiran((prev) => [...prev, ...hasil]);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  function hapusLampiran(idx: number) {
    setLampiran((prev) => {
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function kirim(teks: string) {
    const pesan = teks.trim();
    if ((!pesan && lampiran.length === 0) || isLoading) {
      return;
    }
    setError("");
    setInput("");
    const bawa = lampiran.length ? lampiran : undefined;
    setLampiran([]);
    const baru: Msg[] = [
      ...messages,
      { role: "user", content: pesan, lampiran: bawa },
    ];
    setMessages(baru);
    setIsLoading(true);
    try {
      const apiMessages = baru.map((m) => {
        if (m.role === "assistant") {
          return { role: "assistant", content: m.content };
        }
        const parts: any[] = [];
        if (m.content) {
          parts.push({ type: "text", text: m.content });
        }
        for (const l of m.lampiran ?? []) {
          if (l.dataUrl) {
            parts.push({
              type: "image",
              image: l.dataUrl,
            });
          } else if (l.text) {
            parts.push({
              type: "text",
              text:
                'Isi file "' + l.name + '":\n' + l.text,
            });
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
        return {
          role: "user",
          content: parts.length ? parts : "",
        };
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
        setMessages([
          ...baru,
          { role: "assistant", content: bersihkan(data.reply) },
        ]);
      }
    } catch (e) {
      setError(
        "Tidak bisa terhubung ke server: " + String(e)
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={GAYA_HALAMAN}>
      <header className={GAYA_HEADER}>
        <div className={GAYA_AVATAR}>🤖</div>
        <div>
          <h1 className="font-semibold leading-tight">
            Muramsyah AI
          </h1>
          <p className="text-xs text-emerald-400">
            ● Online · Groq + Gemini otomatis
          </p>
        </div>
      </header>

      <div className={GAYA_AREA_CHAT}>
        {messages.length === 0 && !isLoading && (
          <div className={GAYA_KARTU}>
            <div className="text-4xl">👋</div>
            <h2 className="mt-3 font-semibold">
              Halo, aku Muramsyah
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Ketik pesan, atau lampirkan foto/file via 📎.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {contoh.map((c) => (
                <button
                  key={c}
                  onClick={() => kirim(c)}
                  className={GAYA_TOMBOL_CONTOH}
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
            className={
              "flex " +
              (m.role === "user"
                ? "justify-end"
                : "justify-start")
            }
          >
            <div
              className={
                m.role === "user"
                  ? GAYA_BUBBLE_USER
                  : GAYA_BUBBLE_AI
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
                        className={GAYA_GAMBAR}
                      />
                    ) : (
                      <span
                        key={j}
                        className={GAYA_CHIP_FILE}
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
            <div className={GAYA_TYPING}>
              <span className={GAYA_TITIK} />
              <span
                className={
                  GAYA_TITIK + " [animation-delay:150ms]"
                }
              />
              <span
                className={
                  GAYA_TITIK + " [animation-delay:300ms]"
                }
              />
            </div>
          </div>
        )}

        {error && (
          <div className={GAYA_ERROR}>⚠️ {error}</div>
        )}
        <div ref={bawahRef} />
      </div>

      {lampiran.length > 0 && (
        <div className={GAYA_BAR_LAMPIRAN}>
          {lampiran.map((l, i) => (
            <div key={i} className={GAYA_CHIP_LAMPIRAN}>
              {l.dataUrl ? (
                <img
                  src={l.dataUrl}
                  alt={l.name}
                  className={GAYA_THUMB}
                />
              ) : (
                <span className="pl-2">📄</span>
              )}
              <span className="max-w-[140px] truncate">
                {l.name}
              </span>
              <button
                onClick={() => hapusLampiran(i)}
                className="text-red-300"
              >
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
        className={GAYA_FORM}
      >
        <input
          type="file"
          multiple
          hidden
          ref={fileRef}
          onChange={onPilihFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={GAYA_CLIP}
        >
          📎
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan ke Muramsyah..."
          className={GAYA_INPUT}
        />
        <button
          disabled={
            isLoading ||
            (!input.trim() && lampiran.length === 0)
          }
          className={GAYA_KIRIM}
        >
          Kirim
        </button>
      </form>
    </main>
  );
}
