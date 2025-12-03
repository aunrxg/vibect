import { FastifyPluginAsync } from "fastify";
import { SongService } from "./songs.service";
import { authenticate, optionalAuth } from "../../middleware/auth.middlware";
import {
  addSongSchema,
  deleteSongSchema,
  getQueueSchema,
  searchSongSchema,
} from "./songs.schema";
import { sendSuccess } from "../../utils/response";

const songRoutes: FastifyPluginAsync = async (fastify) => {
  const songsService = new SongService(fastify);

  fastify.get(
    "/search",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const query = searchSongSchema.parse(request.query);
      const results = await songsService.search(query.query, query.maxResult);
      return sendSuccess(reply, results, "search results fetched");
    },
  );

  fastify.get(
    "queue/:spaceId",
    {
      preHandler: [optionalAuth],
    },
    async (request, reply) => {
      const { spaceId } = request.params as { spaceId: string };
      const query = getQueueSchema.parse(request.query);

      const results = await songsService.getQueue(
        spaceId,
        query.page,
        query.limit,
      );
      return sendSuccess(reply, results, "queue fetch successfully");
    },
  );

  fastify.post(
    "/",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const body = addSongSchema.parse(request.body);
      const song = await songsService.addSong(
        body.spaceId,
        body.youtubeUrl,
        request.user!.id,
      );

      return sendSuccess(reply, song, "Song added successfully");
    },
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { id } = deleteSongSchema.parse(request.params);

      const result = await songsService.deleteSong(id, request.user!.id);

      return sendSuccess(reply, result, "song deleted successfully");
    },
  );

  fastify.get(
    "/history/:spaceId",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { spaceId } = request.params as { spaceId: string };
      const q = request.query as { limit: number; page: number };
      const query = getQueueSchema.parse({ ...q, spaceId });

      const result = await songsService.getHistory(
        query.spaceId,
        query.page,
        query.limit,
      );

      return sendSuccess(reply, result, "fetched space history successfully");
    },
  );
};

export default songRoutes;
