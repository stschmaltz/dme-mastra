import { Agent } from "@mastra/core";
import { lootTool } from "../tools/lootTool";
import { openai } from "@ai-sdk/openai";

export const lootAgent = new Agent({
  name: "Loot Agent",
  model: openai("gpt-4.1"),

  instructions:
    "You generate loot for a 5e Dungeons and Dragons campaign. if the user doesn't specify the required parameters use random values. Generate 5 items of various categories with the loot tool. Tell the user what values were used. Include 3 items in addition to the other 5 that are made up trinkets not from the loot tool Return valid JSON only.",
  tools: { lootTool },
});
