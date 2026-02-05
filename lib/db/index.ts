import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create the connection - this runs on the server only
const sql = neon(process.env.DATABASE_URL!);

// Create the drizzle database instance with schema
export const db = drizzle(sql, { schema });

// Re-export schema for convenience
export * from "./schema";
