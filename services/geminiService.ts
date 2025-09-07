import { Expense, FinancialGoal, MoodType, UserProfile, ChatMessage, MoodEntry } from '../types';

// --- Generic API Callers to Secure Backend Proxy ---

const generateText = async (prompt: string): Promise<string> => {
    try {
        const response = await fetch('/api/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API text generation failed');
        }
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Gemini text proxy failed:", error);
        return "I'm having a little trouble connecting to my thoughts right now. Please try again in a moment.";
    }
};

const generateJson = async (prompt: string): Promise<string> => {
    try {
        const response = await fetch('/api/generate-json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API JSON generation failed');
        }
        const data = await response.json();
        return data.text; // This will be a JSON string
    } catch (error) {
        console.error("Gemini JSON proxy failed:", error);
        return 'null'; // Return a string that can be parsed as null JSON
    }
};

// --- Service Functions ---

export const getEmotionalSpendingInsight = async (expense: Omit<Expense, 'id' | 'date'>): Promise<string> => {
    const prompt = `A user just logged an expense.
    - Amount: ${expense.amount}
    - Category: ${expense.category}
    - Occasion: ${expense.occasion}
    - Feeling: ${expense.emotion}
    - Type: ${expense.isUseful ? 'Essential' : 'Indulgence'}
    
    Based on this, provide a short, single-sentence, empathetic, and insightful reflection (max 20 words). If it's an indulgence, be gentle and non-judgmental. If it's an essential, be affirming. Frame it as a wise, friendly observation. Example: "A small treat to brighten a stressful day is a form of self-care." or "Taking care of necessities is a victory in itself."`;
    return generateText(prompt);
};

export const getMindfulSpendingPrompt = async (expense: Omit<Expense, 'id' | 'date'>, goals: FinancialGoal[]): Promise<string> => {
    const goalInfo = goals.length > 0 ? `They are saving for: "${goals[0].name}" with a target of ${goals[0].targetAmount}.` : "They have not set a specific savings goal yet.";
    const prompt = `A user is contemplating an indulgent (non-essential) purchase:
    - Amount: ${expense.amount}
    - Category: ${expense.category}
    - Occasion: ${expense.occasion}
    - Feeling: ${expense.emotion}
    ${goalInfo}

    Provide a short, non-judgmental, mindful question (max 25 words) to make them pause and reflect. It should connect the purchase to their feelings or goals. Frame it as a gentle, wise question from a friend. Examples: "Will this purchase bring you lasting joy, or just a fleeting moment?", "How does this align with your dream of a great vacation?", "Is there another way to soothe this feeling right now?"`;
    return generateText(prompt);
};

export const getPostPurchaseReassurance = async (expense: Omit<Expense, 'id' | 'date'>, goal: FinancialGoal | null): Promise<string> => {
    const goalInfo = goal ? `Remember your goal of "${goal.name}"! Every small saving adds up.` : "Setting a financial goal can make your journey even more rewarding.";
    const prompt = `A user just made an indulgent purchase of ${expense.amount} on ${expense.category} while feeling ${expense.emotion}. Provide a very short, kind, and reassuring message (max 15 words) that validates their choice but gently reminds them of mindfulness. ${goalInfo} Example: "Enjoy your treat! Let's get back on track with the next choice."`;
    return generateText(prompt);
};

const moodTipCache: Partial<Record<MoodType, string>> = {};
export const getMoodTip = async (mood: MoodType): Promise<string> => {
    if (moodTipCache[mood]) return moodTipCache[mood]!;
    const prompt = `A user is feeling ${mood}. Provide a short, actionable, and encouraging tip (max 20 words) to help them manage this feeling. Frame it as a wise, friendly power-up. Example for Sad: "Listening to a favorite song can be a gentle lift for your spirits."`;
    const tip = await generateText(prompt);
    moodTipCache[mood] = tip;
    return tip;
};

export const getFinancialInsight = async (expenses: Expense[]): Promise<string> => {
  if (expenses.length === 0) return "Log some expenses to see your patterns here!";
  const expenseSummary = expenses.map(e => `- ${e.amount} on ${e.category} (Feeling ${e.emotion}, ${e.isUseful ? 'Essential' : 'Indulgence'})`).join('\n');
  const prompt = `Based on this list of recent expenses, identify the single most interesting or impactful emotional spending pattern. Provide a concise, one-sentence insight (max 25 words).
  Expenses:
  ${expenseSummary}
  Example Insight: "It seems that shopping has been a go-to comfort during moments of stress."`;
  return generateText(prompt);
};

