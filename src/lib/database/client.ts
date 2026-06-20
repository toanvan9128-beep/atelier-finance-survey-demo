import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  atelierFinancePrisma?: PrismaClient;
};

const createPrismaClient = (): PrismaClient => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to initialize the Prisma client.");
  }

  if (!databaseUrl.startsWith("file:")) {
    throw new Error("Phase 29F.1 Prisma runtime supports local SQLite file: DATABASE_URL only.");
  }

  // Defer import of the adapter and better-sqlite3 to avoid crashing Next.js module evaluation
  // during Vercel builds where native bindings might fail or DATABASE_URL is missing.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter });
};

/**
 * Lazy-initialized Prisma client.
 * Defers DATABASE_URL validation to first actual use so that Next.js can
 * compile pages that import this module without requiring the env var at
 * build time (important for Vercel deployments).
 */
let _prisma: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (
      typeof prop === "symbol" ||
      ["then", "__esModule", "$$typeof", "constructor", "prototype"].includes(prop as string)
    ) {
      return Reflect.get(_target, prop, receiver);
    }

    if (!_prisma) {
      _prisma = globalForPrisma.atelierFinancePrisma ?? createPrismaClient();
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.atelierFinancePrisma = _prisma;
      }
    }
    return Reflect.get(_prisma, prop, receiver);
  },
});

export type DatabaseClient = PrismaClient;
