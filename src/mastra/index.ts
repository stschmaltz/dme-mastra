import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { LibSQLStore } from "@mastra/libsql";
import { VercelDeployer } from "@mastra/deployer-vercel";

import { lootAgent } from "./agents/loot-agent";

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
if (!process.env.VERCEL_TOKEN) {
  throw new Error(
    "VERCEL_TOKEN environment variable is not set. The Mastra server will not start."
  );
}

export const mastra = new Mastra({
  agents: { lootAgent },
  storage: new LibSQLStore({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
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
