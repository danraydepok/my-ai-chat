'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const models = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Groq)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
];

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState(models[0].id);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: { model: selectedModel },
  });

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">My AI Chat</h1>
        <p className="text-sm text-gray-600">Groq + Gemini</p>

        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="mt-3 p-2 border rounded-lg w-full max-w-md"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 border rounded-lg p-4 bg-white">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            Mulai chat dengan AI...
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-100 ml-10'
                : 'bg-gray-100 mr-10'
            }`}
          >
            <div className="text-xs font-semibold mb-1">
              {m.role === 'user' ? 'Kamu' : 'AI'}
            </div>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-gray-500 text-sm">AI sedang menulis...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={handleInputChange}
          placeholder="Ketik pesan..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}

'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const models = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Groq)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
];

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState(models[0].id);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: { model: selectedModel },
  });

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">My AI Chat</h1>
        <p className="text-sm text-gray-600">Groq + Gemini</p>

        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="mt-3 p-2 border rounded-lg w-full max-w-md"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 border rounded-lg p-4 bg-white">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            Mulai chat dengan AI...
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-100 ml-10'
                : 'bg-gray-100 mr-10'
            }`}
          >
            <div className="text-xs font-semibold mb-1">
              {m.role === 'user' ? 'Kamu' : 'AI'}
            </div>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-gray-500 text-sm">AI sedang menulis...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={handleInputChange}
          placeholder="Ketik pesan..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </div>
  );
        }
