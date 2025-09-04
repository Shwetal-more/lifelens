
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { Expense, MoodType, MoodEntry, FinancialGoal, UserProfile, Quest } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean Gemini response text by removing markdown characters.
const cleanText = (text: string): string => {
    return text.trim().replace(/\*/g, '');
};


export const getExpenseAdvice = async (expense: Omit<Expense, 'id' | 'date'>): Promise<string> => {
  try {
    const prompt = `A user just logged an expense of $${expense.amount} for '${expense.category}' while feeling '${expense.emotion}'. Give them a fun, quirky, and short (under 20 words) piece of advice or a thought-provoking question. Frame it as a friendly tip from "Your LifeLens Guide". Example: "Whoa, nice! Will this bring you joy next week too?"`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Error getting expense advice:", error);
    return "Could not generate advice at this time.";
  }
};

export const getMoodTip = async (mood: MoodType): Promise<string> => {
  try {
    const prompt = `Someone just logged that they are feeling ${mood}. Reward them with a short, empowering "Power-Up" tip or an inspiring quote. Keep it under 25 words and make it sound encouraging.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Error getting mood tip:", error);
    return "A positive thought is on its way to you.";
  }
};

export const getFinancialInsight = async (expenses: Expense[]): Promise<string> => {
  if (expenses.length < 2) {
    return "Track more expenses and moods to unlock powerful insights!";
  }
  try {
    const dataSummary = expenses.map(e => ({ amount: e.amount, category: e.category, emotion: e.emotion }));
    const prompt = `Analyze this JSON data of recent expenses: ${JSON.stringify(dataSummary)}. Uncover a "Secret Pattern" for the user. Present it as an exciting discovery about their habits and emotions. Keep it to one intriguing sentence.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Error getting financial insight:", error);
    return "Could not generate insights right now. Keep tracking!";
  }
};

export const getAffirmation = async (): Promise<string> => {
  try {
    const prompt = `Generate a short, powerful "Mantra" for someone sealing a message in their Aevum Vault for their future self. It should be empowering and memorable. Keep it under 15 words.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Error getting affirmation:", error);
    return "Believe in the person you are becoming.";
  }
};

export const getGoalRiddle = async (goalName: string): Promise<string> => {
  try {
    const prompt = `Create a short, clever, and mysterious riddle about saving for "${goalName}". The answer should be "${goalName}". The riddle should be phrased as if from a stargazer reading the future in the stars. Keep it under 25 words. Example for "Vacation": "I am a journey paid in dimes, leading to sunnier climes. What am I?"`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Error getting goal riddle:", error);
    return `What dream are you reaching for among the stars?`;
  }
};

export const getDailyVaultWhisper = async (goalName: string, userWish: string): Promise<string> => {
    try {
        const prompt = `You are a wise, mystical guardian of the Aevum Vault. A user is saving for "${goalName}". Their sealed wish for their future self is: "${userWish}". Generate a very short (under 20 words), unique, and inspiring daily "whisper" or reminder for them. The tone should be magical and encouraging, hinting at their future success.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return cleanText(response.text);
    } catch (error) {
        console.error("Error getting daily vault whisper:", error);
        return "The stars are aligning for your success... keep going.";
    }
};


export const getMindfulSpendingPrompt = async (expense: Omit<Expense, 'id' | 'date'>, goals: FinancialGoal[]): Promise<string> => {
  try {
    let goalsPrompt = '';
    if (goals.length > 0) {
      const mainGoal = goals[0];
      goalsPrompt = `They are currently saving for "${mainGoal.name}" with a target of $${mainGoal.targetAmount}.`;
    }

    const prompt = `A user is about to log an indulgent expense: $${expense.amount} for '${expense.category}' (${expense.occasion}) while feeling '${expense.emotion}'. ${goalsPrompt} Generate a gentle, non-judgmental, and thought-provoking question (under 25 words) to make them pause and reflect on this purchase. The tone should be supportive, not critical. Examples: "How does this purchase align with your bigger goals?" or "Will this bring you lasting joy?"`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Error getting mindful spending prompt:", error);
    return "Is this purchase a need or a want?";
  }
};

