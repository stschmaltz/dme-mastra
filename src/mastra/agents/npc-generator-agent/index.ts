import { Agent } from "@mastra/core/agent";
// import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { instructions } from "./npc-generator-agent-instructions";

export const npcGeneratorAgentInputSchema = z.object({
  race: z.string().optional(),
  occupation: z.string().optional(),
  context: z.string().optional(),
  includeSecret: z.boolean().default(false),
  includeBackground: z.boolean().default(false),
});

export type NpcGeneratorAgentInput = z.infer<
  typeof npcGeneratorAgentInputSchema
>;

// const model = openai("gpt-5-mini");

export const npcGeneratorAgent = new Agent({
  name: "NPC Generator Agent",
  id: "npc-generator-agent",
  model: google("gemini-pro-latest"),
  instructions,
});
