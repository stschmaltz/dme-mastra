import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { instructions } from "./random-item-agent-instructions";
import { PromptAlignmentMetric, ToxicityMetric } from "@mastra/evals/llm";
import { CompletenessMetric } from "@mastra/evals/nlp";

// The Zod schema can be exported for use by callers of this agent
export const randomItemAgentInputSchema = z.object({
  partyLevel: z.number().int().min(1).max(20).default(3),
  randomItemCount: z.number().int().min(0).max(10).default(2),
  context: z.string().optional(),
});

export type RandomItemAgentInput = z.infer<typeof randomItemAgentInputSchema>;

export const randomItemAgent = new Agent({
  name: "Unofficial Treasure Generator Agent",
  model: openai("gpt-4.1-mini"),
  instructions,
  evals: {
    completeness: new CompletenessMetric(),
    promptAlignment: new PromptAlignmentMetric(openai("gpt-4.1-mini"), {
      instructions: [instructions],
    }),
    toxicity: new ToxicityMetric(openai("gpt-4.1-mini")),
  },
});
