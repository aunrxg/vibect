import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { config } from "../config";

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  });

  fastify.log.info("CORS configured");
};

export default fp(corsPlugin, {
  name: "cors",
});
