"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message?: string }>({ type: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "idle" });

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json().catch(() => null)) as any;

    if (!res.ok) {
      setStatus({ type: "error", message: data?.error || "Kayıt başarısız." });
      return;
    }

    setStatus({ type: "success", message: "Kayıt başarılı. Şimdi giriş yapabilirsiniz." });
    setPassword("");
  }

  return (
    <div className="card">
      <h1>Kayıt Ol</h1>
      <form onSubmit={onSubmit} className="row" style={{ flexDirection: "column" }}>
        <label>
          <div className="small">E-posta</div>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label>
          <div className="small">Şifre (min 8)</div>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </label>
        <button className="btn" type="submit">Kayıt Ol</button>
      </form>

      {status.type === "error" && <p className="error">{status.message}</p>}
      {status.type === "success" && <p className="success">{status.message}</p>}

      <p className="small">
        Zaten hesabın var mı? <Link href="/auth/login"><b>Giriş yap</b></Link>
      </p>
    </div>
  );
}
