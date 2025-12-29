import { Mastra } from "@mastra/core/mastra";
import { ConsoleLogger } from "@mastra/core/logger";
import { LibSQLStore } from "@mastra/libsql";
import { VercelDeployer } from "@mastra/deployer-vercel";

import { randomItemAgent } from "./agents/random-item-agent";
import {
  npcGeneratorAgentFast,
  npcGeneratorAgentPro,
} from "./agents/npc-generator-agent";
import { lootGenerationWorkflow } from "./workflows/lootWorkflow";
import { npcGenerationWorkflow } from "./workflows/npcWorkflow";

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
  bundler: {
    externals: ["@mastra/deployer-vercel"],
  },
  workflows: {
    lootGenerationWorkflow,
    npcGenerationWorkflow,
  },
  agents: {
    randomItemAgent,
    npcGeneratorAgentFast,
    npcGeneratorAgentPro,
  },
  storage: new LibSQLStore({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
  logger: new ConsoleLogger({
    name: "Mastra",
    level: "info",
  }),
  server: {
    middleware: [
      {
        handler: async (c, next) => {
          const allowedOrigins = process.env.ALLOW_LIST_URLS
            ? process.env.ALLOW_LIST_URLS.split(",").map((u) => u.trim())
            : [];
          const origin = c.req.header("Origin") || "";
          if (allowedOrigins.includes(origin)) {
            c.header("Access-Control-Allow-Origin", origin);
          }
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
  deployer: new VercelDeployer(),
});
