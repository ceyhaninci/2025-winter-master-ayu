import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Auth + Search (MySQL/Prisma) Lab",
  description: "Thesis lab: secure auth/search with measurable defenses (no intentional vulnerabilities).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
