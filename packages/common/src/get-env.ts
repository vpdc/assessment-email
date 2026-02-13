export interface Env {
  address: string;
  namespace: string;
  // for API Key authentication
  apiKey?: string;
}

export function getEnv(): Env {
  return {
    address: getEnvValue("TEMPORAL_ADDRESS", "localhost:7233"),
    namespace: getEnvValue("TEMPORAL_NAMESPACE", "default"),
    apiKey: process.env.TEMPORAL_API_KEY,
  };
}

export function getEnvValue(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}
