type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  // Keep it simple: console.* is enough for a thesis lab. In production, use pino/winston.
  // eslint-disable-next-line no-console
  console[level](JSON.stringify(entry));
}
