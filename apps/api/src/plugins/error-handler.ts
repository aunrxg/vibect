import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { AppError, BadRequestError, ValidationError } from "../utils/error";
import { Prisma } from "../generated/prisma/client";

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    // 1. Handle custorm AppError instances
    if (error instanceof AppError) {
      fastify.log.error(error, "AppError caught");
      return reply.status(error.statusCode).send(error.toJson());
    }

    // 2. zod validation error
    if (error instanceof ZodError) {
      return reply
        .status(400)
        .send(
          new ValidationError("Invalid request data", error.issues).toJson(),
        );
    }

    // 3. prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const { code } = error as { code: string };

      switch (code) {
        case "P2002": // unique constraint
          return reply
            .status(409)
            .send(new BadRequestError("Duplicate record violation").toJson());

        default:
          return reply.status(400).send({
            statusCode: 400,
            error: "Database Error",
            messages:
              process.env.NODE_ENV === "development"
                ? error.message
                : "Database operation failed",
            details:
              process.env.NODE_ENV === "development" ? error.meta : undefined,
          });
      }
    }

    // 4. Prisma Initialization failure
    if (error instanceof Prisma.PrismaClientInitializationError) {
      fastify.log.error("Prisma Init Error: ");
      return reply.status(500).send({
        statusCode: 500,
        error: "Database Connection Error",
        message: "Could not connect to database",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    // 5. fastify validation errors
    if (error.validation) {
      return reply
        .status(400)
        .send(
          new ValidationError("Validation Error", error.validation).toJson(),
        );
    }

    // 6. log error
    if (error.statusCode !== 404) {
      fastify.log.error({ err: error, reqId: request.id }, "Unhandled error");
    }

    // 7. default error
    return reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || "INTERNAL_SERVER_ERROR",
      message:
        error.statusCode === 500 && process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  });

  fastify.log.info("Error handler configured");
};

export default fp(errorHandlerPlugin, {
  name: "error-handler",
});
