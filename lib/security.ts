export type OnOff = "on" | "off";

function norm(v: string | undefined, dflt: OnOff): OnOff {
  const x = (v || "").toLowerCase().trim();
  if (x === "off") return "off";
  if (x === "on") return "on";
  return dflt;
}

export const security = {
  // Toggle these to support thesis comparisons.
  // Defaults are secure.
  validation: norm(process.env.SECURITY_VALIDATION, "on"),
  rateLimit: norm(process.env.SECURITY_RATE_LIMIT, "on"),
  errorMasking: norm(process.env.SECURITY_ERROR_MASKING, "on"),
  // Switch data access strategy while keeping endpoints unchanged.
  // "prisma" is ORM; "raw" uses mysql2 with parameterized queries.
  dataAccess: ((process.env.DATA_ACCESS || "prisma").toLowerCase().trim() === "raw" ? "raw" : "prisma") as
    | "prisma"
    | "raw",
};
