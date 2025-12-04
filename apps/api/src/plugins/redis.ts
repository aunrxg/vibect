import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import Redis from "ioredis";
import { config } from "../config";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
    redisSub: Redis;
  }
}

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  const redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  const redisSub = new Redis(config.redis.url);

  redis.on("error", (err) => {
    fastify.log.error({ err }, "Redis Client Error: ");
  });

  redisSub.on("error", (err) => {
    fastify.log.error({ err }, "Redis Sub Client Error: ");
  });

  fastify.decorate("redis", redis);
  fastify.decorate("redisSub", redisSub);

  fastify.addHook("onClose", async () => {
    await redis.quit();
    await redisSub.quit();
  });

  fastify.log.info("Redis connected");
};

export default fp(redisPlugin, {
  name: "redis",
});
