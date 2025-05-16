// agents/loot-agent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
// Tools are no longer directly used by the agent, they are used by the workflow
// import { lootTool, randomItemTool } from "../../tools";
import { instructions } from "./loot-agent-instructions";
import { CompletenessMetric } from "@mastra/evals/nlp";
import {
  FaithfulnessMetric,
  PromptAlignmentMetric,
  ToxicityMetric,
} from "@mastra/evals/llm";
import { lootWorkflowTool } from "../../tools/lootWorkflowTool";

// The agent might not need any specific tools if the framework handles
// workflow execution based on instructions. If a specific tool is needed
// to trigger workflows, it would be listed here.

export const lootAgent = new Agent({
  name: "Loot Agent",
  model: openai("gpt-4.1-mini"),
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
