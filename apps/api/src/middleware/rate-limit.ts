import fastifyRateLimit from "@fastify/rate-limit";
import { FastifyPluginAsync } from "fastify";
import { config } from "../config";

export const rateLimitPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyRateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    redis: fastify.redis,
    skipOnError: true,
  });
};
