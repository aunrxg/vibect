import { beforeAll, afterAll, beforeEach, vi, afterEach } from "vitest";
import { buildApp } from "../src/app";
import type { FastifyInstance } from "fastify";
import { prisma } from "../src/lib/prisma";

// let app: FastifyInstance;

// global test app instance
let testApp: FastifyInstance;

beforeAll(async () => {
  // set test env
  process.env.NODE_ENV = "test";
  process.env.LOG_LEVEL = "silent";

  // build app for testing
  testApp = await buildApp();
  await testApp.ready();

  // verify db
  await prisma.$connect();
  console.log("Test app initialiazed");
});

afterAll(async () => {
  // close app
  try {
    await testApp?.close();
    await prisma.$disconnect();
    console.log("Test cleanup completed");
  } catch (error) {
    console.error("CLEANUP error: ", error);
  }
});

// clean db before each test
beforeEach(async () => {
  // delete all data in transaction
  await prisma.$transaction([
    prisma.anonymousVote.deleteMany(),
    prisma.votes.deleteMany(),
    prisma.songs.deleteMany(),
    prisma.spaceMember.deleteMany(),
    prisma.space.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // mock supabase getUser to bypass auth middlware and accept any mock token
  testApp.supabase = {
    auth: {
      getUser: vi.fn().mockImplementation(async (token: string) => {
        // token format from authenticatedRequest: test-token-<userId> or anon-<uuid>
        const id = token.replace("mock-token-", "");

        const isAnonymous =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            id,
          ) || id.startsWith("anon-");

        return {
          data: {
            user: {
              id,
              email: isAnonymous ? `${id}@anonymous.local` : `${id}@test.local`,
              name: isAnonymous ? undefined : "TEST USER",
              isAnonymous: isAnonymous ? true : false,
            },
          },
          error: null,
        };
      }),
    },
  } as any;

  // mock prisma lookup
  prisma.user.findUnique = vi.fn().mockImplementation(async ({ where }) => {
    return {
      id: where.id,
      email: `${where.id}@test.local`,
      name: "Test User",
      avatarUrl: null,
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

export { testApp };
