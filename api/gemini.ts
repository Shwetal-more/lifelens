// This file is designed to run in a serverless environment (e.g., Vercel, Netlify).
// It acts as a secure backend proxy to handle all interactions with the Google Gemini API.

import { GoogleGenAI, type GenerateContentResponse, type Chat, Type } from "@google/genai";
import type { Expense, MoodType, MoodEntry, FinancialGoal, UserProfile, Quest, DecisionChoice, ChatMessage } from "../types";

// In a real deployment, this `API_KEY` would be a secure environment variable
// configured on the hosting platform (e.g., Vercel Environment Variables).
if (!process.env.API_KEY) {
  // This will only throw on the server, which is the correct place to check.
  throw new Error("API_KEY environment variable not set in the serverless environment");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// --- HELPER FUNCTIONS ---

const cleanText = (text: string): string => {
  return text.trim().replace(/\*/g, "");
};

const currencySymbols: { [key: string]: string } = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥',
};


// --- BUSINESS LOGIC (Moved from old frontend service) ---
// All these functions now run securely on the server.

const getEmotionalSpendingInsight_logic = async (
  currentExpense: Omit<Expense, "id" | "date">,
  allExpenses: Expense[],
): Promise<string> => {
    const patternCount = allExpenses.filter(
      (exp) => exp.category === currentExpense.category && exp.emotion === currentExpense.emotion,
    ).length;
    let prompt: string;
    if (patternCount > 1) {
      prompt = `A user just logged an expense for '${currentExpense.category}' while feeling '${
        currentExpense.emotion
      }'. This is the ${
        patternCount + 1
      }th time they've done this. Analyze this emotional spending pattern. Provide a gentle, non-judgmental, and short (under 25 words) reflective insight or question. The goal is to encourage self-awareness without making them feel guilty. Example: "This seems to be a go-to for comfort. What is this purchase really providing you today?"`;
    } else {
      prompt = `A user just logged an expense for '${currentExpense.category}' while feeling '${currentExpense.emotion}'. Give them a fun, quirky, and short (under 20 words) piece of advice or a thought-provoking question related to this specific combination. Frame it as a friendly tip from "Your LifeLens Guide". Example: "A little retail therapy? Hope it brings a smile!"`;
    }
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getMoodTip_logic = async (mood: MoodType): Promise<string> => {
    const prompt = `Someone just logged that they are feeling ${mood}. Reward them with a short, empowering "Power-Up" tip or an inspiring quote. Keep it under 25 words and make it sound encouraging.`;
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getFinancialInsight_logic = async (expenses: Expense[]): Promise<string> => {
    const dataSummary = expenses.map((e) => ({ amount: e.amount, category: e.category, emotion: e.emotion }));
    const prompt = `Analyze this JSON data of recent expenses: ${JSON.stringify(dataSummary)}. Uncover a "Secret Pattern" for the user. Present it as an exciting discovery about their habits and emotions. Keep it to one intriguing sentence.`;
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getAffirmation_logic = async (): Promise<string> => {
    const prompt = `Generate a short, powerful "Mantra" for someone sealing a message in their Aevum Vault for their future self. It should be empowering and memorable. Keep it under 15 words.`;
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getGoalRiddle_logic = async (goalName: string): Promise<string> => {
    const prompt = `Create a short, clever, and mysterious riddle about saving for "${goalName}". The answer should be "${goalName}". The riddle should be phrased as if from a stargazer reading the future in the stars. Keep it under 25 words. Example for "Vacation": "I am a journey paid in dimes, leading to sunnier climes. What am I?"`;
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getDailyVaultWhisper_logic = async (goalName: string, userWish: string): Promise<string> => {
    const prompt = `You are a wise, mystical guardian of the Aevum Vault. A user is saving for "${goalName}". Their sealed wish for their future self is: "${userWish}". Generate a very short (under 20 words), unique, and inspiring daily "whisper" or reminder for them. The tone should be magical and encouraging, hinting at their future success.`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getMindfulSpendingPrompt_logic = async (expense: Omit<Expense, "id" | "date">, goals: FinancialGoal[]): Promise<string> => {
    let goalsPrompt = goals.length > 0 ? `They are currently saving for "${goals[0].name}" with a target of $${goals[0].targetAmount}.` : "";
    const prompt = `A user is about to log an indulgent expense: $${expense.amount} for '${expense.category}' (${expense.occasion}) while feeling '${expense.emotion}'. ${goalsPrompt} Generate a gentle, non-judgmental, and thought-provoking question (under 25 words) to make them pause and reflect on this purchase. The tone should be supportive, not critical. Examples: "How does this purchase align with your bigger goals?" or "Will this bring you lasting joy?"`;
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getSpendingNudge_logic = async (amount: number, category: string, userProfile: UserProfile, goals: FinancialGoal[]): Promise<string> => {
    const goalText = goals.length > 0 ? `They are saving for "${goals[0].name}" (Target: ${goals[0].targetAmount}, Saved: ${goals[0].savedAmount}).` : "They have not set a specific savings goal yet.";
    const prompt = `You are Kai, a friendly AI money coach. User ${userProfile.name} is considering a purchase. Details: - Amount: ${amount} ${userProfile.currency} - Category: ${category} - User's primary goal: ${goalText}. Generate a short, gentle, and thought-provoking question (under 25 words) to help them reflect on this purchase. The tone should be supportive and non-judgmental.`;
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getWeeklySmsInsight_logic = async (expenses: Expense[], moods: MoodEntry[], userProfile: UserProfile): Promise<string> => {
    const currencySymbol = currencySymbols[userProfile.currency] || '$';
    const expensesByCategory = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>);
    const expenseSummary = Object.entries(expensesByCategory).map(([cat, total]) => `${cat}: ${currencySymbol}${total.toFixed(2)}`).join(', ');
    const moodCounts = moods.reduce((acc, m) => { acc[m.mood] = (acc[m.mood] || 0) + 1; return acc; }, {} as Record<string, number>);
    const moodSummary = Object.entries(moodCounts).map(([mood, count]) => `${mood} (${count}x)`).join(', ');
    const prompt = `Generate a concise, friendly, and insightful weekly summary message for a user named ${userProfile.name}, as if it were an SMS. The message should be under 40 words. Data from last 7 days: - Expense Totals by Category: ${expenseSummary || "None logged."} - Moods Logged: ${moodSummary || "None logged."} Summarize their week's spending and mood trend in a positive and encouraging tone. Highlight one interesting connection if possible.`;
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getPostPurchaseReassurance_logic = async (expense: Omit<Expense, "id" | "date">, goal: FinancialGoal | null): Promise<string> => {
    const goalText = goal ? `your goal of getting a ${goal.name}` : "your future goals";
    const prompt = `A user just confirmed logging an indulgent expense of $${expense.amount} for ${expense.category}. Generate a very short (under 15 words), encouraging notification message that acknowledges their choice but gently reminds them of their bigger goals. Tone: supportive, non-judgmental. Example: "Logged! One step at a time towards ${goalText}. You got this!"`;
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getPirateRiddle_logic = async (usedRiddles: string[] = []): Promise<any> => {
    const prompt = `Create a unique, clever, interesting, and short pirate-themed riddle about a financial concept. Keep the riddle brief (under 25 words). Make it different from these previously used ones: ${usedRiddles.join(", ")}. Also provide a short, pirate-themed title, a single-word or short-phrase answer, and two plausible incorrect options.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, question: { type: Type.STRING }, answer: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "question", "answer", "options"] } },
    });
    return JSON.parse(response.text);
};

const getFinancialQuest_logic = async (usedScenarios: string[] = []): Promise<any> => {
    const prompt = `Create a unique pirate-themed financial decision quest. Make it different from these previous scenarios: ${usedScenarios.join(", ")}. Provide a short, pirate-themed title. Provide a short "scenario" (under 40 words). Then, provide two "choices". Each choice should have a "text" description, an "isCorrect" boolean, and a "feedback" sentence explaining the financial lesson in pirate terms.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scenario: { type: Type.STRING },
            choices: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, isCorrect: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } }, required: ["text", "isCorrect", "feedback"] } },
          },
          required: ["title", "scenario", "choices"],
        },
      },
    });
    return JSON.parse(response.text);
};

