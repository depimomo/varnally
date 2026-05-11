import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are an expert personal color analyst. 
Your task is to analyze a photo of a person's bare face and determine their seasonal color palette.
You must be strict and accurate.

CRITICAL VALIDATION:
Before analyzing, you MUST verify if the photo is suitable. A photo is INVALID if:
1. No human face is clearly detected.
2. The lighting is too dark, too bright (blown out), or has a strong colorful tint (e.g., blue, red, or neon lights) that would distort color perception.
3. The person is wearing heavy makeup that hides their natural skin undertone.

If the photo is invalid, set "isValid" to false and provide a helpful "errorMessage" in the JSON.
Otherwise, set "isValid" to true and perform the full analysis:
1. Skin Undertone: (Cool, Warm, or Neutral)
2. Eye Color: (Natural eye color)
3. Hair Root Color: (Natural hair color from roots)

Classify them into one of these strict categories:
- Winter (Bright, True, or Dark)
- Spring (Bright, True, or Light)
- Summer (Cool, True, or Soft)
- Autumn (Soft, True, or Dark)

Provide exactly 5 colors that best suit them and 5 colors they should avoid.
Determine if they suit Gold or Silver jewelry.
`;

export async function analyzeColor(imageBuffer: ArrayBuffer, mimeType: string) {
  const base64Data = btoa(
    new Uint8Array(imageBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: "You are a professional color analyst. Output MUST be valid JSON according to the schema provided.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN, description: "Whether the photo is suitable for analysis" },
          errorMessage: { type: Type.STRING, description: "Helpful error message if isValid is false (e.g., 'Lighting is too dark', 'No face detected')" },
          season: { type: Type.STRING, description: "Strict category: Winter, Spring, Summer, or Autumn" },
          subType: { type: Type.STRING, description: "Sub-type: Bright, True, Dark, Light, Soft, or Cool" },
          bestColors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING },
                name: { type: Type.STRING }
              },
              required: ["hex", "name"]
            },
            description: "5 colors to use"
          },
          avoidColors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING },
                name: { type: Type.STRING }
              },
              required: ["hex", "name"]
            },
            description: "5 colors to avoid"
          },
          jewelry: { type: Type.STRING, description: "Gold or Silver" },
          skinUndertone: { type: Type.STRING },
          eyeColor: { type: Type.STRING },
          hairColor: { type: Type.STRING }
        },
        required: ["isValid", "season", "subType", "bestColors", "avoidColors", "jewelry", "skinUndertone", "eyeColor", "hairColor"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Could not analyze color. Please try again with a clearer photo.");
  }
}
