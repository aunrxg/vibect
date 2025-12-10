import { describe, it, expect, beforeEach } from "vitest";
import { testApp } from "./setup";
import { createTestUser, authenticatedRequest } from "./helpers";
import { User } from "../src/generated/prisma/client";

describe("Integration: Complete User Flows", () => {
  describe("Scenario 1: New User Creates Space and Manages Queue", () => {
    let user: User;

    beforeEach(async () => {
      user = await createTestUser();
    });

    it("should handle complete space creation and song management flow", async () => {
      // Step 1: Create a new space
      const createSpaceResponse = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        user.id,
        {
          name: "My Awesome Playlist",
          description: "Best songs ever",
          isPublic: true,
        },
      );

      expect(createSpaceResponse.statusCode).toBe(201);
      const space = createSpaceResponse.json().data;
      expect(space).toMatchObject({
        name: "My Awesome Playlist",
        description: "Best songs ever",
        isPublic: true,
        ownerId: user.id,
      });

      // Step 2: Add first song
      const addSong1Response = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        user.id,
        {
          spaceId: space.id,
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      );

      expect(addSong1Response.statusCode).toBe(201);
      const song1 = addSong1Response.json().data;
      expect(song1.youtubeId).toBe("dQw4w9WgXcQ");

      // Step 3: Add second song
      const addSong2Response = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        user.id,
        {
          spaceId: space.id,
          youtubeUrl: "https://youtu.be/jNQXAC9IVRw",
        },
      );

      expect(addSong2Response.statusCode).toBe(201);
      const song2 = addSong2Response.json().data;

      // Step 4: Check queue has both songs
      const queueResponse = await testApp.inject({
        method: "GET",
        url: `/api/v1/songs/queue/${space.id}`,
      });

      expect(queueResponse.statusCode).toBe(200);
      expect(queueResponse.json().data.songs).toHaveLength(2);

      // Step 5: Upvote song 2
      await authenticatedRequest("POST", "/api/v1/votes", user.id, {
        songId: song2.id,
        value: 1,
      });

      // Step 6: Verify song 2 is now first in queue (higher score)
      const updatedQueueResponse = await testApp.inject({
        method: "GET",
        url: `/api/v1/songs/queue/${space.id}`,
      });

      const queue = updatedQueueResponse.json().data.songs;
      expect(queue[0].id).toBe(song2.id);
      expect(queue[0].score).toBe(1);
      expect(queue[1].id).toBe(song1.id);
      expect(queue[1].score).toBe(0);

      // Step 7: Remove song 1
      const deleteSongResponse = await authenticatedRequest(
        "DELETE",
        `/api/v1/songs/${song1.id}`,
        user.id,
      );

      expect(deleteSongResponse.statusCode).toBe(200);

      // Step 8: Verify queue now has only song 2
      const finalQueueResponse = await testApp.inject({
        method: "GET",
        url: `/api/v1/songs/queue/${space.id}`,
      });

      expect(finalQueueResponse.json().data.songs).toHaveLength(1);
      expect(finalQueueResponse.json().data.songs[0].id).toBe(song2.id);

      // Step 9: Update space info
      const updateSpaceResponse = await authenticatedRequest(
        "PATCH",
        `/api/v1/spaces/${space.id}`,
        user.id,
        {
          name: "Updated Playlist Name",
          description: "New description",
        },
      );

      expect(updateSpaceResponse.statusCode).toBe(200);
      expect(updateSpaceResponse.json().data.name).toBe(
        "Updated Playlist Name",
      );
    });
  });
});
