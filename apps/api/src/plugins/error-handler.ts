import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { AppError } from "../utils/error";

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    // 1. Handle custorm AppError instances
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        message: error.message,
        code: error.code,
      });
    }

    // 2. zod validation error
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Validation Error",
        message: "Invalid request data",
        details: error.issues,
      });
    }

    // 3. prisma error
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
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          });
      }
    }

    if (error.name === "PrismaClientInitializationError") {
      fastify.log.error("Prisma Init Error: ");
      return reply.status(500).send({
        statusCode: 500,
        error: "Database Connection Error",
        message: "Could not connect to database",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    // 4. fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Validation Error",
        message: error.message,
        details: error.validation,
      });
    }

    // 5. log error
    if (error.statusCode !== 404) {
      fastify.log.error({ err: error, reqId: request.id }, "Unhandled error");
    }

    // 6. default error
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
