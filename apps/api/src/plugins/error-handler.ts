import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    //zod validation error
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Validation Error",
        message: "Invalid request data",
        details: error.issues,
      });
    }

    //prisma error
    if (error.name == "PrismaClientKnownRequestError") {
      const { code } = error as { code: string };

      switch (code) {
        case "P2002": // unique constraint
          return reply.status(409).send({
            statusCode: 409,
            error: "Conflict",
            message: "Duplicate record violation",
          });
        default:
          return reply.status(400).send({
            statusCode: 400,
            error: "Database Error",
            messages: "Database operation failed",
          });
      }
    }

    // log error
    fastify.log.error({ err: error, reqId: request.id }, "unhandled error");

    // default error
    return reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || "Internal server error",
      message: error.message || "Something went wrong",
    });
  });

  fastify.log.info("Error handler configured");
};

export default fp(errorHandlerPlugin, {
  name: "error-handler",
});
