import { Space, User } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";
import { generateInviteCodes } from "../src/utils/helpers";
import { testApp } from "./setup";

export async function createTestUser(
  overrides: Partial<User> = {},
): Promise<User> {
  return prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      ...overrides,
    },
  });
}

export async function createTestSpace(
  ownerId: string,
  overrides: Partial<Space> = {},
): Promise<Space> {
  return prisma.space.create({
    data: {
      name: "Test Space",
      description: "A test space",
      isPublic: true,
      ownerId,
      inviteCode: generateInviteCodes(8, true),
      ...overrides,
    },
  });
}

export function generateMockToken(userId: string): string {
  // we should generate real jwt token but ok
  return `mock-token-${userId}`;
}

export function generateAnonymousId(): string {
  return `anon_${crypto.randomUUID()}`;
}

export async function authenticatedRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  userId: string,
  body?: any,
) {
  const response = await testApp.inject({
    method,
    url,
    headers: {
      authorization: `Bearer mock-token-${userId}`,
    },
    payload: body,
  });

  return response;
}

export async function anonymousRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  anonymousId: string,
  body?: any,
) {
  const response = await testApp.inject({
    method,
    url,
    headers: {
      authorization: `Bearer ${anonymousId}`,
    },
    payload: body,
  });

  return response;
}
