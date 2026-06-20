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

export const getPrisma = (): PrismaClient => {
  if (!_prisma) {
    _prisma = globalForPrisma.atelierFinancePrisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.atelierFinancePrisma = _prisma;
    }
  }
  return _prisma;
};

// Instead of a Proxy which can be triggered by bundlers checking internal properties
// (like `then`, `__esModule`, `default`, etc.), we explicitly define getters only for
// the properties that Prisma exposes.
export const prisma = {
  get user() { return getPrisma().user; },
  get company() { return getPrisma().company; },
  get financialStatement() { return getPrisma().financialStatement; },
  get marketPrice() { return getPrisma().marketPrice; },
  get dataSource() { return getPrisma().dataSource; },
  get sourceEvidence() { return getPrisma().sourceEvidence; },
  get dataQualityReport() { return getPrisma().dataQualityReport; },
  get manualImportSession() { return getPrisma().manualImportSession; },
  get manualImportRecord() { return getPrisma().manualImportRecord; },
  get watchlist() { return getPrisma().watchlist; },
  get paperTrade() { return getPrisma().paperTrade; },
  get assistantInteraction() { return getPrisma().assistantInteraction; },
  get $connect() { return getPrisma().$connect; },
  get $disconnect() { return getPrisma().$disconnect; },
  get $on() { return (getPrisma() as any).$on; },
  get $transaction() { return getPrisma().$transaction; },
  get $extends() { return getPrisma().$extends; },
  get $executeRaw() { return getPrisma().$executeRaw; },
  get $queryRaw() { return getPrisma().$queryRaw; },
  get $executeRawUnsafe() { return getPrisma().$executeRawUnsafe; },
  get $queryRawUnsafe() { return getPrisma().$queryRawUnsafe; },
} as unknown as PrismaClient;

export type DatabaseClient = PrismaClient;
