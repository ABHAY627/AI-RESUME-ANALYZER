import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

function getClient(): NeonQueryFunction<false, false> {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    return neon(url);
}

// Lazy singleton
let _sql: NeonQueryFunction<false, false> | undefined;
export function sql(): NeonQueryFunction<false, false> {
    return (_sql ??= getClient());
}
