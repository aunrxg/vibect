import { FastifyPluginAsync } from "fastify";
import { SpaceService } from "./spaces.service";
import {
  createSpaceSchema,
  deleteSpaceSchema,
  getSpaceSchema,
  listPublicSpacesSchema,
  updateSpaceSchema,
} from "./spaces.schema";
import { authenticate, optionalAuth } from "../../middleware/auth.middlware";
import {
  HttpStatus,
  sendCreated,
  sendPaginated,
  sendSuccess,
} from "../../utils/response";

const spaceRoute: FastifyPluginAsync = async (fastify) => {
  const spaceService = new SpaceService(fastify);

  // list all public spaces
  fastify.get(
    "/",
    {
      preHandler: [optionalAuth],
    },
    async (request, reply) => {
      const { page, limit } = listPublicSpacesSchema.parse(request.query);
      const { spaces, meta } = await spaceService.listPublicSpaces({
        page,
        limit,
      });
      return sendPaginated(reply, spaces, meta);
    },
  );

  // get space by id
  fastify.get(
    "/:id",
    {
      preHandler: [optionalAuth],
    },
    async (request, reply) => {
      const params = getSpaceSchema.parse(request.params);
      const space = await spaceService.getSpace(params);
      return sendSuccess(
        reply,
        space,
        "successfully get the space with ID",
        HttpStatus.OK,
      );
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
      return sendCreated(
        reply,
        space,
        "successfully created space",
        HttpStatus.CREATED,
      );
    },
  );

  // update space
  fastify.patch(
    "/:id",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const params = updateSpaceSchema.parse(request.params);
      const body = updateSpaceSchema.omit({ id: true }).parse(request.body);
      const space = await spaceService.updateSpace(
        { ...params, ...body },
        request.user!.id,
      );
      return sendSuccess(
        reply,
        space,
        "space updated successfully",
        HttpStatus.OK,
      );
    },
  );

  // delete space
  fastify.delete(
    "/:id",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const params = deleteSpaceSchema.parse(request.params);
      const result = await spaceService.deleteSpace(params, request.user!.id);
      return sendSuccess(
        reply,
        result,
        "space deleted successfully",
        HttpStatus.OK,
      );
    },
  );
};

export default spaceRoute;
