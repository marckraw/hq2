import dotenv from "dotenv";
import { z } from "@hono/zod-openapi";

// Load environment variables from .env file
dotenv.config();

// Check if we're in test mode
const isTestMode = process.env.NODE_ENV === "test";

// Define a schema for environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  DATABASE_URL: isTestMode ? z.string().default("postgres://test:test@localhost:5432/test") : z.string(),
  ANTHROPIC_API_KEY: isTestMode ? z.string().default("test-anthropic-key") : z.string(),
  OPENAI_API_KEY: isTestMode ? z.string().default("test-openai-key") : z.string(),
  OPENROUTER_API_KEY: isTestMode ? z.string().default("test-openrouter-key") : z.string(),
  ELEVENLABS_API_KEY: isTestMode ? z.string().default("test-elevenlabs-key") : z.string(),
  LEONARDOAI_API_KEY: isTestMode ? z.string().default("test-leonardo-key") : z.string(),
  FIGMA_API_KEY: isTestMode ? z.string().default("test-figma-key") : z.string(),
  GEMINI_API_KEY: isTestMode ? z.string().default("test-gemini-key") : z.string(),
  X_API_KEY: isTestMode ? z.string().default("test-x-key") : z.string(),
  LOG_LEVEL: z.string().default("info"),
  TODOIST_API_TOKEN: z.string().default(""),
  AWS_ACCESS_KEY_ID: isTestMode ? z.string().default("test-aws-key") : z.string(),
  AWS_SECRET_ACCESS_KEY: isTestMode ? z.string().default("test-aws-secret") : z.string(),
  AWS_REGION: isTestMode ? z.string().default("us-east-1") : z.string(),
  S3_BUCKET_NAME: isTestMode ? z.string().default("test-bucket") : z.string(),
  GITHUB_TOKEN: z.string().default(""),
  HQ_SLACK_SECRET: z.string().default(""),
  SLACK_BOT_URL: z.string().default(""),
  STORYBLOK_OAUTH_TOKEN: z.string().default(""),
  STORYBLOK_ACCESS_TOKEN: z.string().default(""),
  // Langfuse LLM Observability Configuration
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_BASE_URL: z
    .string()
    .optional()
    .default("https://cloud.langfuse.com"),
  LANGFUSE_ENABLED: z
    .string()
    .default("true")
    .transform((val) => val === "true"),
  LANGFUSE_FLUSH_AT: z
    .string()
    .default("1")
    .transform((val) => parseInt(val, 10)),
  LANGFUSE_FLUSH_INTERVAL: z
    .string()
    .default("1000")
    .transform((val) => parseInt(val, 10)),
});

// Parse and validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  // Use console.error here since logger isn't available yet during config initialization
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(env.error.format(), null, 4)
  );
  process.exit(1);
}

export const config = env.data;
