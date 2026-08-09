import { GoogleGenAI, Type } from "@google/genai";
import { ToolType, MapPoint, RouteSettings } from "../types";

const getSystemPrompt = (): string => {
  return "Eres un consultor experto senior en logística integral. Manejas a la perfección el manual MF1012 (Distribución Capilar), MF1013 (Transporte de Larga Distancia) y la normativa ADR (Mercancías Peligrosas). Tu objetivo es ayudar a profesionales del sector a resolver dudas técnicas, operativas y legales. Responde de forma técnica, rápida, estructurada y en español.";
};

export const generateLogisticsResponse = async function* (
  type: ToolType, 
  userInput: string,
  points?: MapPoint[],
  settings?: RouteSettings
): AsyncGenerator<string, void, unknown> {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key no configurada. Por favor, revisa las variables de entorno.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let prompt = "";
    let schema: any = undefined;
    let responseMimeType = "text/plain";

    if (type === ToolType.ROUTE) {
      responseMimeType = "application/json";
      
      const settingsInfo = settings 
        ? `\nCONFIGURACIÓN DEL VEHÍCULO Y ENTORNO:
        - Tipo de Vehículo: ${settings.vehicleType.toUpperCase()}
        - Capacidad Máxima del Vehículo: ${settings.maxCapacity} kg
        - Estado de Tráfico Esperado: ${settings.trafficLevel.toUpperCase()}\n`
        : "";

      const pointsInfo = points && points.length > 0 
        ? `\nLISTADO DE ENTREGAS (Mapa):\n${points.map((p, i) => `[ID ${i}] Nombre: ${p.label || `Punto ${i + 1}`}
          * Latitud: ${p.lat}, Longitud: ${p.lng}
          * Ventana de Entrega: ${p.timeWindow || 'Sin restricción'}
          * Peso de Entrega: ${p.weight ? `${p.weight} kg` : '0 kg'}
          * Prioridad: ${(p.priority || 'media').toUpperCase()}
          * Notas: ${p.notes || 'Ninguna'}`).join('\n\n')}`
        : "";
      
      prompt = `Actúa como un planificador de tráfico de última milla experimentado. Optimiza la siguiente ruta de distribución capilar para un reparto de mercancías. 
      Analiza detalladamente las siguientes restricciones operativas para calcular el itinerario óptimo:
      1. Tráfico: Nivel ${settings?.trafficLevel || 'medio'}. Ajusta los tiempos de tránsito y velocidades medias en tu análisis.
      2. Ventanas de entrega específicas: Asegura que la secuencia propuesta respete las franjas horarias solicitadas por cada cliente.
      3. Capacidad del vehículo: El vehículo de tipo "${settings?.vehicleType || 'furgoneta'}" tiene una capacidad máxima de ${settings?.maxCapacity || '1000'} kg. Verifica si la suma de los pesos de las mercancías asignadas excede esta capacidad. En tu informe, analiza la carga total a transportar y el grado de ocupación del vehículo.
      4. Prioridades de entrega: Los clientes con prioridad ALTA son preferentes, pero equilibra su atención con la proximidad geográfica y las restricciones horarias para evitar rodeos ineficientes.

      ${settingsInfo}
      ${pointsInfo}
      
      Instrucciones adicionales: "${userInput}"
      
      Debes devolver UN OBJETO JSON con:
      1. explanation: Una explicación detallada y estructurada en formato Markdown que sea clara y profesional para un despacho de tráfico. Debe incluir:
         - Resumen de la Secuencia de Paradas (desde el punto de origen, indicando tiempos acumulados estimados y horas de paso lógicas).
         - Análisis de la Capacidad de Carga de Vehículo (peso total de la ruta vs capacidad máxima de ${settings?.maxCapacity || '1000'} kg, grado de saturación).
         - Análisis del Impacto del Tráfico (${settings?.trafficLevel || 'medio'}) sobre el rendimiento de las entregas y rutas alternativas.
         - Detalle de la Ventana Horaria y Prioridades (el por qué del orden elegido, especialmente respecto a paradas de prioridad ALTA).
         - Consejos prácticos de estiba de la carga (orden inverso de entrega) y de conducción eficiente adaptada a las paradas.
      2. optimizedSequence: El orden numérico óptimo de los índices [ID X] de los puntos proporcionados (por ejemplo, [0, 2, 1, 3]).`;
      
      schema = {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING, description: "Análisis y hoja de ruta estructurada en Markdown." },
          optimizedSequence: { 
            type: Type.ARRAY, 
            items: { type: Type.INTEGER },
            description: "Secuencia numérica optimizada basada en los índices originales de los puntos."
          }
        },
        required: ["explanation", "optimizedSequence"]
      };
    } else if (type === ToolType.CONTRACT) {
      prompt = `Redacta un borrador estructurado o las cláusulas legales clave para el siguiente supuesto, basándote en la Ley del Contrato de Transporte Terrestre y normativa vigente (LOTT/ROTT).\n\nSupuesto: "${userInput}"`;
    } else {
      prompt = `Responde a la siguiente consulta técnica sobre logística integral, normativa internacional o mercancías peligrosas (ADR):\n\nConsulta: "${userInput}"`;
    }

    const response = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: getSystemPrompt(),
        temperature: 0.7,
        responseMimeType: responseMimeType as any,
        responseSchema: schema
      },
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let message = error.message || "Error desconocido";
    throw new Error(message);
  }
};