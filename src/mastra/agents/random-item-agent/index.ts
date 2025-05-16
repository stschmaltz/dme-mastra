import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { instructions } from "./random-item-agent-instructions";

// The Zod schema can be exported for use by callers of this agent
export const randomItemAgentInputSchema = z.object({
  partyLevel: z.number().int().min(1).max(20).default(3),
  randomItemCount: z.number().int().min(0).max(10).default(2),
  context: z.string().optional(),
});

export type RandomItemAgentInput = z.infer<typeof randomItemAgentInputSchema>;

// This agent's primary role is to use its instructions with an LLM to generate text.
// It doesn't need specific tools. The output is expected to be a JSON array of strings.
export const randomItemAgent = new Agent({
  name: "Creative Treasure Generator Agent",
  model: openai("gpt-4.1-mini"), // Or another model suitable for creative generation
  instructions,
  // inputSchema is not directly part of AgentConfig.
  // The input type/schema is typically handled by the run method's caller
  // or within an execute method if defined.
  // The agent's instructions will guide the LLM on how to use the input provided to agent.run({ input: ... })
  // No specific tools needed for this agent.
  // The agent framework will handle the LLM call based on instructions and input.
  // We expect the LLM to return a JSON string array, which the agent should output.
  // If the LLM doesn't directly output parseable JSON, adjustments to instructions
  // or adding a light parsing step in an execute() method might be needed.
  // For now, relying on strong instructions for the LLM to format output correctly.

  // If direct LLM output parsing is tricky, we could add an execute method:
  /*
  async execute(ctx) {
    const { randomItemCount } = ctx.input;
    if (randomItemCount === 0) {
      return [];
    }
    // The BaseAgent would have made an LLM call and the result is in ctx.llmResponse
    // Assuming ctx.llmResponse contains the raw text from the LLM
    let rawResponse = ctx.llmResponse?.content;
    if (typeof rawResponse !== 'string') {
        // Fallback or error if LLM response is not as expected
        console.warn("LLM response not a string for randomItemAgent, attempting to generate placeholders.");
        rawResponse = Array.from({ length: randomItemCount }, (_, i) => `Placeholder Item ${i + 1}`).join('\n');
    }

    try {
      // Attempt to parse if LLM is asked to return JSON string directly
      // Or split by newline if LLM is asked to return items on new lines
      const items = rawResponse.split('\n').map(name => name.trim()).filter(name => name.length > 0).slice(0, randomItemCount);
       if (items.length < randomItemCount) {
          const placeholdersNeeded = randomItemCount - items.length;
          for (let i = 0; i < placeholdersNeeded; i++) {
            items.push(`Fallback Random Item ${items.length + 1} (LLM provided too few)`);
          }
      }
      return items; // Expecting an array of strings
    } catch (e) {
      console.error("Error parsing LLM response in randomItemAgent:", e);
      // Fallback if parsing fails
      return Array.from({ length: randomItemCount }, (_, i) => `Parsing Fallback Item ${i + 1}`);
    }
  }
  */
});

// Registering with the new Agent class if BaseAgent is not the final one
// export const randomItemAgent = new Agent({
//   name: "Creative Treasure Generator Agent",
//   model: openai("gpt-4.1-mini"),
//   instructions,
//   inputSchema: randomItemAgentInputSchema,
// });
