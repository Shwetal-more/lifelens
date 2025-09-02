
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Expense, MoodType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getExpenseAdvice = async (expense: Omit<Expense, 'id' | 'date'>): Promise<string> => {
  try {
    const prompt = `A user just logged an expense of $${expense.amount} for '${expense.category}' while feeling '${expense.emotion}'. Give them a fun, quirky, and short (under 20 words) piece of advice or a thought-provoking question. Frame it as a friendly tip from "Your LifeLens Guide". Example: "Whoa, nice! Will this bring you joy next week too?"`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
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
    return response.text.trim();
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
    return response.text.trim();
  } catch (error) {
    console.error("Error getting financial insight:", error);
    return "Could not generate insights right now. Keep tracking!";
  }
};

export const getAffirmation = async (): Promise<string> => {
  try {
    const prompt = `Generate a short, powerful "Mantra" for someone writing a message to their future self. It should be empowering and memorable. Keep it under 15 words.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error getting affirmation:", error);
    return "Believe in the person you are becoming.";
  }
};

export const getDailyChallenge = async (): Promise<string> => {
  try {
    const prompt = `Generate a simple, fun, and achievable daily challenge related to either mindful spending or mental well-being. The challenge should be presented in an exciting tone. Examples: "No-Spend Coffee Challenge: Brew your own today!", "Mindful Moment Mission: Find 5 minutes of quiet." Keep it very short and start with an action verb.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error getting daily challenge:", error);
    return "Take a deep breath and smile.";
  }
};
