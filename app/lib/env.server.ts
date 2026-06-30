function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const env = {
    DATABASE_URL: requireEnv("DATABASE_URL"),
    JWT_SECRET: requireEnv("JWT_SECRET"),
    GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),
    BLOB_READ_WRITE_TOKEN: requireEnv("BLOB_READ_WRITE_TOKEN"),
    NODE_ENV: process.env.NODE_ENV ?? "development",
};
