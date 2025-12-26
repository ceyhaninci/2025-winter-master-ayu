"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "error"; message?: string }>({ type: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "idle" });

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json().catch(() => null)) as any;

    if (!res.ok) {
      setStatus({ type: "error", message: data?.error || "Giriş başarısız." });
      return;
    }

    router.push("/search");
    router.refresh();
  }

  return (
    <div className="card">
      <h1>Giriş Yap</h1>
      <form onSubmit={onSubmit} className="row" style={{ flexDirection: "column" }}>
        <label>
          <div className="small">E-posta</div>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label>
          <div className="small">Şifre</div>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        <button className="btn" type="submit">Giriş</button>
      </form>

      {status.type === "error" && <p className="error">{status.message}</p>}

      <p className="small">
        Hesabın yok mu? <Link href="/auth/register"><b>Kayıt ol</b></Link>
      </p>
    </div>
  );
}
