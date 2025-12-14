import { beforeEach, describe, expect, it } from "vitest";
import {
  anonymousRequest,
  authenticatedRequest,
  createTestSpace,
  createTestUser,
  generateAnonymousId,
} from "./helpers";
import { Space, User } from "../src/generated/prisma/client";
import { testApp } from "./setup";

describe("Song Module", () => {
  let testUser: User;
  let testSpace: Space;

  beforeEach(async () => {
    testUser = await createTestUser();
    testSpace = await createTestSpace(testUser.id);
  });

  describe("POST /api/v1/songs - Add Song", () => {
    it("should add a song as authenticated user", async () => {
      const response = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        testUser.id,
        {
          spaceId: testSpace.id,
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      );

      expect(response.statusCode).toBe(201);
      expect(response.json().data).toMatchObject({
        youtubeId: "dQw4w9WgXcQ",
        spaceId: testSpace.id,
        addedById: testUser.id,
      });
    });

    it("should add a song as anonymous user", async () => {
      const anonId = generateAnonymousId();

      const response = await anonymousRequest("POST", "/api/v1/songs", anonId, {
        spaceId: testSpace.id,
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().data).toMatchObject({
        youtubeId: "dQw4w9WgXcQ",
        spaceId: testSpace.id,
        addedByAnonymous: anonId,
        addedById: null,
      });
    });

    it("should reject invalid YouTube url", async () => {
      const response = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        testUser.id,
        {
          spaceId: testSpace.id,
          youtubeUrl: "https://invalid-url.com",
        },
      );

      expect(response.statusCode).toBe(400);
    });

    it("should prevent duplicate songs in queue", async () => {
      const youtubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

      await authenticatedRequest("POST", "/api/v1/songs", testUser.id, {
        spaceId: testSpace.id,
        youtubeUrl,
      });

      const response = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        testUser.id,
        {
          spaceId: testSpace.id,
          youtubeUrl,
        },
      );

      expect(response.statusCode).toBe(409);
    });
  });

  describe("GET /api/v1/songs/queue/:spaceId - Get Queue", () => {
    it("should return empty queue", async () => {
      const response = await authenticatedRequest(
        "GET",
        `/api/v1/songs/queue/${testSpace.id}?page=1&limit=50`,
        testUser.id,
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().data.songs).toHaveLength(0);
    });

    it("should return songs sorted by score", async () => {
      const s1 = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        testUser.id,
        {
          spaceId: testSpace.id,
          youtubeUrl: "https://www.youtube.com/watch?v=xxG3XA4fCww",
        },
      );
      const s2 = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        testUser.id,
        {
          spaceId: testSpace.id,
          youtubeUrl: "https://www.youtube.com/watch?v=pmisiOBlKKo",
        },
      );
      const s3 = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        testUser.id,
        {
          spaceId: testSpace.id,
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      );

      const songId = s2.json().data.id;

      await authenticatedRequest("POST", "/api/v1/votes", testUser.id, {
        songId,
        value: 1,
      });

      const response = await testApp.inject({
        method: "GET",
        url: `/api/v1/songs/queue/${testSpace.id}?page=1&limit=50`,
      });

      expect(response.statusCode).toBe(200);
      const songs = response.json().data.songs;

      expect(songs[0].id).toBe(s2.json().data.id);
      expect(songs[0].score).toBe(1);
    });
  });

  describe("DELETE /api/v1/songs/:id - Delete song", () => {
    it("should delete own song", async () => {
      const addResponse = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        testUser.id,
        {
          spaceId: testSpace.id,
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      );

      const songId = addResponse.json().data.id;

      const response = await authenticatedRequest(
        "DELETE",
        `/api/v1/songs/${songId}`,
        testUser.id,
      );

      expect(response.statusCode).toBe(200);
    });

    it("should not delete other user's song", async () => {
      const otherUser = await createTestUser({ email: "other@example.com" });

      const addResponse = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        testUser.id,
        {
          spaceId: testSpace.id,
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      );

      const songId = addResponse.json().data.id;

      const response = await authenticatedRequest(
        "DELETE",
        `/api/v1/songs/${songId}`,
        otherUser.id,
      );

      expect(response.statusCode).toBe(403);
    });

    it("should allow owner to delete any song", async () => {
      const otherUser = await createTestUser({ email: "other@example.com" });

      const addResponse = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        otherUser.id,
        {
          spaceId: testSpace.id,
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      );

      const songId = addResponse.json().data.id;

      const response = await authenticatedRequest(
        "DELETE",
        `/api/v1/songs/${songId}`,
        testUser.id,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
