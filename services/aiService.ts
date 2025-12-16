
import { GoogleGenAI, Type } from "@google/genai";

/**
 * [MODÜL: AI SERVİSİ]
 * Amaç: Google Gemini API ile iletişim kurarak araç verilerini analiz etmek.
 * Prensip: Interface Segregation (Sadece gerekli veriyi döndürür).
 */

const API_KEY = process.env.API_KEY;

export interface AiVehicleAnalysisResult {
  Marka?: string;
  Model?: string;
  Seri?: string;
  Yıl?: number;
  Yakıt?: string;
  Vites?: string;
  "Kasa Tipi"?: string;
  "Motor Gücü"?: string;
  "Motor Hacmi"?: string;
  Çekiş?: string;
}

export const analyzeVehicleImage = async (base64Image: string): Promise<AiVehicleAnalysisResult | null> => {
  if (!API_KEY) {
    console.error("[AI_SERVICE_ERROR] API Key bulunamadı.");
    throw new Error("API Key yapılandırılmamış.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const base64Data = base64Image.split(',')[1]; // Header'ı temizle

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: `Analyze this vehicle image and extract technical specifications. 
            Return ONLY a JSON object.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
           type: Type.OBJECT,
           properties: {
              Marka: { type: Type.STRING },
              Model: { type: Type.STRING },
              Seri: { type: Type.STRING },
              Yıl: { type: Type.NUMBER },
              Yakıt: { type: Type.STRING },
              Vites: { type: Type.STRING },
              "Kasa Tipi": { type: Type.STRING },
              "Motor Gücü": { type: Type.STRING },
              "Motor Hacmi": { type: Type.STRING },
              Çekiş: { type: Type.STRING }
           }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    
    return JSON.parse(jsonText) as AiVehicleAnalysisResult;

  } catch (error) {
    console.error("[AI_ANALYSIS_ERROR] Gemini analizi başarısız:", error);
    throw error;
  }
};
