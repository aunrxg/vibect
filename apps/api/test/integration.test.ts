import { describe, it, expect, beforeEach } from "vitest";
import { testApp } from "./setup";
import {
  createTestUser,
  authenticatedRequest,
  createTestSpace,
  generateAnonymousId,
  anonymousRequest,
} from "./helpers";
import { Songs, Space, User } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

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
          youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
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
    }, 60000);
  });

  describe("Scenerio 2: Multiple Users Collaborating in space", () => {
    let user1: User;
    let user2: User;
    let user3: User;
    let space: Space;

    beforeEach(async () => {
      user1 = await createTestUser({ email: "user1@test.com", name: "One" });
      user2 = await createTestUser({ email: "user2@test.com", name: "Two" });
      user3 = await createTestUser({ email: "user3@test.com", name: "Three" });

      // user 1 creates space
      const spaceResponse = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        user1.id,
        { name: "Collaborative Room", isPublic: true },
      );

      space = spaceResponse.json().data;
    });

    it("should handle multiple users adding and voting on songs", async () => {
      // user1 adds song A
      const songAResponse = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        user1.id,
        {
          spaceId: space.id,
          youtubeUrl: "https://www.youtube.com/watch?v=E8gmARGvPlI",
        },
      );

      const songA = songAResponse.json().data;

      // user2 adds song B
      const songBResponse = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        user2.id,
        {
          spaceId: space.id,
          youtubeUrl: "https://www.youtube.com/watch?v=nZqwQCLYgjk",
        },
      );

      const songB = songBResponse.json().data;

      // user3 adds song C
      const songCResponse = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        user3.id,
        {
          spaceId: space.id,
          youtubeUrl: "https://www.youtube.com/watch?v=j_sG_Juncn8",
        },
      );

      const songC = songCResponse.json().data;

      // all users upvote B
      await authenticatedRequest("POST", "/api/v1/votes", user1.id, {
        songId: songB.id,
        value: 1,
      });
      await authenticatedRequest("POST", "/api/v1/votes", user2.id, {
        songId: songB.id,
        value: 1,
      });
      await authenticatedRequest("POST", "/api/v1/votes", user3.id, {
        songId: songB.id,
        value: 1,
      });

      // user 1 and 2 upvote c
      await authenticatedRequest("POST", "/api/v1/votes", user1.id, {
        songId: songC.id,
        value: 1,
      });
      await authenticatedRequest("POST", "/api/v1/votes", user2.id, {
        songId: songC.id,
        value: 1,
      });

      // user3 downvotes A
      await authenticatedRequest("POST", "/api/v1/votes", user3.id, {
        songId: songA.id,
        value: -1,
      });

      //check the queue (B: 3, C: 2, A: -1)
      const queueResponse = await testApp.inject({
        method: "GET",
        url: `/api/v1/songs/queue/${space.id}`,
      });

      const queue = queueResponse.json().data.songs;
      expect(queue).toHaveLength(3);
      expect(queue[0].id).toBe(songB.id);
      expect(queue[0].score).toBe(3);
      expect(queue[1].id).toBe(songC.id);
      expect(queue[1].score).toBe(2);
      expect(queue[2].id).toBe(songA.id);
      expect(queue[2].score).toBe(-1);

      const leaderboardResponse = await authenticatedRequest(
        "GET",
        `/api/v1/votes/leaderboard/${space.id}?limit=10`,
        user1.id,
      );

      const leaderboard = leaderboardResponse.json().data;
      expect(leaderboard[0].id).toBe(songB.id);
      expect(leaderboard[0].score).toBe(3);

      // user2 changes vote on B upvote --> downvote
      await authenticatedRequest("POST", "/api/v1/votes", user2.id, {
        songId: songB.id,
        value: -1,
      });

      //check updated queue
      const updatedQueueResponse = await testApp.inject({
        method: "GET",
        url: `/api/v1/songs/queue/${space.id}`,
      });

      const updatedQueue = updatedQueueResponse.json().data.songs;
      expect(updatedQueue[0].id).toBe(songC.id);
      expect(updatedQueue[0].score).toBe(2);
      expect(updatedQueue[1].id).toBe(songB.id);
      expect(updatedQueue[1].score).toBe(1);
    }, 100000);

    it("should handle vote statistics correctly", async () => {
      // add song
      const songResponse = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        user1.id,
        {
          spaceId: space.id,
          youtubeUrl: "https://www.youtube.com/watch?v=nZqwQCLYgjk",
        },
      );

      const song = songResponse.json().data;

      // users vote
      await authenticatedRequest("POST", "/api/v1/votes", user1.id, {
        songId: song.id,
        value: 1,
      });
      await authenticatedRequest("POST", "/api/v1/votes", user2.id, {
        songId: song.id,
        value: 1,
      });
      await authenticatedRequest("POST", "/api/v1/votes", user3.id, {
        songId: song.id,
        value: -1,
      });

      //check for vote details
      const voteDetailsResponse = await testApp.inject({
        method: "GET",
        url: `/api/v1/votes/song/${song.id}`,
      });
      const voteDetails = voteDetailsResponse.json().data;

      expect(voteDetails).toMatchObject({
        songId: song.id,
        score: 1,
        voteCount: {
          upvotes: 2,
          downvotes: 1,
          total: 3,
        },
      });
      expect(voteDetails.votes).toHaveLength(3);

      // check for space stats
      const spaceStatsResponse = await authenticatedRequest(
        "GET",
        `/api/v1/votes/stats/${space.id}`,
        user1.id,
      );

      const spaceStats = spaceStatsResponse.json().data;
      console.log("space stat: ", spaceStatsResponse.json());
      expect(spaceStats.totalVotes).toBe(3);
      expect(spaceStats.totalUpvotes).toBe(2);
      expect(spaceStats.totalDownvotes).toBe(1);
    });
  });

  describe("Scenerio 3: Anonymous Users Interacting", () => {
    let registeredUser: User;
    let space: Space;
    let anonId1: string;
    let anonId2: string;

    beforeEach(async () => {
      registeredUser = await createTestUser();
      anonId1 = generateAnonymousId();
      anonId2 = generateAnonymousId();

      // registered user creates space
      const spaceResponse = await authenticatedRequest(
        "POST",
        "/api/v1/spaces",
        registeredUser.id,
        {
          name: "Public Party",
          isPublic: true,
        },
      );

      space = spaceResponse.json().data;
    });

    it("should allow anonymous users to add song", async () => {
      // allow anon1 to add song
      const anonSong1Response = await anonymousRequest(
        "POST",
        "/api/v1/songs",
        anonId1,
        {
          spaceId: space.id,
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      );

      expect(anonSong1Response.statusCode).toBe(201);
      const anonSong1 = anonSong1Response.json().data;
      expect(anonSong1.addedByAnonymous).toBe(anonId1);
      expect(anonSong1.addedById).toBe(null);

      // anon2 add song
      const anonSong2Response = await anonymousRequest(
        "POST",
        "/api/v1/songs",
        anonId1,
        {
          spaceId: space.id,
          youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        },
      );
      const anonSong2 = anonSong2Response.json().data;

      // registered user add song
      const regSongResponse = await anonymousRequest(
        "POST",
        "/api/v1/songs",
        anonId1,
        {
          spaceId: space.id,
          youtubeUrl: "https://www.youtu.com/watch?v=jNQXAC9IVRw",
        },
      );

      const regSong = regSongResponse.json().data;
      // anon user vote
      await anonymousRequest("POST", "/api/v1/votes", anonId1, {
        songId: anonSong2.id,
        value: 1,
      });
      await anonymousRequest("POST", "/api/v1/votes", anonId2, {
        songId: anonSong2.id,
        value: 1,
      });
      // reg user vote
      await authenticatedRequest("POST", "/api/v1/votes", registeredUser.id, {
        songId: anonSong2.id,
        value: 1,
      });

      // check queue
      const queueResponse = await testApp.inject({
        method: "GET",
        url: `/api/v1/songs/queue/${space.id}?page=1&limit=10`,
      });
      const queue = queueResponse.json().data.songs;
      // top song should be anonsong2 (2+1)
      const topSong = queue.find((s: Songs) => s.id === anonSong2.id);
      expect(topSong.score).toBe(3);

      //verify vote count are separate in db but combined in score
      const dbSong = await prisma.songs.findUnique({
        where: { id: anonSong2.id },
        include: {
          votes: true,
          anonymousVotes: true,
        },
      });

      expect(dbSong?.votes.length).toBe(1);
      expect(dbSong?.anonymousVotes.length).toBe(2);

      // anonymous users can delete their song
      const deleteResponse = await anonymousRequest(
        "DELETE",
        `/api/v1/songs/${anonSong1.id}`,
        anonId1,
      );

      expect(deleteResponse.statusCode).toBe(200);

      // but can't delete other anon song
      // const UnauthorizedDeleteResponse = await anonymousRequest(
      //   "DELETE",
      //   `/api/v1/songs/${anonSong2.id}`,
      //   anonId1,
      // );

      // expect(UnauthorizedDeleteResponse.statusCode).toBe(403);
    }, 60000);

    it("should maintain separate vote tracking for anonymous user", async () => {
      //add song
      const songResponse = await authenticatedRequest(
        "POST",
        "/api/v1/songs",
        registeredUser.id,
        {
          spaceId: space.id,
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      );

      const song = songResponse.json().data;

      //multiple anonymous users vote
      await anonymousRequest("POST", `/api/v1/votes`, anonId1, {
        songId: song.id,
        value: 1,
      });
      await anonymousRequest("POST", `/api/v1/votes`, anonId2, {
        songId: song.id,
        value: 1,
      });

      // register user vote
      await authenticatedRequest("POST", `/api/v1/votes`, registeredUser.id, {
        songId: song.id,
        value: 1,
      });

      // check queue
      const queueResponse = await testApp.inject({
        method: "GET",
        url: `/api/v1/songs/queue/${space.id}?page=1&limit=10`,
      });
      const queue = queueResponse.json().data.songs[0];
      expect(queue.score).toBe(3);

      //verify vote count are separate in db but combined in score
      const dbSong = await prisma.songs.findUnique({
        where: { id: song.id },
        include: {
          votes: true,
          anonymousVotes: true,
        },
      });

      expect(dbSong?.votes.length).toBe(1);
      expect(dbSong?.anonymousVotes.length).toBe(2);
    }, 60000);
  });
});
