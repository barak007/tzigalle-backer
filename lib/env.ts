/**
 * Centralized environment variable validation and configuration
 * This ensures all environment variables are validated once and reused throughout the app
 *
 * SECURITY NOTES:
 * - NEXT_PUBLIC_* variables are safe to expose to the client (browser)
 * - SUPABASE_ANON_KEY is designed to be public and protected by RLS policies
 * - SUPABASE_SERVICE_ROLE_KEY is only used in scripts and should be accessed directly there
 */

const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Client-safe environment variables (exposed to browser)
// These are safe to use anywhere (client or server)
export const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: validateEnvVar(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: validateEnvVar(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;

// Type-safe environment variable access
export type Env = typeof ENV;
