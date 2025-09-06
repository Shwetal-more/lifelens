import type { Expense, MoodType, MoodEntry, FinancialGoal, UserProfile, Quest, DecisionChoice, ChatMessage } from "../types"

// This is the single point of contact with our new secure backend.
const callApi = async (action: string, payload: any) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
    console.error(`API Error for action "${action}":`, errorData);
    throw new Error(errorData.message || 'Failed to fetch from API');
  }

  return response.json();
};

export const getEmotionalSpendingInsight = async (
  currentExpense: Omit<Expense, "id" | "date">,
  allExpenses: Expense[],
): Promise<string> => {
  try {
    const result = await callApi('getEmotionalSpendingInsight', { currentExpense, allExpenses });
    return result.text;
  } catch (error) {
    console.error("Error getting emotional spending insight:", error);
    return "Every entry helps you learn. Keep going!";
  }
};

export const getMoodTip = async (mood: MoodType): Promise<string> => {
  try {
    const result = await callApi('getMoodTip', { mood });
    return result.text;
  } catch (error) {
    console.error("Error getting mood tip:", error)
    return "A positive thought is on its way to you."
  }
}

export const getFinancialInsight = async (expenses: Expense[]): Promise<string> => {
  if (expenses.length < 2) {
    return "Track more expenses and moods to unlock powerful insights!"
  }
  try {
    const result = await callApi('getFinancialInsight', { expenses });
    return result.text;
  } catch (error)
  {
    console.error("Error getting financial insight:", error)
    return "Could not generate insights right now. Keep tracking!"
  }
}

export const getAffirmation = async (): Promise<string> => {
  try {
    const result = await callApi('getAffirmation', {});
    return result.text;
  } catch (error) {
    console.error("Error getting affirmation:", error)
    return "Believe in the person you are becoming."
  }
}

export const getGoalRiddle = async (goalName: string): Promise<string> => {
  try {
    const result = await callApi('getGoalRiddle', { goalName });
    return result.text;
  } catch (error) {
    console.error("Error getting goal riddle:", error)
    return `What dream are you reaching for among the stars?`
  }
}

export const getDailyVaultWhisper = async (goalName: string, userWish: string): Promise<string> => {
  try {
    const result = await callApi('getDailyVaultWhisper', { goalName, userWish });
    return result.text;
  } catch (error) {
    console.error("Error getting daily vault whisper:", error)
    return "The stars are aligning for your success... keep going."
  }
}

export const getMindfulSpendingPrompt = async (
  expense: Omit<Expense, "id" | "date">,
  goals: FinancialGoal[],
): Promise<string> => {
  try {
    const result = await callApi('getMindfulSpendingPrompt', { expense, goals });
    return result.text;
  } catch (error) {
    console.error("Error getting mindful spending prompt:", error)
    return "Is this purchase a need or a want?"
  }
}

export const getSpendingNudge = async (
  amount: number,
  category: string,
  userProfile: UserProfile,
  goals: FinancialGoal[],
): Promise<string> => {
  try {
    const result = await callApi('getSpendingNudge', { amount, category, userProfile, goals });
    return result.text;
  } catch (error) {
    console.error("Error getting spending nudge:", error)
    return "Does this purchase bring you closer to your goals?"
  }
}

export const getWeeklySmsInsight = async (
  expenses: Expense[],
  moods: MoodEntry[],
  userProfile: UserProfile,
): Promise<string> => {
  if (expenses.length < 1 && moods.length < 1) {
    return `Hi ${userProfile.name}! Start logging your expenses and moods this week to get your first LifeLens SMS roundup. Stay mindful!`
  }
  try {
    const result = await callApi('getWeeklySmsInsight', { expenses, moods, userProfile });
    return result.text;
  } catch (error) {
    console.error("Error getting weekly SMS insight:", error)
    return `Hey ${userProfile.name}, keep up the great work logging your week! Your insights are being prepared.`
  }
}

