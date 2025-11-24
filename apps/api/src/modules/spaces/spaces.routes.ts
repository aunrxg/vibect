import { FastifyPluginAsync } from "fastify";
import { SpaceService } from "./spaces.service";
import {
  createSpaceSchema,
  deleteSpaceSchema,
  getSpaceSchema,
  updateSpaceSchema,
} from "./spaces.schema";
import { authenticate, optionalAuth } from "../../middleware/auth.middlware";

const spaceRoute: FastifyPluginAsync = async (fastify) => {
  const spaceService = new SpaceService(fastify);

  // list all public spaces
  fastify.get(
    "/",
    {
      preHandler: [optionalAuth],
    },
    async () => {
      fastify.log.info("Fetching public spaces...");
      const spaces = await spaceService.listPublicSpaces();
      fastify.log.info(`Found ${spaces.length} spaces`);
      return { data: spaces };
    },
  );

  // get space by id
  fastify.get(
    "/:id",
    {
      preHandler: [optionalAuth],
    },
    async (request, _) => {
      const params = getSpaceSchema.parse(request.params);
      const space = await spaceService.getSpace(params);
      return { data: space };
    },
  );

  // create space
  fastify.post(
    "/",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const body = createSpaceSchema.parse(request.body);
      const space = await spaceService.createSpace(body, request.user!.id);
      return reply.status(201).send({ data: space });
    },
  );

  // update space
  fastify.patch(
    "/:id",
    {
      preHandler: [authenticate],
    },
    async (request, _) => {
      const params = updateSpaceSchema.parse(request.params);
      const body = updateSpaceSchema.omit({ id: true }).parse(request.body);
      const space = await spaceService.updateSpace(
        { ...params, ...body },
        request.user!.id,
      );
      return { data: space };
    },
  );

  // delete space
  fastify.delete(
    "/:id",
    {
      preHandler: [authenticate],
    },
    async (request, _) => {
      const params = deleteSpaceSchema.parse(request.params);
      const result = await spaceService.deleteSpace(params, request.user!.id);
      return { data: result };
    },
  );
};

export default spaceRoute;
