import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";

function createPrismaClient() {
    const sql = neon(process.env.DATABASE_URL!);
    const adapter = new PrismaNeon(sql as Parameters<typeof PrismaNeon>[0]);
    return new PrismaClient({ adapter });
}

// Prevent multiple instances in development due to hot reload
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
