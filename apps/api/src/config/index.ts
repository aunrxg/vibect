import { env } from "./env";

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,

  database: {
    url: env.DATABASE_URL,
    direct: env.DIRECT_URL,
  },

  cors: {
    origin: env.CORS_ORIGIN,
  },

  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
  },
};

export { env };
