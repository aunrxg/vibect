// we don't need this, use @vibect/db directly. DO NOT CREATE NEW INSTANCE
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { prisma } from "../lib/prisma";

declare module "fastify" {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  fastify.log.info("Prisma connected");
};

export default fp(prismaPlugin, {
  name: "prisma",
});
