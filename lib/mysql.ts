import mysql from "mysql2/promise";

let _pool: mysql.Pool | null = null;

export function mysqlPool() {
  if (_pool) return _pool;

  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is not set.");
  if (!uri.startsWith("mysql://")) throw new Error("DATABASE_URL must be a mysql:// URL for raw mode.");

  _pool = mysql.createPool({
    uri,
    connectionLimit: 10,
    // MySQL 8 default is fine; keeping namedPlaceholders off.
  });

  return _pool;
}