export const getPostPurchaseReassurance = async (
  expense: Omit<Expense, "id" | "date">,
  goal: FinancialGoal | null,
): Promise<string> => {
  try {
    const result = await callApi('getPostPurchaseReassurance', { expense, goal });
    return result.text;
  } catch (error) {
    console.error("Error getting post-purchase reassurance:", error)
    return "Expense logged. Keep your goals in mind!"
  }
}

export const getPirateRiddle = async (
  usedRiddles: string[] = [],
): Promise<{ title: string; question: string; options: string[]; answer: string }> => {
  try {
    return await callApi('getPirateRiddle', { usedRiddles });
  } catch (error) {
    console.error("Error getting pirate riddle:", error)
    const fallbackRiddles = [
      { title: "The Invisible Stash", question: "I guard yer treasure but have no lock. The more ye give me, the richer ye'll be. What am I?", answer: "Savings", options: ["Chest", "Savings", "Debt"] },
      { title: "The Captain's Map", question: "I'm a plan for yer doubloons, dividing them fair. Without me, yer treasure vanishes into thin air. What am I?", answer: "Budget", options: ["Budget", "Compass", "Crew"] },
    ]
    return fallbackRiddles[Math.floor(Math.random() * fallbackRiddles.length)]
  }
}

export const getFinancialQuest = async (usedScenarios: string[] = []): Promise<{ title: string; scenario: string; choices: DecisionChoice[] }> => {
  try {
    return await callApi('getFinancialQuest', { usedScenarios });
  } catch (error) {
    console.error("Error getting financial quest:", error)
    const fallbackScenarios = [
      { title: "The Risky Gamble", scenario: "Ye found a treasure map! It points to the 'Quicksand Quays' (high risk, high reward) or the 'Golden Gull Grotto' (low risk, modest reward). Where do ye seek yer fortune?", choices: [{ text: "Quicksand Quays", isCorrect: false, feedback: "Ye lost yer boots in the muck! High-risk ventures can lead to great losses if ye're not prepared." }, { text: "Golden Gull Grotto", isCorrect: true, feedback: "A tidy sum! A guaranteed smaller gain is often better than a risky gamble." }] },
      { title: "The Storm's Toll", scenario: "A storm damaged yer ship! Ye can either use yer emergency chest of 500 doubloons for repairs, or borrow 500 doubloons at high interest from Blackbeard's Bank.", choices: [{ text: "Use emergency chest", isCorrect: true, feedback: "Wise choice! Emergency funds save ye from costly debt when trouble strikes." }, { text: "Borrow from Blackbeard's Bank", isCorrect: false, feedback: "The interest will sink ye! Always use emergency funds before taking on debt." }] },
    ]
    return fallbackScenarios[Math.floor(Math.random() * fallbackScenarios.length)]
  }
}

export const getGameIntroStory = async (userName: string): Promise<string> => {
  try {
    const result = await callApi('getGameIntroStory', { userName });
    return result.text;
  } catch (error) {
    console.error("Error getting game intro story:", error)
    return `Ahoy, Captain ${userName}! Welcome to a land of untold riches and mystery. This island... it responds to yer real-world fortunes! The wiser ye are with yer coin in yer world, the more Doubloons ye'll have to spend here. Build a legacy, and uncover the ultimate treasure!`
  }
}

export const getWordHint = async (word: string): Promise<string> => {
  try {
    const result = await callApi('getWordHint', { word });
    return result.text;
  } catch (error) {
    console.error("Error getting word hint:", error)
    return "The winds ain't talkin' right now..."
  }
}

export const continueChat = async (userProfile: UserProfile, context: "general" | "game", history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const result = await callApi('continueChat', { userProfile, context, history, newMessage });
        return result.text;
    } catch (error) {
        console.error("Error continuing chat:", error);
        return "Sorry, I'm having trouble connecting. Please try again later.";
    }
}

export const parseSmsExpense = async (smsContent: string): Promise<{ amount: number; category: string } | null> => {
  try {
    return await callApi('parseSmsExpense', { smsContent });
  } catch (error) {
    console.error("Error parsing SMS expense:", error)
    return null
  }
}
