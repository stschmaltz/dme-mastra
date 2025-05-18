// agents/loot-agent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { instructions } from "./loot-agent-instructions";

import { lootWorkflowTool } from "../../tools/lootWorkflowTool";
import {
  FaithfulnessMetric,
  PromptAlignmentMetric,
  ToxicityMetric,
} from "@mastra/evals/llm";
import { CompletenessMetric } from "@mastra/evals/nlp";

export const lootAgent = new Agent({
  name: "Loot Agent",
  model: openai("gpt-4o-mini"),
  instructions,
  tools: {
    lootWorkflowTool,
  },
  evals: {
    completeness: new CompletenessMetric(),
    faithfulness: new FaithfulnessMetric(openai("gpt-4.1-mini"), {
      context: [instructions],
    }),
    promptAlignment: new PromptAlignmentMetric(openai("gpt-4.1-mini"), {
      instructions: [instructions],
    }),
    toxicity: new ToxicityMetric(openai("gpt-4.1-mini")),
  },
});
