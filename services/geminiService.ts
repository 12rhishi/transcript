
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeMedia = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this recording. Provide a detailed transcript, a concise summary, key points, action items (if any), and overall sentiment. Return the response in JSON format.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transcript: { type: Type.STRING },
          summary: { type: Type.STRING },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          actionItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          sentiment: { type: Type.STRING },
        },
        required: ["transcript", "summary", "keyPoints", "actionItems", "sentiment"],
      },
    },
  });

  const resultStr = response.text;
  try {
    return JSON.parse(resultStr);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Analysis failed to produce valid data.");
  }
};
