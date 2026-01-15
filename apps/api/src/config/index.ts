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
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: env.SUPABASE_JWT_SECRET,
  },

  redis: {
    url: env.REDIS_URL,
  },

  youtube: {
    key: env.YOUTUBE_API_KEY,
  },

  logging: {
    level: env.LOG_LEVEL,
  },

  rateLimit: {
    max: 100,
    timeWindow: "15 minutes",
  },
};

export { env };
