import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <h1>Next.js Auth + Search (MySQL/Prisma) Lab</h1>
      <p className="small">
        Bu proje, teziniz için <b>güvenli</b> bir örnek uygulama ve ölçümlenebilir savunma kontrolleri sağlar.
      </p>

      <div className="card">
        <nav>
          <Link className="btn" href="/auth/register">Kayıt Ol</Link>
          <Link className="btn secondary" href="/auth/login">Giriş Yap</Link>
          <Link className="btn secondary" href="/search">Search</Link>
        </nav>
      </div>

      <div className="card">
        <h2>Ne var?</h2>
        <ul>
          <li>/auth/register ve /auth/login sayfaları</li>
          <li>POST ile çalışan API route’ları</li>
          <li>MySQL 8 + Prisma</li>
          <li>Zod ile doğrulama, rate limit, hata maskeleme, logging</li>
        </ul>
      </div>
    </>
  );
}
