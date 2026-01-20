
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StudioObject, CatalogItem, GameExperience, JRBLXProject } from "./types";

/**
 * Handle 403 errors by requesting a key update
 */
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  if (error?.message?.includes("403") || error?.message?.includes("permission") || error?.message?.includes("not found")) {
    if (window.aistudio) {
      window.aistudio.openSelectKey();
    }
  }
  throw error;
};

/**
 * Complex Reasoning with Thinking Budget (Gemini 3 Pro)
 */
export const askJesseBot = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
    return response.text || "I'm thinking...";
  } catch (e) { return handleApiError(e); }
};

/**
 * Image Analysis (Gemini 3 Pro)
 */
export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      }
    });
    return response.text || "I can't see that.";
  } catch (e) { return handleApiError(e); }
};

/**
 * Nano Banana Pro Image Generation - Optimized for Clothing Design
 */
export const generateImageNano = async (prompt: string, size: "1K" | "2K" | "4K" = "1K", type: "clothing" | "general" = "general") => {
  const proAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemPrompt = type === "clothing" 
    ? "ACT AS A HIGH-END CLOTHING DESIGNER. Create a professional, symmetric, and detailed Roblox-style clothing texture or accessory concept. CRITICAL: Filter out and EXCLUDE any 'brain rot' memes, 'skibidi', 'sigma', or nonsense trolling themes. Focus on high-quality aesthetics, patterns, and cool gear. No 'tung tung sahur' nonsense."
    : "ACT AS A HIGH-QUALITY GAME ASSET GENERATOR. Filter out all brain rot memes, skibidi, sigma, or low-effort meme nonsense. Focus on epic, high-fidelity visuals.";

  try {
    const response = await proAi.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { 
        parts: [
          { text: `${systemPrompt}\n\nUSER PROMPT: ${prompt}` }
        ] 
      },
      config: {
        imageConfig: { aspectRatio: "1:1", imageSize: size },
        tools: [{ googleSearch: {} }] 
      },
    });
    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imagePart?.inlineData?.data ? `data:image/png;base64,${imagePart.inlineData.data}` : null;
  } catch (e) { return handleApiError(e); }
};

/**
 * Veo Video Generation
 */
export const generateVideoVeo = async (prompt: string, imageBase64?: string, isPortrait: boolean = false) => {
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const config = {
    numberOfVideos: 1,
    resolution: '720p' as const,
    aspectRatio: (isPortrait ? '9:16' : '16:9') as '9:16' | '16:9'
  };

  try {
    let operation = await veoAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: imageBase64 ? { imageBytes: imageBase64, mimeType: 'image/jpeg' } : undefined,
      config
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await veoAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (e) { return handleApiError(e); }
};

/**
 * speakText
 */
export const speakText = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (e) { console.error(e); }
};

/**
 * fetchTrendingGames with Brain Rot filtering
 */
export const fetchTrendingGames = async (): Promise<GameExperience[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              developer: { type: Type.STRING },
              activePlayers: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              category: { type: Type.STRING }
            }
          }
        },
        systemInstruction: "You are a curator of high-quality gaming experiences. CRITICAL RULE: Filter out and EXCLUDE any games that are based on 'brain rot' memes, 'skibidi', 'sigma', nonsense meme songs (e.g., 'tung tung sahur' or similar Italian brain rot), or low-effort trash memes. Focus on actual high-quality, popular experiences like Brookhaven, Blox Fruits, Doors, etc. Do not include games intended for nonsensical meme trolling."
      },
      contents: "Find real, currently trending high-quality Roblox experiences using Google Search. Return top 12.",
    });
    
    const raw = JSON.parse(response.text || '[]');
    return raw.map((g: any) => ({
      ...g,
      thumbnail: `https://picsum.photos/seed/${g.id || Math.random()}/600/400`,
      url: g.id || 'game'
    }));
  } catch (e) { return handleApiError(e); }
};

export const remakeRobloxGame = async (gameTitle: string): Promise<StudioObject[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `RECONSTRUCT JESSEBLOX WORLD: "${gameTitle}". 
      MANDATORY: High detail architecture (wedges, cylinders, trusses). Use neon for highlights. NPCs required. 
      Avoid any brain rot or meme themes unless specifically requested by the title. Focus on actual architectural detail.
      Return JSON list of StudioObjects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['box', 'sphere', 'cylinder', 'wedge', 'character', 'npc', 'spawnlocation', 'tree', 'light'] },
              name: { type: Type.STRING },
              position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              scale: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              rotation: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              color: { type: Type.STRING },
              material: { type: Type.STRING },
              script: { type: Type.STRING }
            },
            required: ["id", "type", "name", "position", "scale", "color", "material"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) { return handleApiError(e); }
};

export const generateStudioScene = async (prompt: string, currentObjects: StudioObject[]): Promise<StudioObject[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Build: "${prompt}". Existing objects: ${currentObjects.length}. Return full JSON scene array. NO BRAIN ROT.`,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['box', 'sphere', 'cylinder', 'wedge', 'character', 'npc', 'spawnlocation', 'tree', 'light'] },
              name: { type: Type.STRING },
              position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              scale: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              rotation: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              color: { type: Type.STRING },
              material: { type: Type.STRING },
              script: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) { return handleApiError(e); }
};

export const fetchCollectibles = async (): Promise<{ items: CatalogItem[], sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Popular Roblox limiteds JSON list.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });
    return { items: JSON.parse(response.text || '[]'), sources: [] };
  } catch (e) { return handleApiError(e); }
};

export const generateAvatarDescription = async (theme: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest Roblox outfit: ${theme}`,
    });
    return response.text || "Epic!";
  } catch (e) { return handleApiError(e); }
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}