const getGameIntroStory_logic = async (userName: string): Promise<string> => {
    const prompt = `You are Kai, the Genie of the Doubloon. Write a short, exciting opening story for a pirate captain named ${userName}. Explain that they've discovered a mysterious island where their success depends on their real-world financial wisdom. Saving money earns them 'Doubloons' to spend on the island. The goal is to build a thriving legacy. Keep it under 150 words and make it epic and adventurous.`;
    const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const getWordHint_logic = async (word: string): Promise<string> => {
    const prompt = `Generate a short, clever, pirate-themed hint for the financial term "${word}". The hint should guide the player without giving away the answer. Keep it under 15 words. Example for "BUDGET": "A captain's map for where the doubloons go."`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return cleanText(response.text);
};

const continueChat_logic = async (userProfile: UserProfile, context: "general" | "game", history: ChatMessage[], newMessage: string): Promise<string> => {
    let systemInstruction = `You are Kai, a professional and insightful financial assistant for ${userProfile.name}. Provide clear, actionable advice.`;
    if (context === "game") {
        systemInstruction = `You are Kai, the Genie of the Doubloon, a mystical guide. You are guiding a pirate captain, ${userProfile.name}. Your tone is cryptic, fun, and pirate-themed (use 'ye', 'yer', 'ahoy', etc.). Give financial advice disguised as pirate wisdom.`;
    } else if (userProfile.age < 18) {
        systemInstruction = `You are Kai, a friendly and cool financial buddy for ${userProfile.name}, who is a teenager. Use emojis, keep it simple, and be super encouraging.`;
    } else if (userProfile.age < 30) {
        systemInstruction = `You are Kai, a savvy and relatable financial assistant for ${userProfile.name}, who is a young adult. Your tone is modern, helpful, and clear.`;
    }

    const chat = ai.chats.create({ model: "gemini-2.5-flash", config: { systemInstruction }, history: history.map(m => ({ role: m.role, parts: [{ text: m.content }] })) });
    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
};

const parseSmsExpense_logic = async (smsContent: string): Promise<any> => {
    const prompt = `Analyze the following financial transaction SMS and extract the expense details. Identify the total amount spent and suggest a relevant expense category. SMS Content: "${smsContent}"`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { amount: { type: Type.NUMBER }, category: { type: Type.STRING, description: "A suggested category from this list: Food, Transport, Shopping, Groceries, Bills, Entertainment, Health, General." } },
          required: ["amount", "category"],
        },
      },
    });
    const json = JSON.parse(response.text);
    return (typeof json.amount === "number" && typeof json.category === "string") ? json : null;
};


