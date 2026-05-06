// Proposed Logic for server/_core/llm.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateAIResponse = async (prompt: string, systemContext: string) => {
  // SANITIZATION: Prevent Prompt Injection
  const cleanPrompt = prompt.replace(/{|}|\[|\]/g, ""); // Simple example sanitization
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemContext }, // Rigid system boundary
        { role: "user", content: cleanPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    // Ensure we don't leak internal error details to the client
    throw new Error("AI Processing failed. Please check background job status.");
  }
};
