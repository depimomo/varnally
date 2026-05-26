import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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
- Summer (Light, True, or Soft)
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
    model: "gemini-3.5-flash",
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
          subType: { type: Type.STRING, description: "Sub-type: Bright, True, Dark, Light, or Soft" },
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
    const data = JSON.parse(text);
    
    // Normalize season to exactly match archetypes.json structure
    if (data.season && typeof data.season === "string") {
      const s = data.season.trim();
      if (/^spring/i.test(s)) data.season = "Spring";
      else if (/^summer/i.test(s)) data.season = "Summer";
      else if (/^autumn/i.test(s)) data.season = "Autumn";
      else if (/^winter/i.test(s)) data.season = "Winter";
    }

    // Normalize subType to exactly match archetypes.json structure
    if (data.subType && typeof data.subType === "string") {
      const trimmed = data.subType.trim().toLowerCase();
      if (trimmed === "cool" || trimmed === "warm" || trimmed === "true") {
        data.subType = "True";
      } else if (trimmed.includes("bright") || trimmed.includes("vivid")) {
        data.subType = "Bright";
      } else if (trimmed.includes("dark") || trimmed.includes("deep")) {
        data.subType = "Dark";
      } else if (trimmed.includes("light") || trimmed.includes("pale")) {
        data.subType = "Light";
      } else if (trimmed.includes("soft") || trimmed.includes("muted")) {
        data.subType = "Soft";
      } else {
        // Fallback to capitalizing the first character
        data.subType = data.subType.charAt(0).toUpperCase() + data.subType.slice(1);
      }
    }

    return data;
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Could not analyze color. Please try again with a clearer photo.");
  }
}

export async function regenerateIdPhoto(imageBuffer: ArrayBuffer, mimeType: string): Promise<string> {
  const base64Data = btoa(
    new Uint8Array(imageBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          {
            text: "Analyze the input photo and regenerate a clean biometric ID or passport photo:\n1. Isolate the person. Keep their expression, gaze, and facial features perfectly identical.\n2. If the person in the input photo is wearing a hijab (headscarf):\n   - Keep the hijab perfectly intact.\n   - Ensure that absolutely no hair and no neck are visible.\n   - Change the hijab's color to a clean, solid, solid-toned black.\n   - Maintain the neatness and shape of the hijab.\n3. If the person is NOT wearing a hijab:\n   - Isolate the person's face, neck, and hair.\n   - Replace their clothing with a simple plain solid white round crew-neck t-shirt.\n4. Place the person centered on a plain, solid white background.\n5. It must look like a clean, professionally shot biometric ID or passport photo.\n6. Output ONLY the edited, regenerated image.",
          },
        ],
      },
    ],
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image data returned from image editing model");
}

