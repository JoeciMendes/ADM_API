
import { GoogleGenAI, Type } from "@google/genai";

export const getDashboardInsights = async (stats: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise estas estatísticas do sistema e forneça uma única mensagem de alerta administrativa breve, brutal e de estilo industrial em português (máximo de 10 palavras): ${stats}`,
      config: {
        systemInstruction: "Você é um monitor de sistema de IA retro-industrial frio e eficiente. Suas respostas devem ser em PORTUGUÊS, EM MAIÚSCULAS, autoritárias e breves.",
      }
    });
    return response.text?.trim().toUpperCase() || "STATUS DO SISTEMA: OPERACIONAL";
  } catch (error) {
    console.error("Erro Gemini:", error);
    return "ERRO NO MECANISMO DE IA: REVISÃO MANUAL NECESSÁRIA";
  }
};
