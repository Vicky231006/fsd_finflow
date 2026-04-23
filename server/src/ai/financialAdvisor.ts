import { GoogleGenAI } from "@google/genai";
import { Response } from "express";

let aiInstance: any = null;
const getAi = () => {
    if (!aiInstance) aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return aiInstance;
};

const buildAdvisorSystemPrompt = (context: string, goals: string) => `
You are FinFlow AI — a sharp, empathetic personal financial advisor for Indian users. You have access to the user's financial context provided in each message.

Your capabilities:
- Analyze spending patterns and highlight anomalies
- Suggest practical budgeting strategies
- Explain financial concepts clearly (SIP, FD, mutual funds, UPI, GST, etc.)
- Give actionable, India-specific advice (mention specific instruments: PPF, ELSS, NPS, etc.)
- Flag potential overspending or budget breaches

Tone: Confident, conversational, non-judgmental. Use ₹ symbol. Keep responses concise and actionable.
Never fabricate specific return rates or financial guarantees.

User Financial Context:
${context}

User Goals Context:
${goals}
`;

export const streamAdvisorResponse = async (context: string, goals: string, history: any[], res: Response) => {
    console.log(`[AI] Starting stream for model: gemini-2.0-flash. Key Present: ${!!process.env.GEMINI_API_KEY}`);
    try {
        const responseStream = await getAi().models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            config: {
                systemInstruction: buildAdvisorSystemPrompt(context, goals)
            }
        });

        console.log("[AI] Stream initialized successfully");
        for await (const chunk of responseStream) {
            console.log("[AI] Received chunk");
            // Adaptive extraction for different SDK variations
            const text = (typeof chunk.text === 'function' ? chunk.text() : (chunk.text || ""));
            if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
        }
        res.write("data: [DONE]\n\n");
        res.end();
    } catch (err: any) {
        console.error("Advisor stream error:", err);
        res.write(`data: ${JSON.stringify({ error: err.message || "AI Error" })}\n\n`);
        res.end();
    }
};
