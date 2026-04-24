import { GoogleGenAI } from "@google/genai";

let aiInstance: any = null;
const getAi = () => {
    if (!aiInstance) aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return aiInstance;
};

const MOCK_CATEGORIES = [
    "food", "transport", "housing", "entertainment",
    "shopping", "health", "education", "utilities",
    "salary", "freelance", "investment", "other"
];

const PARSING_PROMPT = `
You are a financial data extraction engine. Your ONLY job is to extract transaction data from natural language and return valid JSON. Never add commentary.

Extract:
- amount: number (required, always positive)
- type: "expense" | "income"
- category: one of [${MOCK_CATEGORIES.join(", ")}]
- description: string (clean merchant/purpose name, max 50 chars)
- date: ISO date string (use today if not mentioned)

Rules:
- Payments, debits, spent, bought, paid, sent = expense
- Received, credited, earned, salary, from, got = income
- Understand Indian context: UPI, Swiggy, Zomato, Vada Pav, Biryani, Chai, etc., are common.
- "Rick" or "Auto" is ALWAYS transport.
- "Meds", "medicine", "pharmacy" is ALWAYS health.
- "Stationary", "stationery", "pen", "notebook" is ALWAYS education.
- If it says "from [person/name]", it is ALWAYS income.
- Understand official bank SMS: "debited by [amount]... trf to [merchant]". Extract merchant accurately.
- If amount unclear, return null

Respond ONLY with valid JSON exactly like this:
{"amount": 450, "type": "expense", "category": "food", "description": "Swiggy", "date": "2026-04-12"}

For unparseable input, respond with: {"error": "Cannot parse"}
`;

function fallbackParse(text: string) {
    let amountStr = "";
    const explicitAmountMatch = text.match(/(?:rs\.?|inr|₹)\s*([\d,.]+)|(?:debited|credited)[^0-9]*([\d,.]+)/i);
    if (explicitAmountMatch) {
        amountStr = explicitAmountMatch[1] || explicitAmountMatch[2];
    } else {
        const amountMatch = text.match(/(?<![a-zA-Z])[\d,.]+[kK]?(?![a-zA-Z])/);
        if (!amountMatch) return null;
        amountStr = amountMatch[0];
    }

    amountStr = amountStr.toLowerCase().replace(/,/g, '');
    let multiplier = 1;
    if (amountStr.endsWith('k')) {
        multiplier = 1000;
        amountStr = amountStr.replace('k', '');
    }
    const amount = Number(amountStr) * multiplier;

    const lower = text.toLowerCase();

    // Date detection (DD/MM, DD-MM, DD MMM, MMM DD)
    let date = new Date();
    const dateMatch = text.match(/(\d{1,2})[\/\- ]?([a-zA-Z]{3,9}|\d{1,2})[\/\- ]?(\d{2,4})?/);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const monthStr = dateMatch[2];
        const year = dateMatch[3] ? (dateMatch[3].length === 2 ? "20" + dateMatch[3] : dateMatch[3]) : new Date().getFullYear();

        let month = -1;
        if (!isNaN(parseInt(monthStr))) {
            month = parseInt(monthStr) - 1;
        } else {
            const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            month = months.findIndex(m => monthStr.toLowerCase().startsWith(m));
        }

        if (month !== -1 && day > 0 && day <= 31) {
            date.setFullYear(Number(year), month, day);
        }
    }

    let type = "expense";
    if (lower.match(/\b(salary|earned|received|credited|income|from|got|added)\b/)) type = "income";

    let category = "other";
    if (lower.match(/\b(swiggy|zomato|food|restaurant|grocery|mart|biscuit|cake|chai|coffee|snacks|icecream|vada pav|pav bhaji|samosa|pani puri|biryani|maggi|breakfast|lunch|dinner|thali|dosa|idli|momos|pizza|burger|chocolate|canteen)\b/)) category = "food";
    else if (lower.match(/\b(uber|ola|petrol|cab|rickshaw|auto|train|ticket|flight|bus|rick|auto)\b/)) category = "transport";
    else if (lower.match(/\b(amazon|flipkart|shopping|clothes|myntra|shoes|bag)\b/)) category = "shopping";
    else if (lower.match(/\b(bill|electricity|water|wifi|recharge|jio|airtel|mobile)\b/)) category = "utilities";
    else if (lower.match(/\b(movie|netflix|spotify|party|club|game|steam)\b/)) category = "entertainment";
    else if (lower.match(/\b(meds|medicine|medicines|doctor|pharmacy|clinic|hospital|pill|pills)\b/)) category = "health";
    else if (lower.match(/\b(stationary|stationery|book|books|pen|notebook|college|school|tuition)\b/)) category = "education";
    else {
        for (const cat of MOCK_CATEGORIES) {
            if (lower.includes(cat)) {
                category = cat;
                break;
            }
        }
    }

    let description = text.substring(0, 40).replace(amountStr, "").trim();
    const smsMerchantMatch = text.match(/(?:trf to|transfer to|paid to|sent to|credited to|info|vpa|to)\s+([A-Za-z0-9 ]+?)(?:\s+Refno|\s+on|\s+-|\s+Avl|\s+UPI|\s+If|\s*$)/i);
    if (smsMerchantMatch && smsMerchantMatch[1]) {
        description = smsMerchantMatch[1].trim().substring(0, 40);
    } else if (lower.includes('swiggy')) description = 'Swiggy';
    else if (lower.includes('zomato')) description = 'Zomato';
    else if (lower.includes('amazon')) description = 'Amazon';
    else if (lower.includes('flipkart')) description = 'Flipkart';

    return {
        amount,
        type,
        category,
        description: description || "Unknown Transaction",
        date: date.toISOString()
    };
}

