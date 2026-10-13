import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Read DATABASE_URL from .env directly to ensure correct connection
function getDatabaseUrl(): string | undefined {
  try {
    const cwd = process.cwd();
    const candidates = [
      path.resolve(cwd, ".env.local"),
      path.resolve(cwd, ".env"),
      path.resolve(cwd, "..", "..", ".env.local"),
      path.resolve(cwd, "..", "..", ".env"),
    ];
    const envPath = candidates.find((p) => fs.existsSync(p));
    if (envPath) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        process.env.DATABASE_URL = match[1];
        return match[1];
      }
    }
  } catch {
    // fallback
  }
  return process.env.DATABASE_URL;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  lastDbUrl: string | undefined;
};

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

export const prisma =
  globalForPrisma.prisma && globalForPrisma.lastDbUrl === dbUrl
    ? globalForPrisma.prisma
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.lastDbUrl = dbUrl;
}
