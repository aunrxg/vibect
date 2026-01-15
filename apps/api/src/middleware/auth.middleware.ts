import { FastifyRequest } from "fastify";
import { UnauthorizedError } from "../utils/error";
import { config } from "../config";
import { jwtVerify } from "jose";

export function isAnonymousUser(userId: string): boolean {
  return userId.startsWith("anon_");
}

export async function authenticate(request: FastifyRequest) {
  if (request.method === "OPTIONS") {
    return;
  }
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid header");
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(config.supabase.jwtSecret);

    const { payload } = await jwtVerify(token, secret);

    const userId = payload.sub as string;

    // console.log("Token Length: ", token.length);
    // console.log("TOKEN from client: ", token);
    // request.server.log.debug({ token }, "Token from client");

    // const {
    //   data: { user },
    //   error,
    // } = await request.server.supabase.auth.getUser(token);

    // if (error || !user) {
    //   request.server.log.error({ error }, "Error: ");
    //   console.log("JWT error: ", error);
    //   throw new UnauthorizedError("expired or invalid token");
    // }

    const dbUser = await request.server.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });

    if (!dbUser) {
      throw new UnauthorizedError("User profile not found");
    }

    request.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || undefined,
      isAnonymous: false,
    };

    request.log.info({ userId: userId }, "User authenticated");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    request.log.error({ error }, "Authentication error");
    throw new UnauthorizedError("Authentication failed");
  }
}

export async function authenticateOrAnonymous(request: FastifyRequest) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return; // no header continue without user
    }

    const token = authHeader.substring(7);

    if (token.startsWith("anon_") || token.startsWith("anon-")) {
      request.user = {
        id: token,
        email: `${token}@anonymous.local`,
        name: undefined,
        isAnonymous: true,
      };

      request.log.info({ userId: token }, "Anonymous user");
      return;
    }

    // try to authenticate real user
    const {
      data: { user },
      error,
    } = await request.server.supabase.auth.getUser(token);

    if (user || !error) {
      const dbUser = await request.server.prisma.user.findUnique({
        where: { id: user!.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      });

      if (dbUser) {
        request.user = {
          id: dbUser.id,
          name: dbUser.name || undefined,
          email: dbUser.email,
          isAnonymous: false,
        };

        request.log.info({ userId: user!.id }, "Authenticated user");
      }
    }
  } catch (error) {
    // silent fail
    request.log.debug({ error }, "Auth check failed, continuing without auth");
  }
}
export async function optionalAuth(request: FastifyRequest) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return; // continue withour user
    }

    const token = authHeader.substring(7);

    // Check for anonymous token
    if (token.startsWith("anon_")) {
      request.user = {
        id: token,
        email: `${token}@anonymous.local`,
        name: undefined,
        isAnonymous: true,
      };
      return;
    }

    const {
      data: { user },
    } = await request.server.supabase.auth.getUser(token);

    if (user) {
      const dbUser = await request.server.prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      if (dbUser) {
        request.user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || undefined,
          isAnonymous: false,
        };
      }
    }
  } catch (error) {
    request.log.debug({ err: error }, "optional auth error");
    // continue withour user
  }
}