export async function analyzeMakeupSwatches(
  imageBuffer: ArrayBuffer,
  mimeType: string,
  season: 'Winter' | 'Spring' | 'Summer' | 'Autumn',
  subType: string,
  fullSeasonPresets: any
) {
  const base64Data = btoa(
    new Uint8Array(imageBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );

  const prompt = `
You are an expert personal color analyst and smart makeup matching system.
The user has a personal color season of: **${subType} ${season}**.

Here is the complete seasonal makeup recommendations data for this profile:
${JSON.stringify(fullSeasonPresets, null, 2)}

Your tasks:
1. Carefully examine the uploaded image and AUTO-DETECT the makeup/cosmetic category. It should be classified as one of these:
   - "Foundation" (if it is a liquid foundation, concealer, skin tint, powder swatch, or base product)
   - "Lip" (if it is lipstick, lip gloss, lip tint, lip liner, or lip swatches on skin/lips)
   - "Eye" (if it is eyeshadow, brow product, eyeliner, or eye palette swatches)
   - "Blush" (if it is blush, highlighters, bronzer, or cheek pigment swatches)

2. Identify any visible shade names, brand codes, or numbered swatch labels in the image.

3. Compare these swatches/shades against their seasonal profile guidelines in the AUTO-DETECTED category.
   - Winter matches deep/cool, high saturation, clear contrast tones.
   - Summer matches cool/muted, pastel, dusty pink/mauve tones.
   - Spring matches bright/warm, yellow-gold, coral, peach peach tones.
   - Autumn matches warm, muted tones, earth pigments, terracotta, or golden bronze tones.

4. If NONE of the shades suit the user's season (e.g. too warm, too muddy, or too contrasting), set "matchFound" to false, explain why in "explanation", and return empty array for "matches".
5. If there are suitable options, choose between 1 and 3 matching shades that harmonize beautifuly.
   - For each match, estimate a "hexColor" representing this shade in the image.
   - Calculate a "matchScore" from 0 to 100 based on exact season alignment.
6. Provide a consolidated "explanation" summarizing the assessment.

Output MUST be a valid JSON object matching this schema exactly. Do not output anything other than JSON:
{
  "detectedCategory": "Foundation" | "Lip" | "Eye" | "Blush",
  "matchFound": boolean,
  "explanation": string,
  "matches": [
    {
      "shadeName": string,
      "reasoning": string,
      "matchScore": number,
      "hexColor": string
    }
  ]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      {
        parts: [
          { text: prompt },
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
      systemInstruction: "You are a professional makeup color matching system. Output MUST be valid JSON according to the schema provided.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedCategory: { type: Type.STRING, description: "The detected makeup category: Foundation, Lip, Eye, or Blush" },
          matchFound: { type: Type.BOOLEAN, description: "Whether any suitable shades were found matching the user color season" },
          explanation: { type: Type.STRING, description: "Summarize findings: no match found, or how the matching swatches compare to their color profile" },
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                shadeName: { type: Type.STRING, description: "Color shade name, brand code, or label as identified on swatches" },
                reasoning: { type: Type.STRING, description: "The specific why this shade makes a great match for their skin/season" },
                matchScore: { type: Type.INTEGER, description: "Rating from 0 to 100 on correctness" },
                hexColor: { type: Type.STRING, description: "Estimated hex code of this matching color swatch (e.g. #E05F66)" }
              },
              required: ["shadeName", "reasoning", "matchScore", "hexColor"]
            }
          }
        },
        required: ["detectedCategory", "matchFound", "explanation", "matches"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse matching response:", text);
    throw new Error("Could not parse matching results. Please make sure the photo contains clear swatch colors.");
  }
}

export async function visualizeMakeup(
  faceImageUrl: string,
  category: string,
  shadeName: string,
  hexColor: string
): Promise<string> {
  // Obtain base64 encoded image and mime type
  let base64Data = "";
  let mimeType = "image/png";

  if (faceImageUrl.startsWith("data:")) {
    const parts = faceImageUrl.split(",");
    mimeType = parts[0].split(":")[1].split(";")[0];
    base64Data = parts[1];
  } else {
    // Fetch external URL if any
    const response = await fetch(faceImageUrl);
    const arrayBuffer = await response.arrayBuffer();
    mimeType = response.headers.get("content-type") || "image/png";
    base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
  }

  const promptText = `Analyze the person's face in the photo and apply the following makeup product naturally:
Product Category: ${category}
Product Shade Name: ${shadeName}
Approximate Color Hex Code: ${hexColor}

Instructions:
1. Apply this makeup carefully, subtly, and beautifully onto the corresponding facial area (e.g. lips for Lip category, cheeks/blush area for Blush, eyelids/eyeshadow area for Eye, or a flattering matched skin tone foundation all over the face for Foundation).
2. Ensure the facial features, expressions, eye gaze, hair/hijab, and background remain completely identical. Only overlay the makeup product smoothly to show how it looks "in action" on their skin.
3. Keep the application flawless and professional like a high-end cosmetic advertisement try-on.
4. Output ONLY the edited, regenerated face image.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    ],
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image data returned from image editing model");
}