export async function parseTransactionText(rawText: string) {
    try {
        const response = await getAi().models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                { role: "user", parts: [{ text: PARSING_PROMPT + "\n\nInput:\n" + rawText }] }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const textResult = (typeof response.text === 'function' ? response.text() : (response.text || ""));
        if (!textResult) return fallbackParse(rawText);
        const parsed = JSON.parse(textResult);
        if (parsed.error) return fallbackParse(rawText);
        return parsed;
    } catch (err) {
        console.error("AI parse error:", err);
        console.log("Using fallback keyword classifier...");
        return fallbackParse(rawText);
    }
}

const BATCH_PARSING_PROMPT = `
You are a financial data extraction engine. Your ONLY job is to extract transaction data from multiple lines of natural language and return a valid JSON array. Never add commentary.

For each line, extract:
- amount: number (required, always positive)
- type: "expense" | "income"
- category: one of [${MOCK_CATEGORIES.join(", ")}]
- description: string (clean merchant/purpose name, max 50 chars)
- date: ISO date string (use today if not mentioned)

Respond ONLY with a valid JSON array of objects.
[{"amount": 450, "type": "expense", "category": "food", "description": "Swiggy", "date": "2026-04-12"}]
`;

export async function parseBatchText(rawText: string) {
    try {
        const response = await getAi().models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                { role: "user", parts: [{ text: BATCH_PARSING_PROMPT + "\n\nInput lines:\n" + rawText }] }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        if (!response.text) return [];
        const parsedArray = JSON.parse(response.text);
        if (!Array.isArray(parsedArray)) return [];
        return parsedArray.filter(t => !t.error);
    } catch (err) {
        console.error("AI batch parse error:", err);
        // Fallback for batch could just split by newline and fallback parse each, but Gemini is better for batch.
        // We'll fallback parse each line just in case!
        console.log("Using fallback keyword classifier for batch...");
        const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
        const results = [];
        for (const line of lines) {
            const res = fallbackParse(line);
            if (res) results.push(res);
        }
        return results;
    }
}
