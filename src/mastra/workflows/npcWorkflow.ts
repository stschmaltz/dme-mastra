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
    const {
      race,
      occupation,
      context: setting,
      includeSecret,
      includeBackground,
    } = inputData;

    const randomSeed = Math.floor(Math.random() * 1000000);
    const timestamp = Date.now();

    let prompt = `Generate a COMPLETELY UNIQUE and CREATIVE D&D 5e NPC (Request ID: ${randomSeed}-${timestamp})`;

    if (race) {
      prompt += ` who is a ${race}`;
    }

    if (occupation) {
      prompt += race
        ? ` working as a ${occupation}`
        : ` who is a ${occupation}`;
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

    prompt += `. IMPORTANT: Create an entirely fresh character with unique traits, avoiding any repetition from previous generations. Return ONLY valid JSON with the NPC data.`;

    console.log("Generating NPC with prompt:", prompt);

    try {
      const result = await npcGeneratorAgent.generate(prompt, {
        providerOptions: {
          openai: {
            reasoningEffort: "low",
          },
        },
        modelSettings: {
          temperature: 1.2,
        },
      });

      if (result && typeof result.text === "string") {
        console.log("Raw NPC result:", result.text);
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
