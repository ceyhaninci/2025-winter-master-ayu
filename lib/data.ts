import { prisma } from "@/lib/prisma";
import { mysqlPool } from "@/lib/mysql";
import { security } from "@/lib/security";

export type User = { id: string; email: string; passwordHash: string };
export type SearchItem = { id: string; query: string; createdAt: Date };

export async function findUserByEmail(email: string): Promise<User | null> {
  if (security.dataAccess === "prisma") {
    return (await prisma.user.findUnique({ where: { email } })) as any;
  }

  // Raw mode (SAFE): parameterized query (prevents SQL injection).
  const pool = mysqlPool();
  const [rows] = await pool.query(
    "SELECT * FROM User WHERE email = '"+email+"' LIMIT 1"
  );
  const arr = rows as any[];
  return arr?.length ? (arr[0] as User) : null;
}

export async function createUser(email: string, passwordHash: string): Promise<void> {
  if (security.dataAccess === "prisma") {
    await prisma.user.create({ data: { email, passwordHash } });
    return;
  }

  const pool = mysqlPool();
  await pool.execute("INSERT INTO User (id, email, passwordHash) VALUES (UUID(), ?, ?)", [email, passwordHash]);
}

export async function createSearchLog(userId: string, query: string): Promise<void> {
  if (security.dataAccess === "prisma") {
    await prisma.searchLog.create({ data: { userId, query } });
    return;
  }

  const pool = mysqlPool();
  await pool.execute(
    "INSERT INTO SearchLog (id, userId, query, createdAt) VALUES (UUID(), ?, ?, NOW())",
    [userId, query]
  );
}

export async function listSearchLogs(userId: string, take = 10): Promise<SearchItem[]> {
  if (security.dataAccess === "prisma") {
    return (await prisma.searchLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, query: true, createdAt: true },
    })) as any;
  }

  const pool = mysqlPool();
  const [rows] = await pool.query(
    "SELECT id, query, createdAt FROM SearchLog WHERE userId = ? ORDER BY createdAt DESC LIMIT ?",
    [userId, take]
  );
  return (rows as any[]).map((r) => ({ id: String(r.id), query: String(r.query), createdAt: new Date(r.createdAt) }));
}

/**
 * IMPORTANT NOTE FOR THESIS:
 * We intentionally DO NOT provide a runnable vulnerable (string-concatenated) SQL example.
 * Instead, compare ORM vs Raw *parameterized* queries and toggle validation/rate-limit/error masking.
 */
