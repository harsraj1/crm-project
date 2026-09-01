import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGO_URI: z.string().min(1).default('mongodb://localhost:27017/crm'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must contain at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_COOKIE_EXPIRES_IN: z.coerce.number().positive().default(7),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  KAFKA_ENABLED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  KAFKA_BROKER: z.string().min(1).default('localhost:9092'),
  TRUST_PROXY: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  AI_PROVIDER: z.enum(['openai', 'huggingface']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  HF_TOKEN: z.string().optional(),
  HF_MODEL: z.string().default('mistralai/Mistral-7B-Instruct-v0.2')
});

export const validateConfig = (source = process.env) => {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  if (result.data.NODE_ENV === 'production' && result.data.JWT_SECRET.length < 32) {
    throw new Error('Invalid environment configuration:\nJWT_SECRET: production secrets must contain at least 32 characters');
  }

  return result.data;
};
