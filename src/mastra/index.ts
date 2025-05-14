import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { LibSQLStore } from "@mastra/libsql";
import { VercelDeployer } from "@mastra/deployer-vercel";

import { weatherAgent } from "./agents";
import { lootAgent } from "./agents/loot-agent";

export const mastra = new Mastra({
  agents: { weatherAgent, lootAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
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
    projectName: "dme-mastra-api",
    // Ensure VERCEL_TOKEN is set in your Vercel project environment variables.
    token: process.env.VERCEL_TOKEN!,
  }),
});
