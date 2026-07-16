import Anthropic from "@anthropic-ai/sdk";

// Server-side only. Never import this file from a Client Component.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
