import { FastifyPluginAsync } from "fastify";
import { VoteService } from "./vote.service";
import {
  authenticate,
  authenticateOrAnonymous,
} from "../../middleware/auth.middleware";
import {
  getSongVotesSchema,
  getUserVoteSchema,
  removeVoteSchema,
  voteSchema,
} from "./vote.schema";
import { sendSuccess } from "../../utils/response";

const votesRoutes: FastifyPluginAsync = async (fastify) => {
  const voteService = new VoteService(fastify);

  //vote song allow anon
  fastify.post(
    "/",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const body = voteSchema.parse(request.body);

      const result = await voteService.vote(
        body.songId,
        request.user!.id,
        body.value,
        request.user!.isAnonymous,
      );

      return sendSuccess(
        reply,
        result,
        body.value === 1
          ? "Upvoted"
          : body.value === -1
            ? "Downvoted"
            : "Vote removed",
      );
    },
  );

  //remove vote
  fastify.post(
    "/:songId",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { songId } = removeVoteSchema.parse(request.params);

      const result = await voteService.removeVote(songId, request.user!.id);

      return sendSuccess(reply, result, "Vote removed");
    },
  );

  // get user's vote in space
  fastify.get(
    "/user/:spaceId",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { spaceId } = getUserVoteSchema.parse(request.params);

      const votes = await voteService.getUserVote(spaceId, request.user!.id);

      return sendSuccess(reply, votes, "User's vote fetched successfully");
    },
  );

  //get all votes for a song
  fastify.get(
    "/song/:songId",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { songId } = getSongVotesSchema.parse(request.params);

      const votes = await voteService.getSongVotes(songId);

      return sendSuccess(reply, votes, "song's votes fetched successfully");
    },
  );

  //get leaderboard
  fastify.get(
    "/leaderboard/:spaceId",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { spaceId } = request.params as { spaceId: string };
      const { limit: limitQuery } = request.query as { limit?: string };
      const limit = parseInt(limitQuery || "10") || 10;
      const leaderboard = await voteService.getLeaderboard(spaceId, limit);

      return sendSuccess(
        reply,
        leaderboard,
        "leaderboard fetched successfully",
      );
    },
  );

  //space vote stats
  fastify.get(
    "/stats/:spaceId",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { spaceId } = request.params as { spaceId: string };

      const stats = await voteService.getSpaceVoteStats(spaceId);

      return sendSuccess(reply, stats, "Space stats fetched successfully");
    },
  );
};

export default votesRoutes;
