import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  // Relative to this package (drizzle-kit runs here); an absolute Windows path with
  // backslashes is not resolved by drizzle-kit, so keep it relative and POSIX-style.
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
