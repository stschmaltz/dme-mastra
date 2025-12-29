import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { instructions } from "./npc-generator-agent-instructions";

export const npcGeneratorAgentInputSchema = z.object({
  race: z.string().optional(),
  occupation: z.string().optional(),
  context: z.string().optional(),
  includeSecret: z.boolean().default(false),
  includeBackground: z.boolean().default(false),
  useFastMode: z.boolean().default(true),
});

export type NpcGeneratorAgentInput = z.infer<
  typeof npcGeneratorAgentInputSchema
>;

// Fast mode agent using Gemini 2.5 Flash
export const npcGeneratorAgentFast = new Agent({
  name: "NPC Generator Agent (Fast)",
  id: "npc-generator-agent-fast",
  model: google("gemini-2.5-flash"),
  instructions,
});

// Pro mode agent using Gemini 3 Pro Preview
export const npcGeneratorAgentPro = new Agent({
  name: "NPC Generator Agent (Pro)",
  id: "npc-generator-agent-pro",
  model: google("gemini-3-pro-preview"),
  instructions,
});

// Default export for backwards compatibility
export const npcGeneratorAgent = npcGeneratorAgentFast;
