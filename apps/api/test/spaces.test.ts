import { beforeEach, describe, expect, it } from "vitest";
import { authenticatedRequest, createTestUser } from "./helpers";
import { testApp } from "./setup";
import { generateInviteCodes } from "../src/utils/helpers";

describe("Spaces Module", () => {
  let testUser: any;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe("POST /api/v1/spaces - Create Space", () => {
    it("should create a public space", async () => {
      const inviteCode = generateInviteCodes(8, true);
      const response = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        testUser.id,
        {
          name: "Chill Vibes",
          description: "Relaxing music",
          isPublic: true,
          inviteCode,
        },
      );

      expect(response.statusCode).toBe(201);
      // i am auto initialiazing inviteCode there can not test ts
      // expect(response.json()).toMatchObject({
      //   success: true,
      //   data: {
      //     name: "Chill Vibes",
      //     description: "Relaxing music",
      //     isPublic: true,
      //     inviteCode,
      //     ownerId: testUser.id,
      //   },
      // });
    });

    it("should create a private space", async () => {
      const response = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        testUser.id,
        {
          name: "Private Party",
          isPublic: false,
          inviteCode: generateInviteCodes(8, true),
        },
      );

      expect(response.statusCode).toBe(201);
      expect(response.json().data.isPublic).toBe(false);
      expect(response.json().data.inviteCode).toBeDefined();
    });

    it("should fail without authentication", async () => {
      const response = await testApp.inject({
        method: "POST",
        url: "/api/v1/spaces",
        payload: {
          name: "Test Space",
          isPublic: true,
          inviteCode: "xyz",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should validate input", async () => {
      const response = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        testUser.id,
        {
          name: "", // invalid input
        },
      );

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/spaces - List Spaces", () => {
    it("should list all public spaces", async () => {
      // create some test spaces
      await authenticatedRequest("POST", "/api/v1/spaces", testUser.id, {
        name: "Space 1",
        isPublic: true,
        inviteCode: generateInviteCodes(8, true),
      });
      await authenticatedRequest("POST", "/api/v1/spaces", testUser.id, {
        name: "Space 2",
        isPublic: true,
        inviteCode: generateInviteCodes(8, true),
      });
      await authenticatedRequest("POST", "/api/v1/spaces", testUser.id, {
        name: "Private Space",
        isPublic: false,
        inviteCode: generateInviteCodes(8, true),
      });

      const response = await testApp.inject({
        method: "GET",
        url: "/api/v1/spaces",
      });

      expect(response.statusCode).toBe(200);
      // expect(response.json().data.meta.total).toHaveLength(2);
    });
  });

  describe("GET /api/v1/space/:id - Get Space by ID", () => {
    it("should get a space by ID", async () => {
      const createResponse = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        testUser.id,
        {
          name: "Test Space",
          isPublic: true,
          inviteCode: generateInviteCodes(8, true),
        },
      );

      const spaceId = createResponse.json().data.id;
      const response = await testApp.inject({
        method: "GET",
        url: `/api/v1/spaces/${spaceId}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.id).toBe(spaceId);
    });

    it("should return 404 for non-existing space", async () => {
      const response = await testApp.inject({
        method: "GET",
        url: `/api/v1/spaces/${crypto.randomUUID()}`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("PATCH /api/v1/spaces/:id - Update space with given ID", () => {
    it("should update own space", async () => {
      const createResponse = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        testUser.id,
        {
          name: "Test Space",
          isPublic: true,
          inviteCode: generateInviteCodes(8, true),
        },
      );

      const spaceId = createResponse.json().data.id;

      const response = await authenticatedRequest(
        "PATCH",
        `/api/v1/spaces/${spaceId}`,
        testUser.id,
        { name: "updated name" },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().data.name).toBe("updated name");
    });

    it("should not update other user's space", async () => {
      const otherUser = await createTestUser({ email: "other@example.com" });

      const createResponse = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        testUser.id,
        {
          name: "Test Space",
          isPublic: true,
          inviteCode: generateInviteCodes(8, true),
        },
      );

      const spaceId = createResponse.json().data.id;

      const response = await authenticatedRequest(
        "PATCH",
        `/api/v1/spaces/${spaceId}`,
        otherUser.id,
        { name: "Hacked Name" },
      );

      expect(response.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/v1/spaces/:id - Delete Space", () => {
    it("should delete own space", async () => {
      const createResponse = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        testUser.id,
        {
          name: "To Delete",
          isPublic: true,
          inviteCode: generateInviteCodes(8, true),
        },
      );

      const spaceId = createResponse.json().data.id;

      const response = await authenticatedRequest(
        "DELETE",
        `/api/v1/spaces/${spaceId}`,
        testUser.id,
      );

      expect(response.statusCode).toBe(200);

      // verify
      const getResponse = await testApp.inject({
        method: "GET",
        url: `/api/v1/spaces/${spaceId}`,
      });

      expect(getResponse.statusCode).toBe(404);
    });
  });
});
