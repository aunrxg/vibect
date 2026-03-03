import { FastifyPluginAsync } from "fastify";
import { PlaybackService } from "./playback.service";
import { authenticateOrAnonymous } from "../../middleware/auth.middleware";
import { spaceIdSchema, startPlaybackSchema } from "./playback.schema";
import { HttpStatus, sendSuccess } from "../../utils/response";

const playbackRoutes: FastifyPluginAsync = async (fastify) => {
  const playbackService = new PlaybackService(fastify);

  // get current playback state
  fastify.get(
    "/:spaceId",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { spaceId } = spaceIdSchema.parse(request.params);

      const state = await playbackService.getPlaybackState(spaceId);

      return sendSuccess(
        reply,
        state,
        "current playback state fetched",
        HttpStatus.OK,
      );
    },
  );

  // start playback
  fastify.post(
    "/play",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { spaceId, songId } = startPlaybackSchema.parse(request.body);

      const state = await playbackService.startPlayback(spaceId, songId);

      return sendSuccess(reply, state, "Playback started!", HttpStatus.OK);
    },
  );

  // pause playback
  fastify.post(
    "/:spaceId/pause",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { spaceId } = spaceIdSchema.parse(request.params);

      const state = await playbackService.pausePlayback(spaceId);

      return sendSuccess(reply, state, "playback pause!", HttpStatus.OK);
    },
  );

  // resume playback
  fastify.post(
    "/:spaceId/resume",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { spaceId } = spaceIdSchema.parse(request.params);

      const state = await playbackService.resumePlayback(spaceId);

      return sendSuccess(reply, state, "playback resumed!", HttpStatus.OK);
    },
  );

  // skip to next
  fastify.post(
    "/:spaceId/next",
    {
      preHandler: [authenticateOrAnonymous],
    },
    async (request, reply) => {
      const { spaceId } = spaceIdSchema.parse(request.params);

      const state = await playbackService.skipToNext(spaceId);

      return sendSuccess(reply, state, "song skipped", HttpStatus.OK);
    },
  );

  // seek to position
  // song end logic (auto play next);
};

export default playbackRoutes;
