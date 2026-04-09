import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScamAnalysisResult {
  scam_classification: {
    is_scam: boolean;
    confidence_score: number;
    scam_type: string;
    fraud_family: string;
  };
  behavioral_analysis: {
    primary_manipulation_strategy: string;
    secondary_tactics_detected: string[];
    emotional_pressure_score: number;
    urgency_detected: boolean;
    pressure_words_detected: string[];
  };
  visual_receipt_analysis: {
    authenticity_score: number;
    forgery_risk_level: string;
    font_inconsistencies_detected: boolean;
    alignment_irregularities_detected: boolean;
    timestamp_structure_check: string;
    transaction_id_pattern_check: string;
    currency_format_check: string;
    logo_resolution_check: string;
    editing_artifact_probability: number;
  };
  audio_analysis: {
    deepfake_probability: number;
    voice_emotional_pressure_score: number;
    urgency_detected: boolean;
  };
  financial_risk_assessment: {
    transaction_amount: string;
    exposure_risk_level: string;
    recommended_next_step: string;
  };
  vulnerability_target_analysis: {
    likely_target_group: string;
    probable_loss_type: string;
  };
  executive_summary: string;
}

export async function analyzeScam(inputs: {
  message_text?: string;
  receipt_image?: string; // base64
  voice_note?: string; // base64
  platform: string;
  amount?: string;
  sender_relationship: string;
  confirmation_received: string;
  country: string;
}): Promise<ScamAnalysisResult> {
  const parts: any[] = [];

  let prompt = `You are ScamSentinel AI, a behavioral and financial scam intelligence engine specialized in West Africa (Nigeria, Ghana, Senegal, etc.).
Analyze the following inputs to detect potential scams, specifically focusing on local context (banks like Zenith, GTBank, Kuda, OPay, mobile money like MTN MoMo, Telebirr, etc.).

INPUT METADATA:
- Platform: ${inputs.platform}
- Amount: ${inputs.amount || "Not specified"}
- Relationship: ${inputs.sender_relationship}
- Confirmation Received: ${inputs.confirmation_received}
- Country: ${inputs.country}
`;

  if (inputs.message_text) {
    prompt += `\nMESSAGE TEXT:\n${inputs.message_text}`;
  }

  parts.push({ text: prompt });

  if (inputs.receipt_image) {
    parts.push({
      inlineData: {
        mimeType: "image/png", // Assuming PNG for screenshots, but should be dynamic if possible
        data: inputs.receipt_image.split(",")[1] || inputs.receipt_image,
      },
    });
  }

  if (inputs.voice_note) {
    parts.push({
      inlineData: {
        mimeType: "audio/mp3", // Assuming MP3/WebM
        data: inputs.voice_note.split(",")[1] || inputs.voice_note,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scam_classification: {
            type: Type.OBJECT,
            properties: {
              is_scam: { type: Type.BOOLEAN },
              confidence_score: { type: Type.NUMBER },
              scam_type: { type: Type.STRING },
              fraud_family: { type: Type.STRING },
            },
            required: ["is_scam", "confidence_score", "scam_type", "fraud_family"],
          },
          behavioral_analysis: {
            type: Type.OBJECT,
            properties: {
              primary_manipulation_strategy: { type: Type.STRING },
              secondary_tactics_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
              emotional_pressure_score: { type: Type.NUMBER },
              urgency_detected: { type: Type.BOOLEAN },
              pressure_words_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["primary_manipulation_strategy", "secondary_tactics_detected", "emotional_pressure_score", "urgency_detected", "pressure_words_detected"],
          },
          visual_receipt_analysis: {
            type: Type.OBJECT,
            properties: {
              authenticity_score: { type: Type.NUMBER },
              forgery_risk_level: { type: Type.STRING },
              font_inconsistencies_detected: { type: Type.BOOLEAN },
              alignment_irregularities_detected: { type: Type.BOOLEAN },
              timestamp_structure_check: { type: Type.STRING },
              transaction_id_pattern_check: { type: Type.STRING },
              currency_format_check: { type: Type.STRING },
              logo_resolution_check: { type: Type.STRING },
              editing_artifact_probability: { type: Type.NUMBER },
            },
            required: ["authenticity_score", "forgery_risk_level", "font_inconsistencies_detected", "alignment_irregularities_detected", "timestamp_structure_check", "transaction_id_pattern_check", "currency_format_check", "logo_resolution_check", "editing_artifact_probability"],
          },
          audio_analysis: {
            type: Type.OBJECT,
            properties: {
              deepfake_probability: { type: Type.NUMBER },
              voice_emotional_pressure_score: { type: Type.NUMBER },
              urgency_detected: { type: Type.BOOLEAN },
            },
            required: ["deepfake_probability", "voice_emotional_pressure_score", "urgency_detected"],
          },
          financial_risk_assessment: {
            type: Type.OBJECT,
            properties: {
              transaction_amount: { type: Type.STRING },
              exposure_risk_level: { type: Type.STRING },
              recommended_next_step: { type: Type.STRING },
            },
            required: ["transaction_amount", "exposure_risk_level", "recommended_next_step"],
          },
          vulnerability_target_analysis: {
            type: Type.OBJECT,
            properties: {
              likely_target_group: { type: Type.STRING },
              probable_loss_type: { type: Type.STRING },
            },
            required: ["likely_target_group", "probable_loss_type"],
          },
          executive_summary: { type: Type.STRING },
        },
        required: [
          "scam_classification",
          "behavioral_analysis",
          "visual_receipt_analysis",
          "audio_analysis",
          "financial_risk_assessment",
          "vulnerability_target_analysis",
          "executive_summary",
        ],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