export const parseSmsExpense = async (sms: string): Promise<{ type: 'income' | 'expense', amount: number, category: string, purpose: string } | null> => {
    const prompt = `
    You are an expert financial assistant AI. Your task is to analyze a single SMS transaction message and extract key information into a strict JSON format.

    **Rules:**
    1.  **Analyze Transaction Messages:** Process messages that clearly indicate money being spent, debited, paid OR received, credited, added.
    2.  **Determine Transaction Type:**
        *   If money is being spent (e.g., "debited", "spent", "paid"), set \`type\` to "expense".
        *   If money is being received (e.g., "credited", "received", "added"), set \`type\` to "income".
    3.  **IGNORE Non-Transaction Messages:** If the message is a one-time password (OTP), an ad, a notification, or anything other than a transaction, you MUST return \`null\`.
    4.  **Extract the following fields:**
        *   \`type\`: (string) Must be either "expense" or "income".
        *   \`amount\`: (number) The total amount of the transaction.
        *   \`category\`: (string) For expenses, a relevant category: [Food, Shopping, Transport, Bills, Groceries, Entertainment, Health, General, Travel, Services]. For income, a relevant category: [Salary, Freelance, Gift, Refund, Other].
        *   \`purpose\`: (string) The merchant name, sender, or a brief, **human-readable** description (e.g., "Amazon Purchase", "Monthly Salary", "ATM Withdrawal"). Avoid cryptic abbreviations like "GBM".
    5.  **Output Format:** Your response MUST be a single, valid JSON object or the string \`null\`. Do not include any other text, explanations, or markdown formatting.

    **User Input to Analyze Now:**
    "${sms}"`;

    try {
        const jsonString = await generateJson(prompt);
        if (jsonString === 'null') return null;
        const parsedJson = JSON.parse(jsonString);
        if (parsedJson && (parsedJson.type === 'expense' || parsedJson.type === 'income') && typeof parsedJson.amount === 'number' && typeof parsedJson.category === 'string' && typeof parsedJson.purpose === 'string') {
            return parsedJson;
        }
        return null;
    } catch (error) {
        console.error("Error parsing SMS JSON from proxy:", error);
        return null;
    }
};

export const getGoalRiddle = async (goalName: string): Promise<string> => {
  const prompt = `Create a short, clever, one-sentence riddle related to achieving a financial goal called "${goalName}". The riddle should be inspiring and mysterious. Max 20 words.`;
  return generateText(prompt);
};

export const getDailyVaultWhisper = async (goalName: string, userMessage: string): Promise<string> => {
    const prompt = `A user is working towards a financial goal called "${goalName}". They wrote this message to their future self: "${userMessage}". 
    Based on their goal and message, provide a very short (10-15 words), encouraging, and slightly mysterious "whisper" to motivate them for the day. 
    Example: "The shores of [Goal Name] are closer than they appear. Keep rowing."`;
    return generateText(prompt);
};

export const getAffirmation = async (): Promise<string> => {
    const prompt = `Generate a short, powerful, and positive financial affirmation. Max 15 words. Example: "I am a magnet for wealth and abundance."`;
    return generateText(prompt);
};

export const getWeeklySmsInsight = async (expenses: Expense[], moods: MoodEntry[], userProfile: UserProfile): Promise<string> => {
    try {
        const response = await fetch(`/api/generate-insight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expenses, moods, userProfile }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Backend request failed with status: ${response.status}`);
        }
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Failed to fetch weekly insight from backend:", error);
        return "Could not connect to the insight service. Please check your connection and try again.";
    }
};

export const getSpendingNudge = async (amount: number, category: string, userProfile: UserProfile, goals: FinancialGoal[]): Promise<string> => {
    const goalInfo = goals.length > 0 ? `Their current top goal is "${goals[0].name}" for ${goals[0].targetAmount}.` : "They don't have a specific goal set yet.";
    const prompt = `A user, ${userProfile.name}, is about to spend ${amount} on ${category}. ${goalInfo}
    Provide a short, gentle, and thought-provoking question (max 20 words) to encourage mindful spending without being judgmental.`;
    return generateText(prompt);
};

// --- Game AI Functions ---

export const getPirateRiddle = async (usedRiddles: string[]): Promise<{ title: string, question: string, options: string[], answer: string }> => {
    const prompt = `You are a pirate riddle master. Create a new, unique financial riddle with a pirate theme. The riddle should NOT be one of these: [${usedRiddles.join(', ')}].
    Provide the response in a valid JSON object with keys: "title", "question", "options" (an array of 3 strings, one is the correct answer), and "answer".`;
    try {
        const jsonString = await generateJson(prompt);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating pirate riddle:", error);
        throw new Error("Failed to generate pirate riddle from proxy.");
    }
};

export const getFinancialQuest = async (usedScenarios: string[]): Promise<{ title: string, scenario: string, choices: { text: string, isCorrect: boolean, feedback: string }[] }> => {
    const prompt = `You are a wise old sea captain. Create a short, unique financial scenario quest with a pirate theme. The scenario should NOT be one of these: [${usedScenarios.join(', ')}].
    Provide the response in a valid JSON object with keys: "title", "scenario", and "choices" (an array of 2 objects, each with "text", "isCorrect", and "feedback" keys).`;
     try {
        const jsonString = await generateJson(prompt);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating financial quest:", error);
        throw new Error("Failed to generate financial quest from proxy.");
    }
};

export const getWordHint = async (word: string): Promise<string> => {
    const prompt = `Provide a short, one-sentence, clever hint for the financial term "${word}". The hint should be themed for a pirate game.`;
    return generateText(prompt);
};

// --- Chat Functions ---
export const continueChat = async (userProfile: UserProfile, context: 'general' | 'game', history: ChatMessage[], newMessage: string): Promise<string> => {
    const systemInstruction = context === 'game' 
        ? `You are Kai, a wise and ancient pirate genie who offers cryptic but helpful advice about the island building game, "Pirate's Legacy". You have a mysterious and slightly mischievous personality. Keep responses concise and pirate-themed.`
        : `You are Kai, a friendly and empathetic AI financial assistant. Your goal is to help ${userProfile.name} (${userProfile.age}) understand their finances and emotions. Be supportive, non-judgmental, and provide clear, actionable advice. Use their name occasionally.`;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemInstruction, history, newMessage }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Chat API call failed');
        }
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Chat proxy failed:", error);
        return "I'm having a little trouble with my connection right now. Could you ask me that again in a moment?";
    }
};
