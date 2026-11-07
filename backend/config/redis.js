import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  throw new Error(
    'Redis credentials are missing. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env file.'
  );
}

/**
 * Upstash Redis client (HTTP REST based).
 * Works locally and on serverless platforms such as Render.
 */
export const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN
});

/**
 * Verifies that the database is reachable.
 * Used by the health endpoint and during server start-up.
 */
export async function pingRedis() {
  const response = await redis.ping();
  return response === 'PONG' || response === 'pong' || response === true;
}
