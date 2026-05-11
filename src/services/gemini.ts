import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are an expert personal color analyst and a precise facial geometrician. 
Your task is to analyze a photo of a person's bare face, determine their seasonal color palette, and accurately classify their face shape.
You must be strict and accurate.

CRITICAL VALIDATION:
Before analyzing, you MUST verify if the photo is suitable. A photo is INVALID if:
1. No human face is clearly detected.
2. The lighting is too dark, too bright (blown out), or has a strong colorful tint (e.g., blue, red, or neon lights) that would distort color perception.
3. The person is wearing heavy makeup that hides their natural skin undertone.

If the photo is invalid, set "isValid" to false and provide a helpful "errorMessage" in the JSON.
Otherwise, set "isValid" to true and perform the full analysis:

COLOR ANALYSIS:
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

FACE ARCHITECTURE ANALYSIS:
1. Estimate relative lengths for: face_length, forehead_width, cheekbone_width, and jawline_width.
2. Observe the lower_face_angle: (rounded, sharp/squared, tapered/pointy).
3. Evaluate these metrics against the following logic to determine the faceShape:
   - Oval: (face_length > cheekbone_width) AND (forehead_width > jawline_width) AND (lower_face_angle == 'rounded')
   - Round: (face_length ≈ cheekbone_width) AND (forehead_width ≈ jawline_width) AND (lower_face_angle == 'rounded')
   - Square: (face_length ≈ cheekbone_width) AND (forehead_width ≈ jawline_width) AND (lower_face_angle == 'sharp/squared')
   - Oblong: (face_length > max(forehead_width, cheekbone_width, jawline_width)) AND (forehead_width ≈ cheekbone_width ≈ jawline_width)
   - Heart: (forehead_width > cheekbone_width) AND (cheekbone_width > jawline_width) AND (lower_face_angle == 'tapered/pointy')
   - Diamond: (cheekbone_width > forehead_width) AND (cheekbone_width > jawline_width) AND (lower_face_angle == 'tapered/pointy')

Return the result as a detailed JSON object.
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
      systemInstruction: "You are a professional color analyst and facial geometrician. Output MUST be valid JSON according to the schema provided.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN, description: "Whether the photo is suitable for analysis" },
          errorMessage: { type: Type.STRING, description: "Helpful error message if isValid is false" },
          season: { type: Type.STRING, description: "Strict category: Winter, Spring, Summer, or Autumn" },
          subType: { type: Type.STRING, description: "Sub-type: Bright, True, Dark, Light, Soft, or Cool" },
          faceShape: { type: Type.STRING, description: "One of: Oval, Round, Square, Oblong, Heart, Diamond" },
          faceShapeDescription: { type: Type.STRING, description: "Brief explanation based on the measurement logic used" },
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
        required: ["isValid", "season", "subType", "bestColors", "avoidColors", "jewelry", "skinUndertone", "eyeColor", "hairColor", "faceShape", "faceShapeDescription"]
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
