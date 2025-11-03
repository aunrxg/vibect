import { z, ZodError } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),

  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),

  CORS_ORIGIN: z.url().default("http://localhost:3000"),

  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.url(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    console.error("Invalid environment variables:");
    console.error(error);
    process.exit(1);
  }
  throw error;
}

export { env };
