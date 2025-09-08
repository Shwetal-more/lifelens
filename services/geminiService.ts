import { Expense, FinancialGoal, MoodType, UserProfile, ChatMessage, MoodEntry } from '../types';

// A unified, secure way to call our backend proxy for all Gemini API tasks.
const callGeminiProxy = async (action: string, payload: object): Promise<any> => {
    try {
        const response = await fetch('/api/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Backend proxy error for action "${action}":`, errorData.error);
            throw new Error(errorData.error || `Request failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.result;

    } catch (error) {
        console.error(`Failed to fetch from backend proxy for action "${action}":`, error);
        // Return a user-friendly error message
        return "I'm having a little trouble connecting to my thoughts right now. Please try again in a moment.";
    }
};


export const getEmotionalSpendingInsight = (expense: Omit<Expense, 'id' | 'date'>): Promise<string> => {
    return callGeminiProxy('getEmotionalSpendingInsight', { expense });
};

export const getMindfulSpendingPrompt = (expense: Omit<Expense, 'id' | 'date'>, goals: FinancialGoal[]): Promise<string> => {
    return callGeminiProxy('getMindfulSpendingPrompt', { expense, goals });
};

export const getPostPurchaseReassurance = (expense: Omit<Expense, 'id' | 'date'>, goal: FinancialGoal | null): Promise<string> => {
    return callGeminiProxy('getPostPurchaseReassurance', { expense, goal });
};

// --- Caching can still be beneficial on the client-side ---
const moodTipCache: Partial<Record<MoodType, string>> = {};
export const getMoodTip = async (mood: MoodType): Promise<string> => {
    if (moodTipCache[mood]) {
        return moodTipCache[mood]!;
    }
    const tip = await callGeminiProxy('getMoodTip', { mood });
    if (!tip.startsWith("I'm having a little trouble")) {
      moodTipCache[mood] = tip;
    }
    return tip;
};

export const getFinancialInsight = (expenses: Expense[]): Promise<string> => {
    if (expenses.length === 0) return Promise.resolve("Log some expenses to see your patterns here!");
    return callGeminiProxy('getFinancialInsight', { expenses });
};

export const parseSmsExpense = async (sms: string): Promise<{ type: 'income' | 'expense', amount: number, category: string, purpose: string } | null> => {
    const result = await callGeminiProxy('parseSmsExpense', { sms });
    // The proxy will return null for non-transaction messages or errors
    if (typeof result === 'string') { // It's an error message
        console.error("SMS Parsing failed:", result);
        return null;
    }
    return result;
};


export const getGoalRiddle = (goalName: string): Promise<string> => {
    return callGeminiProxy('getGoalRiddle', { goalName });
};

export const getDailyVaultWhisper = (goalName: string, userMessage: string): Promise<string> => {
    return callGeminiProxy('getDailyVaultWhisper', { goalName, userMessage });
};

export const getAffirmation = (): Promise<string> => {
    return callGeminiProxy('getAffirmation', {});
};

export const getWeeklySmsInsight = (expenses: Expense[], moods: MoodEntry[], userProfile: UserProfile): Promise<string> => {
    // This function now uses the same unified proxy as all others.
    return callGeminiProxy('getWeeklySmsInsight', { expenses, moods, userProfile });
};

export const getSpendingNudge = (amount: number, category: string, userProfile: UserProfile, goals: FinancialGoal[]): Promise<string> => {
    return callGeminiProxy('getSpendingNudge', { amount, category, userProfile, goals });
};

// --- Game AI Functions ---

export const getPirateRiddle = async (usedRiddles: string[]): Promise<{ title: string, question: string, options: string[], answer: string }> => {
    const result = await callGeminiProxy('getPirateRiddle', { usedRiddles });
    if (typeof result === 'string') { // Error occurred
        throw new Error(result);
    }
    return result;
};

export const getFinancialQuest = async (usedScenarios: string[]): Promise<{ title: string, scenario: string, choices: { text: string, isCorrect: boolean, feedback: string }[] }> => {
    const result = await callGeminiProxy('getFinancialQuest', { usedScenarios });
     if (typeof result === 'string') { // Error occurred
        throw new Error(result);
    }
    return result;
};

export const getWordHint = (word: string): Promise<string> => {
    return callGeminiProxy('getWordHint', { word });
};

// --- Chat Functions ---

export const continueChat = (userProfile: UserProfile, context: 'general' | 'game', history: ChatMessage[], newMessage: string): Promise<string> => {
    return callGeminiProxy('continueChat', { userProfile, context, history, newMessage });
};
