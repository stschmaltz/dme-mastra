import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
  npcGeneratorAgentFast,
  npcGeneratorAgentPro,
} from "../agents/npc-generator-agent";

// Base schema for structured NPC output
const baseNpcFields = {
  name: z.string(),
  race: z.string(),
  gender: z.string(),
  age: z.string(),
  occupation: z.string(),
  personality: z.string(),
  appearance: z.string(),
  quirk: z.string(),
  motivation: z.string(),
};

// Build dynamic schema based on what's requested
function buildNpcSchema(includeSecret: boolean, includeBackground: boolean) {
  return z.object({
    ...baseNpcFields,
    secret: includeSecret ? z.string() : z.string().optional(),
    background: includeBackground ? z.string() : z.string().optional(),
  });
}

const generateNpcStep = createStep({
  id: "generateNpc",
  inputSchema: z.object({
    gender: z.string().optional(),
    race: z.string().optional(),
    occupation: z.string().optional(),
    context: z.string().optional(),
    includeSecret: z.boolean().default(false),
    includeBackground: z.boolean().default(false),
    useFastMode: z.boolean().default(true),
  }),
  outputSchema: z.object({
    npc: z.any(),
  }),
  execute: async ({ inputData }) => {
    const {
      gender,
      race,
      occupation,
      context: setting,
      includeSecret,
      includeBackground,
      useFastMode,
    } = inputData;

    // Select agent based on mode
    const agent = useFastMode ? npcGeneratorAgentFast : npcGeneratorAgentPro;
    console.log(`Using ${useFastMode ? "Fast" : "Pro"} mode agent`);

    const randomSeed = Math.floor(Math.random() * 1000000);
    const timestamp = Date.now();

    let prompt = `Generate a COMPLETELY UNIQUE and CREATIVE D&D 5e NPC (Request ID: ${randomSeed}-${timestamp})`;

    // Build character description
    const descriptors: string[] = [];
    if (gender) descriptors.push(gender);
    if (race) descriptors.push(race);

    if (descriptors.length > 0) {
      prompt += ` who is a ${descriptors.join(" ")}`;
    }

    if (occupation) {
      prompt +=
        descriptors.length > 0
          ? ` working as a ${occupation}`
          : ` who is a ${occupation}`;
    }

    if (setting) {
      prompt += `. Setting: ${setting}`;
    }

    if (includeSecret) {
      prompt += `. You MUST include a 'secret' field with a compelling secret.`;
    }

    if (includeBackground) {
      prompt += `. You MUST include a 'background' field with a detailed backstory (30-60 words).`;
    }

    prompt += `. IMPORTANT: Create an entirely fresh character with unique traits, avoiding any repetition from previous generations. Return ONLY valid JSON with the NPC data.`;

    console.log("Generating NPC with prompt:", prompt);

    // Build schema dynamically based on what's requested
    const npcSchema = buildNpcSchema(includeSecret, includeBackground);

    try {
      const result = await agent.generate(prompt, {
        structuredOutput: {
          schema: npcSchema,
          errorStrategy: "strict",
        },
        modelSettings: {
          temperature: 1.2,
        },
      });

      if (result && result.object) {
        console.log("Generated NPC:", result.object);
        return { npc: result.object };
      }

      throw new Error("No structured output returned");
    } catch (error) {
      console.error("Error generating NPC:", error);
      throw new Error(
        `Failed to generate NPC: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
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
    gender: z.string().optional(),
    race: z.string().optional(),
    occupation: z.string().optional(),
    context: z.string().optional(),
    includeSecret: z.boolean().default(false),
    includeBackground: z.boolean().default(false),
    useFastMode: z.boolean().default(true),
  }),
  outputSchema: z.any(),
})
  .then(generateNpcStep)
  .then(formatNpcStep)
  .commit();
