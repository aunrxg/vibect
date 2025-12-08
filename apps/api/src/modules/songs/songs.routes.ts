import { FastifyPluginAsync } from "fastify";
import { SongService } from "./songs.service";
import {
  authenticate,
  authenticateOrAnonymous,
} from "../../middleware/auth.middleware";
import {
  addSongSchema,
  deleteSongSchema,
  getQueueQuerySchema,
  searchSongSchema,
} from "./songs.schema";
import { HttpStatus, sendCreated, sendSuccess } from "../../utils/response";
import { UnauthorizedError } from "../../utils/error";

const songRoutes: FastifyPluginAsync = async (fastify) => {
  const songsService = new SongService(fastify);

  // allow anonymous users
  fastify.get(
    "/search",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const query = searchSongSchema.parse(request.query);
      const results = await songsService.search(query.query, query.maxResult);
      return sendSuccess(reply, results, "search results fetched");
    },
  );

  // allow anon user
  fastify.get(
    "/queue/:spaceId",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { spaceId } = request.params as { spaceId: string };
      const { page = 1, limit = 50 } = getQueueQuerySchema.parse(request.query);

      const results = await songsService.getQueue(spaceId, page, limit);
      return sendSuccess(reply, results, "queue fetch successfully");
    },
  );

  // allow anon user
  fastify.post(
    "/",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const body = addSongSchema.parse(request.body);

      if (!request.user) {
        throw new UnauthorizedError("Authentication required to add a song");
      }

      const song = await songsService.addSong(
        body.spaceId,
        body.youtubeUrl,
        request.user.isAnonymous || false,
        request.user.id,
      );

      return sendCreated(
        reply,
        song,
        "Song added successfully",
        HttpStatus.CREATED,
      );
    },
  );

  // allow anon
  fastify.delete(
    "/:id",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { id } = deleteSongSchema.parse(request.params);

      if (!request.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const result = await songsService.deleteSong(
        id,
        request.user.id,
        request.user.isAnonymous || false,
      );

      return sendSuccess(reply, result, "song removed from queue successfully");
    },
  );

  fastify.get(
    "/history/:spaceId",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { spaceId } = request.params as { spaceId: string };
      const { page = 1, limit = 50 } = getQueueQuerySchema.parse(request.query);

      const result = await songsService.getHistory(spaceId, page, limit);

      return sendSuccess(reply, result, "fetched space history successfully");
    },
  );
};

export default songRoutes;
