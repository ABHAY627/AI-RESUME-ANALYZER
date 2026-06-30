/**
 * Lazy env accessors — values are read at call time, not at import time.
 * This prevents "Missing environment variable" crashes during module evaluation
 * before the .env file has been loaded by the runtime.
 */
function get(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const env = {
    get DATABASE_URL() { return get("DATABASE_URL"); },
    get JWT_SECRET()   { return get("JWT_SECRET"); },
    get GEMINI_API_KEY() { return get("GEMINI_API_KEY"); },
    get BLOB_READ_WRITE_TOKEN() { return get("BLOB_READ_WRITE_TOKEN"); },
    get NODE_ENV() { return process.env.NODE_ENV ?? "development"; },
};
