import Fastify from "fastify";
import { config } from "./config";
import fastifyHelmet from "@fastify/helmet";

// plugins
import prismaPlugin from "./plugins/prisma";
import errorHandler from "./plugins/error-handler";
import cors from "./plugins/cors";
import auth from "./plugins/auth";

// routes
import spaceRoute from "./modules/spaces/spaces.routes";
import songRoutes from "./modules/songs/songs.routes";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.logging.level,
      transport:
        config.env === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    },
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });

  // plugins
  await app.register(cors);
  await app.register(errorHandler);
  await app.register(prismaPlugin);
  await app.register(auth);

  // health check
  app.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });

  // routes
  app.register(spaceRoute, { prefix: "/api/v1/spaces" });
  app.register(songRoutes, { prefix: "/api/v1/songs" });

  return app;
}
