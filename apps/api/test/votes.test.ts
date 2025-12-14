import { beforeEach, describe, expect, it } from "vitest";
import { Songs, Space, User } from "../src/generated/prisma/client";
import {
  anonymousRequest,
  authenticatedRequest,
  createTestSong,
  createTestSpace,
  createTestUser,
  generateAnonymousId,
} from "./helpers";
import { testApp } from "./setup";

describe("Vote Module", () => {
  let testUser: User;
  let testSpace: Space;
  let testSong: Songs;

  beforeEach(async () => {
    testUser = await createTestUser();
    testSpace = await createTestSpace(testUser.id);
    testSong = await createTestSong(testSpace.id, testUser.id);
  });

  describe("POST /api/v1/votes - Vote on Song", () => {
    it("should upvote a song", async () => {
      const response = await authenticatedRequest(
        "POST",
        "/api/v1/votes",
        testUser.id,
        {
          songId: testSong.id,
          value: 1,
        },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().data).toMatchObject({
        songScore: 1,
        songPosition: 1,
      });
    });

    it("should downvote a song", async () => {
      const response = await authenticatedRequest(
        "POST",
        "/api/v1/votes",
        testUser.id,
        {
          songId: testSong.id,
          value: -1,
        },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().data.songScore).toBe(-1);
    });

    it("should toggle vote", async () => {
      await authenticatedRequest("POST", "/api/v1/votes", testUser.id, {
        songId: testSong.id,
        value: 1,
      });

      const response = await authenticatedRequest(
        "POST",
        "/api/v1/votes",
        testUser.id,
        {
          songId: testSong.id,
          value: 0,
        },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().data.songScore).toBe(0);
    });

    it("should allow anonymous users to vote", async () => {
      const anonId = generateAnonymousId();

      const response = await anonymousRequest("POST", "/api/v1/votes", anonId, {
        songId: testSong.id,
        value: 1,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.songScore).toBe(1);
    });

    it("should allowed one vote per song per user", async () => {
      await authenticatedRequest("POST", "/api/v1/votes", testUser.id, {
        songId: testSong.id,
        value: 1,
      });

      const response = await authenticatedRequest(
        "POST",
        "/api/v1/votes",
        testUser.id,
        {
          songId: testSong.id,
          value: -1,
        },
      );

      expect(response.statusCode).toBe(200);
      expect(response.json().data.songScore).toBe(-1);
    });

    it("should reject invalid vote values", async () => {
      const response = await authenticatedRequest(
        "POST",
        "/api/v1/votes",
        testUser.id,
        {
          songId: testSong.id,
          value: 5,
        },
      );

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/votes/song/:songId - Get Song Vote", () => {
    it("should return vote details", async () => {
      await authenticatedRequest("POST", "/api/v1/votes", testUser.id, {
        songId: testSong.id,
        value: 1,
      });

      const other = await createTestUser({ email: "other@example.com" });
      await authenticatedRequest("POST", "/api/v1/votes", other.id, {
        songId: testSong.id,
        value: 1,
      });

      const response = await testApp.inject({
        method: "GET",
        url: `/api/v1/votes/song/${testSong.id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data).toMatchObject({
        songId: testSong.id,
        score: 2,
        voteCount: {
          upvotes: 2,
          downvotes: 0,
          total: 2,
        },
      });
    });
  });

  describe("GET /api/votes/leaderboard/:spaceId - Get Leaderboard", () => {
    it("should return top voted songs", async () => {
      // Create multiple songs
      const song2 = await createTestSong(testSpace.id, testUser.id, {
        youtubeId: "video2",
      });
      const song3 = await createTestSong(testSpace.id, testUser.id, {
        youtubeId: "video3",
      });

      // Vote on songs
      await authenticatedRequest("POST", "/api/v1/votes", testUser.id, {
        songId: testSong.id,
        value: 1,
      });
      await authenticatedRequest("POST", "/api/v1/votes", testUser.id, {
        songId: song2.id,
        value: 1,
      });
      await authenticatedRequest("POST", "/api/v1/votes", testUser.id, {
        songId: song3.id,
        value: -1,
      });

      const response = await authenticatedRequest(
        "GET",
        `/api/v1/votes/leaderboard/${testSpace.id}`,
        testUser.id,
      );

      expect(response.statusCode).toBe(200);
      const leaderboard = response.json().data;

      // Should be sorted by score
      expect(leaderboard[0].score).toBeGreaterThanOrEqual(leaderboard[1].score);
      expect(leaderboard[1].score).toBeGreaterThanOrEqual(leaderboard[2].score);
    });
  });
});
