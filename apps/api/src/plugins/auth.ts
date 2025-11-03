import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { config } from "../config";

declare module "fastify" {
  interface FastifyInstance {
    supabase: SupabaseClient;
  }
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
    };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  fastify.decorate("supabase", supabase);

  fastify.log.info("supabase client intialized");
};

export default fp(authPlugin, {
  name: "auth",
});
