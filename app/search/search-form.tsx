"use client";

import { useState } from "react";

type SearchResult = {
  ok: boolean;
  items?: Array<{ id: string; query: string; createdAt: string }>;
  error?: string;
  meta?: { remaining?: number; resetAt?: number };
};

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = (await res.json().catch(() => null)) as SearchResult | null;
    setResult(data ?? { ok: false, error: "Geçersiz yanıt." });
    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="row" style={{ alignItems: "center" }}>
        <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Bir şey yaz..." />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Aranıyor..." : "Ara"}
        </button>
      </form>

      {result?.meta?.remaining !== undefined && (
        <p className="small">
          Rate limit kalan: <b>{result.meta.remaining}</b>
        </p>
      )}

      {!result ? null : result.ok ? (
        <div style={{ marginTop: 12 }}>
          <h3>Son aramalar (bu kullanıcı)</h3>
          {result.items && result.items.length > 0 ? (
            <ul>
              {result.items.map((x) => (
                <li key={x.id}>
                  <code>{x.query}</code> <span className="small">({new Date(x.createdAt).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="small">Kayıt bulunamadı.</p>
          )}
        </div>
      ) : (
        <p className="error" style={{ marginTop: 12 }}>{result.error}</p>
      )}
    </div>
  );
}