// --- API HANDLER ---
// This is the entry point for all requests from the frontend.
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { action, payload } = await req.json();
    let result;

    // Route the request to the correct logic function based on the 'action'.
    switch (action) {
      case 'getEmotionalSpendingInsight': result = await getEmotionalSpendingInsight_logic(payload.currentExpense, payload.allExpenses); break;
      case 'getMoodTip': result = await getMoodTip_logic(payload.mood); break;
      case 'getFinancialInsight': result = await getFinancialInsight_logic(payload.expenses); break;
      case 'getAffirmation': result = await getAffirmation_logic(); break;
      case 'getGoalRiddle': result = await getGoalRiddle_logic(payload.goalName); break;
      case 'getDailyVaultWhisper': result = await getDailyVaultWhisper_logic(payload.goalName, payload.userWish); break;
      case 'getMindfulSpendingPrompt': result = await getMindfulSpendingPrompt_logic(payload.expense, payload.goals); break;
      case 'getSpendingNudge': result = await getSpendingNudge_logic(payload.amount, payload.category, payload.userProfile, payload.goals); break;
      case 'getWeeklySmsInsight': result = await getWeeklySmsInsight_logic(payload.expenses, payload.moods, payload.userProfile); break;
      case 'getPostPurchaseReassurance': result = await getPostPurchaseReassurance_logic(payload.expense, payload.goal); break;
      case 'getPirateRiddle': result = await getPirateRiddle_logic(payload.usedRiddles); break;
      case 'getFinancialQuest': result = await getFinancialQuest_logic(payload.usedScenarios); break;
      case 'getGameIntroStory': result = await getGameIntroStory_logic(payload.userName); break;
      case 'getWordHint': result = await getWordHint_logic(payload.word); break;
      case 'continueChat': result = await continueChat_logic(payload.userProfile, payload.context, payload.history, payload.newMessage); break;
      case 'parseSmsExpense': result = await parseSmsExpense_logic(payload.smsContent); break;
      default:
        return new Response(JSON.stringify({ message: `Unknown action: ${action}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // For functions that return a simple string, wrap it in a standard { text: "..." } object.
    // For functions that already return a JSON object, return them as-is.
    const responseBody = typeof result === 'string' ? { text: result } : result;

    return new Response(JSON.stringify(responseBody), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error(`Error in API handler for action:`, error);
    return new Response(JSON.stringify({ message: error.message || 'An internal server error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
