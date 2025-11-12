import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { instructions } from "./npc-generator-agent-instructions";

export const npcGeneratorAgentInputSchema = z.object({
  race: z.string().optional(),
  occupation: z.string().optional(),
  context: z.string().optional(),
  includeSecret: z.boolean().default(false),
  includeBackground: z.boolean().default(false),
});

export type NpcGeneratorAgentInput = z.infer<typeof npcGeneratorAgentInputSchema>;

export const npcGeneratorAgent = new Agent({
  name: "NPC Generator Agent",
  model: openai("gpt-4o-mini"),
  instructions,
});

