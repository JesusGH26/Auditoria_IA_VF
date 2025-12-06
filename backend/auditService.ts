import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AuditReport, RiskLevel, AuditInputData } from "../types";

// Define the exact JSON schema we want Gemini to return
const auditResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing the overall robustness.",
    },
    riskLevel: {
      type: Type.STRING,
      enum: [RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW, RiskLevel.SAFE],
      description: "The overall calculated risk level.",
    },
    executiveSummary: {
      type: Type.STRING,
      description: "A concise executive summary in Spanish.",
    },
    complianceAlignment: {
      type: Type.STRING,
      description: "Alignment with ISO 27001/NIST/GDPR.",
    },
    detailedAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          score: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ['Optimizado', 'Aceptable', 'Deficiente', 'Crítico'] },
          observation: { type: Type.STRING, description: "Specific finding for this category." },
        },
        required: ["category", "score", "status", "observation"],
      },
      description: "Specific analysis for Risk Analysis, Impact Analysis, Contingency Plan, and Security Policies.",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    weaknesses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Alta", "Media", "Baja"] },
          attackVectors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List 2-3 specific technical or social engineering methods an attacker could use to exploit this weakness. Be technical."
          },
          mitigationSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List 2-3 concrete technical steps or policy changes to mitigate this vulnerability."
          }
        },
        required: ["title", "description", "severity", "attackVectors", "mitigationSteps"],
      },
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "overallScore",
    "riskLevel",
    "executiveSummary",
    "complianceAlignment",
    "detailedAnalysis",
    "strengths",
    "weaknesses",
    "recommendations",
  ],
};

export const analyzeSecurityPlan = async (input: AuditInputData): Promise<AuditReport> => {
  // Debugging logs
  console.log("Iniciando análisis...", input.context);
  
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API Key is undefined");
    throw new Error("Falta la API Key. Crea un archivo .env en la raíz con API_KEY=tu_clave y reinicia la terminal.");
  }

  if (apiKey.includes("PLACEHOLDER") || apiKey.length < 10) {
     console.error("API Key is invalid placeholder");
     throw new Error("La API Key configurada no es válida. Revisa tu archivo .env");
  }

  console.log("API Key detectada correctamente (longitud: " + apiKey.length + ")");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const modelId = "gemini-2.5-flash"; 
    
    // Configuración del contexto
    let contextInstruction = "";
    if (input.context === 'university') {
      contextInstruction = `
        MODO: PROYECTO UNIVERSITARIO / ACADÉMICO.
        - Evalúa la estructura, la coherencia teórica y el entendimiento de conceptos de seguridad.
        - Sé constructivo y didáctico.
        - No penalices severamente la falta de métricas financieras complejas.
        - Enfócate en que el estudiante haya cubierto los puntos básicos correctamente.
      `;
    } else {
      contextInstruction = `
        MODO: AUDITORÍA EMPRESARIAL / CORPORATIVA.
        - Evalúa con MÁXIMO RIGOR PROFESIONAL.
        - Exige cumplimiento estricto de ISO 27001 y NIST.
        - Penaliza la falta de viabilidad de negocio, ausencia de responsables claros o fechas.
        - Prioriza la continuidad de negocio y la protección de activos reales.
      `;
    }

    const systemPrompt = `
      Actúa como un Auditor Senior de Ciberseguridad (CISO), Hacker Ético (Red Team) y Arquitecto de Seguridad (Blue Team).
      ${contextInstruction}
      
      Tu tarea es auditar el documento proporcionado y evaluar estos 4 pilares fundamentales:
      1. Análisis de Riesgos
      2. Análisis de Impacto (BIA)
      3. Plan de Contingencia
      4. Políticas de Seguridad

      IMPORTANTE - DETALLE DE VULNERABILIDADES:
      Para cada debilidad detectada ('weaknesses'), debes proporcionar DOS perspectivas:
      
      1. 'attackVectors' (Red Team): 
         - ¿Cómo explotaría yo esto?
         - Enumera vectores técnicos (ej: SQL Injection, MITM) o sociales concretos.
      
      2. 'mitigationSteps' (Blue Team):
         - ¿Cómo arreglo esto técnicamente?
         - Proporciona pasos de remediación concretos (ej: "Implementar WAF", "Habilitar MFA", "Segmentar VLANs").
      
      Output JSON only.
    `;

    let parts = [];

    if (input.type === 'pdf') {
      parts = [
        { text: systemPrompt },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: input.content
          }
        }
      ];
    } else {
      parts = [
        { text: systemPrompt },
        { text: `El plan a analizar es:\n"""\n${input.content}\n"""` }
      ];
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: auditResponseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("La IA no generó respuesta (texto vacío).");
    }

    const report: AuditReport = JSON.parse(jsonText);
    return report;

  } catch (error: any) {
    console.error("Audit Service Error Detallado:", error);
    const message = error.message || "Error desconocido en el servicio de auditoría";
    if (message.includes("403")) throw new Error("Error de permisos (403): Tu API Key podría ser incorrecta o no tener acceso.");
    if (message.includes("429")) throw new Error("Límite de cuota excedido (429): Has hecho demasiadas peticiones.");
    throw new Error(message);
  }
};