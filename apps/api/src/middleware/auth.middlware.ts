import { FastifyReply, FastifyRequest } from "fastify";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await request.server.supabase.auth.getUser(token);

    if (error || !user) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid token",
      });
    }

    request.user = {
      id: user.id,
      email: user.email!,
    };
  } catch (error) {
    request.log.error({ err: error }, "Auth error");
    return reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Authentication failed",
    });
  }
}

export async function optionalAuth(request: FastifyRequest) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return; // continue withour user
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
    } = await request.server.supabase.auth.getUser(token);

    if (user) {
      request.user = {
        id: user.id,
        email: user.email!,
      };
    }
  } catch (error) {
    request.log.error({ err: error }, "optional auth error");
    // continue withour user
  }
}
