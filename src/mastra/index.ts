import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { LibSQLStore } from "@mastra/libsql";
import { VercelDeployer } from "@mastra/deployer-vercel";

import { lootAgent } from "./agents/loot-agent";

// Ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in your Vercel environment variables
if (!process.env.TURSO_DATABASE_URL) {
  throw new Error(
    "TURSO_DATABASE_URL environment variable is not set. The Mastra server will not start."
  );
}
if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error(
    "TURSO_AUTH_TOKEN environment variable is not set. The Mastra server will not start."
  );
}
// Also ensure VERCEL_TOKEN is set if you're using VercelDeployer
if (!process.env.VERCEL_TOKEN) {
  throw new Error(
    "VERCEL_TOKEN environment variable is not set. The Mastra server will not start."
  );
}

console.log(
  "[DEBUG] Mastra: Attempting to initialize LibSQLStore. TURSO_DATABASE_URL value:",
  process.env.TURSO_DATABASE_URL
);
console.log(
  "[DEBUG] Mastra: typeof TURSO_DATABASE_URL:",
  typeof process.env.TURSO_DATABASE_URL
);
if (process.env.TURSO_DATABASE_URL) {
  const urlVal = process.env.TURSO_DATABASE_URL;
  console.log(`[DEBUG] Mastra: URL as string: '${urlVal}'`);
  console.log(`[DEBUG] Mastra: URL length: ${urlVal.length}`);
  let charCodes = "";
  for (let i = 0; i < Math.min(urlVal.length, 15); i++) {
    charCodes += urlVal.charCodeAt(i) + " ";
  }
  console.log("[DEBUG] Mastra: URL first 15 char codes:", charCodes.trim());
} else {
  console.log("[DEBUG] Mastra: TURSO_DATABASE_URL is null or undefined.");
}

export const mastra = new Mastra({
  agents: { lootAgent },
  storage: new LibSQLStore({
    url: process.env.TURSO_DATABASE_URL, // Use Turso URL from env var
    authToken: process.env.TURSO_AUTH_TOKEN, // Use Turso token from env var
  }),
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
  server: {
    middleware: [
      {
        handler: async (c, next) => {
          c.header("Access-Control-Allow-Origin", "*");
          c.header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
          );
          c.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, X-Requested-With"
          );
          if (c.req.method === "OPTIONS") {
            return new Response(null, { status: 204 });
          }
          await next();
        },
        path: "/api/*",
      },
    ],
  },
  deployer: new VercelDeployer({
    teamSlug: "shane-schmaltzs-projects",
    projectName: "dme-mastra",
    token: process.env.VERCEL_TOKEN!,
  }),
});
