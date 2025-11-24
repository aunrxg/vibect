import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import pg from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({
  connectionString: connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };
