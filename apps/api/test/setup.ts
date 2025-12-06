import { beforeAll, afterAll, beforeEach, vi } from "vitest";
import { buildApp } from "../src/app";
import type { FastifyInstance } from "fastify";
import { prisma } from "../src/lib/prisma";

// let app: FastifyInstance;

// global test app instance
let testApp: FastifyInstance;

beforeAll(async () => {
  // set test env
  process.env.NODE_ENV = "test";
  process.env.LOG_LEVEL = "error";

  // build app for testing
  testApp = await buildApp();
  await testApp.ready();

  console.log("Test app initialiazed");
});

afterAll(async () => {
  // close app
  await testApp.close();

  await prisma.$disconnect();

  console.log("Test cleanup completed");
});

// clean db before each test
beforeEach(async () => {
  // delete all data in reverse oder (because of fkeys)
  await prisma.anonymousVote.deleteMany();
  await prisma.votes.deleteMany();
  await prisma.songs.deleteMany();
  await prisma.spaceMember.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();

  // mock supabase getUser to bypass auth middlware and accept any mock token
  testApp.supabase = {
    auth: {
      getUser: vi.fn().mockImplementation(async (token: string) => {
        // token format from authenticatedRequest: test-token-<userId> or anon-<uuid>
        const id = token.replace("mock-token-", "");

        return {
          data: {
            user: {
              id,
              email: `${id}@test.local`,
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

export { testApp };
