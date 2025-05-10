import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { LibSQLStore } from "@mastra/libsql";

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
});
