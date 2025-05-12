import { Agent } from "@mastra/core";
import { lootTool } from "../../tools/lootTool";
import { openai } from "@ai-sdk/openai";
import { prompt } from "./loot-agent-instructions";

export const lootAgent = new Agent({
  name: "Loot Agent",
  model: openai("gpt-4.1"),
  instructions: prompt,
  tools: { lootTool },
});
