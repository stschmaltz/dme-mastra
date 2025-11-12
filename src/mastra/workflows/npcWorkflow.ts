import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { npcGeneratorAgent } from "../agents/npc-generator-agent";

const generateNpcStep = createStep({
  id: "generateNpc",
  inputSchema: z.object({
    race: z.string().optional(),
    occupation: z.string().optional(),
    context: z.string().optional(),
    includeSecret: z.boolean().default(false),
    includeBackground: z.boolean().default(false),
  }),
  outputSchema: z.object({
    npc: z.any(),
  }),
  execute: async ({ inputData }) => {
    const { race, occupation, context: setting, includeSecret, includeBackground } = inputData;
    
    let prompt = `Generate a unique D&D 5e NPC`;
    
    if (race) {
      prompt += ` who is a ${race}`;
    }
    
    if (occupation) {
      prompt += race ? ` working as a ${occupation}` : ` who is a ${occupation}`;
    }
    
    if (setting) {
      prompt += `. Setting: ${setting}`;
    }
    
    if (includeSecret) {
      prompt += `. Include a secret.`;
    }
    
    if (includeBackground) {
      prompt += `. Include a background story.`;
    }
    
    prompt += ` Return ONLY valid JSON with the NPC data.`;
    
    try {
      const result = await npcGeneratorAgent.generate(prompt, {
        temperature: 0.9,
      });
      
      if (result && typeof result.text === "string") {
        const npcData = JSON.parse(result.text);
        return { npc: npcData };
      }
    } catch (error) {
      console.error("Error generating NPC:", error);
      throw new Error("Failed to generate NPC");
    }
    
    throw new Error("No valid NPC data returned");
  },
});

const formatNpcStep = createStep({
  id: "formatNpc",
  inputSchema: z.object({
    npc: z.any(),
  }),
  outputSchema: z.any(),
  execute: async ({ inputData }) => {
    const { npc } = inputData;
    
    if (npc && typeof npc === "object" && npc.name) {
      return npc;
    }
    
    throw new Error("Invalid NPC data format");
  },
});

export const npcGenerationWorkflow = createWorkflow({
  id: "npc-generation-workflow",
  inputSchema: z.object({
    race: z.string().optional(),
    occupation: z.string().optional(),
    context: z.string().optional(),
    includeSecret: z.boolean().default(false),
    includeBackground: z.boolean().default(false),
  }),
  outputSchema: z.any(),
})
  .then(generateNpcStep)
  .then(formatNpcStep)
  .commit();