export const getWeeklySmsInsight = async (expenses: Expense[], moods: MoodEntry[], userName:string): Promise<string> => {
  if (expenses.length < 1 && moods.length < 1) {
    return `Hi ${userName}! Start logging your expenses and moods this week to get your first LifeLens SMS roundup. Stay mindful!`;
  }
  try {
    const expenseSummary = expenses.map(e => `${e.category}: $${e.amount}`).join(', ');
    const moodSummary = Array.from(new Set(moods.map(m => m.mood))).join(', ');
    
    const prompt = `Generate a concise, friendly, and insightful weekly summary message for a user named ${userName}, as if it were an SMS. The message should be under 40 words.
    Data from last 7 days:
    - Expenses: ${expenseSummary || 'None logged.'}
    - Moods felt: ${moodSummary || 'None logged.'}
    Summarize their week's spending and mood trend in a positive and encouraging tone. Highlight one interesting connection if possible.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Error getting weekly SMS insight:", error);
    return `Hey ${userName}, keep up the great work logging your week! Your insights are being prepared.`;
  }
};

export const getPostPurchaseReassurance = async (expense: Omit<Expense, 'id' | 'date'>, goal: FinancialGoal | null): Promise<string> => {
    try {
        let goalText = "your future goals";
        if (goal) {
            goalText = `your goal of getting a ${goal.name}`;
        }
        const prompt = `A user just confirmed logging an indulgent expense of $${expense.amount} for ${expense.category}. Generate a very short (under 15 words), encouraging notification message that acknowledges their choice but gently reminds them of their bigger goals. Tone: supportive, non-judgmental. Example: "Logged! One step at a time towards ${goalText}. You got this!"`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return cleanText(response.text);
    } catch (error) {
        console.error("Error getting post-purchase reassurance:", error);
        return "Expense logged. Keep your goals in mind!";
    }
};

export const getPirateRiddle = async (): Promise<{question: string, options: string[], answer: string}> => {
  try {
    const prompt = `Generate a short, pirate-themed riddle about a basic financial concept (like saving, budget, interest, debt, investment). The answer should be a single word. Also provide two plausible but incorrect answers.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The riddle question."
            },
            answer: {
              type: Type.STRING,
              description: "The single-word answer to the riddle."
            },
            options: {
              type: Type.ARRAY,
              description: "An array of 3 strings: the correct answer and two plausible incorrect answers.",
              items: { type: Type.STRING }
            }
          },
          required: ["question", "answer", "options"]
        }
      }
    });
    const parsed = JSON.parse(response.text);
    return { question: parsed.question, options: parsed.options, answer: parsed.answer };
  } catch (error) {
    console.error("Error getting pirate riddle:", error);
    return { question: "I guard yer treasure but have no lock or key. The more ye give me, the richer ye'll be. What am I?", answer: "savings", options: ["chest", "savings", "debt"] };
  }
};

export const getFinancialQuest = async (): Promise<Quest['data']> => {
    try {
        const prompt = `Create a pirate-themed financial decision quest. Provide a short "scenario" (under 40 words) where a pirate captain must make a choice that reflects a real-world financial principle (e.g., risk vs. reward, insurance, compound interest). Then, provide two "choices". Each choice should have a "text" description, an "isCorrect" boolean, and a "feedback" sentence explaining the financial lesson in pirate terms.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                scenario: {
                  type: Type.STRING,
                  description: "The short scenario for the financial decision."
                },
                choices: {
                  type: Type.ARRAY,
                  description: "An array of two choice objects.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING, description: "The text for the choice." },
                      isCorrect: { type: Type.BOOLEAN, description: "Whether this choice is the correct financial decision." },
                      feedback: { type: Type.STRING, description: "Feedback explaining the financial lesson." }
                    },
                    required: ["text", "isCorrect", "feedback"]
                  }
                }
              },
              required: ["scenario", "choices"]
            }
          }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error getting financial quest:", error);
        return {
            scenario: "Ye found a treasure map! It points to the 'Quicksand Quays' (high risk, high reward) or the 'Golden Gull Grotto' (low risk, modest reward). Where do ye seek yer fortune?",
            choices: [
                { text: "Quicksand Quays", isCorrect: false, feedback: "Ye lost yer boots in the muck! High-risk ventures can lead to great losses if ye're not prepared." },
                { text: "Golden Gull Grotto", isCorrect: true, feedback: "A tidy sum! A guaranteed smaller gain is often better than a risky gamble." }
            ]
        };
    }
};

export const getGameIntroStory = async (userName: string): Promise<string> => {
  try {
    const prompt = `You are Kai, the Genie of the Doubloon, a mystical guide trapped in a magical compass. Write a short, exciting opening story for a pirate captain named ${userName}. Explain that they've discovered a mysterious island where they can build a settlement. Their success depends on their real-world financial wisdom. Saving money in their life earns them 'Doubloons' to spend on the island. The goal is to build a thriving legacy and uncover the island's ultimate treasure. Keep it under 150 words and make it sound epic and adventurous.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Error getting game intro story:", error);
    return `Ahoy, Captain ${userName}! Welcome to a land of untold riches and mystery. This island... it responds to yer real-world fortunes! The wiser ye are with yer coin in yer world, the more Doubloons ye'll have to spend here. Build a legacy, and uncover the ultimate treasure!`;
  }
};


export const startChatSession = (userProfile: UserProfile, context: 'general' | 'game'): Chat => {
  let systemInstruction = `You are Kai, a professional and insightful financial assistant for ${userProfile.name}. Provide clear, actionable advice.`;
  
  if (context === 'game') {
      systemInstruction = `You are Kai, the Genie of the Doubloon, a mystical guide trapped in a magical compass. You are guiding a pirate captain, ${userProfile.name}, on a treasure island. Your tone is cryptic, fun, and pirate-themed (use 'ye', 'yer', 'ahoy', etc.). Give financial advice disguised as pirate wisdom. Help them with their quests but don't give direct answers easily.`;
  } else {
    if (userProfile.age < 18) {
      systemInstruction = `You are Kai, a friendly and cool financial buddy for ${userProfile.name}, who is a teenager. Use emojis, keep it simple, and be super encouraging. You're here to help them learn about money in a fun way.`;
    } else if (userProfile.age < 30) {
      systemInstruction = `You are Kai, a savvy and relatable financial assistant for ${userProfile.name}, who is a young adult. Your tone is modern, helpful, and clear. Avoid jargon and focus on practical steps.`;
    }
  }

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
  });
  return chat;
};
