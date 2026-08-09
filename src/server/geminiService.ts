import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

const MODELS_TO_TRY = ["gemini-3.6-flash", "gemini-flash-latest"];

export async function generateContentJSON<T>(
  prompt: string,
  systemInstruction: string,
  fallback: T
): Promise<T> {
  const ai = getGeminiClient();

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const text = response.text ? response.text.trim() : "";
      if (!text) continue;

      const cleanedText = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleanedText) as T;
    } catch (err: any) {
      console.warn(`Gemini JSON generation with model '${modelName}' failed:`, err?.message || err);
    }
  }

  return fallback;
}

export async function generateContentText(
  prompt: string,
  systemInstruction: string,
  fallback: string
): Promise<string> {
  const ai = getGeminiClient();

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      if (response.text) return response.text.trim();
    } catch (err: any) {
      console.warn(`Gemini text generation with model '${modelName}' failed:`, err?.message || err);
    }
  }

  return fallback;
}
