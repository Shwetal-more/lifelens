import { GoogleGenAI, type GenerateContentResponse, type Chat, Type } from "@google/genai"
import type { Expense, MoodType, MoodEntry, FinancialGoal, UserProfile, Quest } from "../types"

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set")
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY })

// Helper to clean Gemini response text by removing markdown characters.
const cleanText = (text: string): string => {
  return text.trim().replace(/\*/g, "")
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
};


export const getExpenseAdvice = async (expense: Omit<Expense, "id" | "date">): Promise<string> => {
  try {
    const prompt = `A user just logged an expense of $${expense.amount} for '${expense.category}' while feeling '${expense.emotion}'. Give them a fun, quirky, and short (under 20 words) piece of advice or a thought-provoking question. Frame it as a friendly tip from "Your LifeLens Guide". Example: "Whoa, nice! Will this bring you joy next week too?"`
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
  } catch (error) {
    console.error("Error getting expense advice:", error)
    return "Could not generate advice at this time."
  }
}

export const getMoodTip = async (mood: MoodType): Promise<string> => {
  try {
    const prompt = `Someone just logged that they are feeling ${mood}. Reward them with a short, empowering "Power-Up" tip or an inspiring quote. Keep it under 25 words and make it sound encouraging.`
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
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
    const dataSummary = expenses.map((e) => ({ amount: e.amount, category: e.category, emotion: e.emotion }))
    const prompt = `Analyze this JSON data of recent expenses: ${JSON.stringify(dataSummary)}. Uncover a "Secret Pattern" for the user. Present it as an exciting discovery about their habits and emotions. Keep it to one intriguing sentence.`
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
  } catch (error)
  {
    console.error("Error getting financial insight:", error)
    return "Could not generate insights right now. Keep tracking!"
  }
}

export const getAffirmation = async (): Promise<string> => {
  try {
    const prompt = `Generate a short, powerful "Mantra" for someone sealing a message in their Aevum Vault for their future self. It should be empowering and memorable. Keep it under 15 words.`
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
  } catch (error) {
    console.error("Error getting affirmation:", error)
    return "Believe in the person you are becoming."
  }
}

export const getGoalRiddle = async (goalName: string): Promise<string> => {
  try {
    const prompt = `Create a short, clever, and mysterious riddle about saving for "${goalName}". The answer should be "${goalName}". The riddle should be phrased as if from a stargazer reading the future in the stars. Keep it under 25 words. Example for "Vacation": "I am a journey paid in dimes, leading to sunnier climes. What am I?"`
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
  } catch (error) {
    console.error("Error getting goal riddle:", error)
    return `What dream are you reaching for among the stars?`
  }
}

export const getDailyVaultWhisper = async (goalName: string, userWish: string): Promise<string> => {
  try {
    const prompt = `You are a wise, mystical guardian of the Aevum Vault. A user is saving for "${goalName}". Their sealed wish for their future self is: "${userWish}". Generate a very short (under 20 words), unique, and inspiring daily "whisper" or reminder for them. The tone should be magical and encouraging, hinting at their future success.`
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
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
    let goalsPrompt = ""
    if (goals.length > 0) {
      const mainGoal = goals[0]
      goalsPrompt = `They are currently saving for "${mainGoal.name}" with a target of $${mainGoal.targetAmount}.`
    }

    const prompt = `A user is about to log an indulgent expense: $${expense.amount} for '${expense.category}' (${expense.occasion}) while feeling '${expense.emotion}'. ${goalsPrompt} Generate a gentle, non-judgmental, and thought-provoking question (under 25 words) to make them pause and reflect on this purchase. The tone should be supportive, not critical. Examples: "How does this purchase align with your bigger goals?" or "Will this bring you lasting joy?"`

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
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
    let specialConsideration = ""
    if (userProfile.currency === "INR") {
      if (category.toLowerCase().includes("general") && amount > 100) {
        specialConsideration = `This is over 100 INR at a general store, which might be a significant daily expense.`
      }
    }
    if (["hotel", "subway", "transport", "transportation"].includes(category.toLowerCase())) {
      specialConsideration += ` This is a travel-related expense.`
    }

    const goalText =
      goals.length > 0
        ? `They are saving for "${goals[0].name}" (Target: ${goals[0].targetAmount}, Saved: ${goals[0].savedAmount}).`
        : "They have not set a specific savings goal yet."

    const prompt = `You are Kai, a friendly AI money coach. User ${userProfile.name} is considering a purchase.
Details:
- Amount: ${amount} ${userProfile.currency}
- Category: ${category}
- User's primary goal: ${goalText}
- Context: ${specialConsideration}

Generate a short, gentle, and thought-provoking question (under 25 words) to help them reflect on this purchase. Is it necessary? How does it align with their goals?
The tone should be supportive and non-judgmental. Do not tell them what to do, just make them think.`

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
  } catch (error) {
    console.error("Error getting spending nudge:", error)
    return "Does this purchase bring you closer to your goals?" // A good fallback
  }
}

export const getWeeklySmsInsight = async (
  expenses: Expense[],
  moods: MoodEntry[],
  userProfile: UserProfile,
): Promise<string> => {
  const { name: userName, currency } = userProfile;
  const currencySymbol = currencySymbols[currency] || '$';

  if (expenses.length < 1 && moods.length < 1) {
    return `Hi ${userName}! Start logging your expenses and moods this week to get your first LifeLens SMS roundup. Stay mindful!`
  }
  try {
    // Summarize expenses by category to reduce prompt length and improve stability
    const expensesByCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const expenseSummary = Object.entries(expensesByCategory)
        .map(([cat, total]) => `${cat}: ${currencySymbol}${total.toFixed(2)}`)
        .join(', ');
    
    // Summarize moods by count for more detailed context
    const moodCounts = moods.reduce((acc, m) => {
        acc[m.mood] = (acc[m.mood] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const moodSummary = Object.entries(moodCounts)
        .map(([mood, count]) => `${mood} (${count}x)`)
        .join(', ');

    const prompt = `Generate a concise, friendly, and insightful weekly summary message for a user named ${userName}, as if it were an SMS. The message should be under 40 words.
    Data from last 7 days:
    - Expense Totals by Category: ${expenseSummary || "None logged."}
    - Moods Logged: ${moodSummary || "None logged."}
    Summarize their week's spending and mood trend in a positive and encouraging tone. Highlight one interesting connection if possible, like if high spending on "Shopping" correlates with "Stressed" moods.`

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
  } catch (error) {
    console.error("Error getting weekly SMS insight:", error)
    return `Hey ${userName}, keep up the great work logging your week! Your insights are being prepared.`
  }
}

export const getPostPurchaseReassurance = async (
  expense: Omit<Expense, "id" | "date">,
  goal: FinancialGoal | null,
): Promise<string> => {
  try {
    let goalText = "your future goals"
    if (goal) {
      goalText = `your goal of getting a ${goal.name}`
    }
    const prompt = `A user just confirmed logging an indulgent expense of $${expense.amount} for ${expense.category}. Generate a very short (under 15 words), encouraging notification message that acknowledges their choice but gently reminds them of their bigger goals. Tone: supportive, non-judgmental. Example: "Logged! One step at a time towards ${goalText}. You got this!"`
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
  } catch (error) {
    console.error("Error getting post-purchase reassurance:", error)
    return "Expense logged. Keep your goals in mind!"
  }
}

export const getPirateRiddle = async (
  usedRiddles: string[] = [],
): Promise<{ question: string; options: string[]; answer: string }> => {
  try {
    const riddleTopics = [
      "saving money",
      "budgeting",
      "investing",
      "debt management",
      "compound interest",
      "emergency funds",
      "financial goals",
      "spending habits",
      "credit scores",
      "insurance",
      "retirement planning",
      "passive income",
      "risk management",
      "inflation",
      "diversification",
    ]

    const unusedTopics = riddleTopics.filter(
      (topic) => !usedRiddles.some((used) => used.toLowerCase().includes(topic.toLowerCase())),
    )

    const selectedTopic =
      unusedTopics.length > 0
        ? unusedTopics[Math.floor(Math.random() * unusedTopics.length)]
        : riddleTopics[Math.floor(Math.random() * riddleTopics.length)]

    const prompt = `Create a unique, clever, interesting, and short pirate-themed riddle about the financial concept of "${selectedTopic}". The riddle should subtly explain what the concept is and how it's useful. The tone should be adventurous and educational. Keep the riddle under 25 words. Make it different from these previously used ones: ${usedRiddles.join(", ")}. The answer should be a single word or a short two-word phrase. Also provide two plausible but incorrect answers.`

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The riddle question.",
            },
            answer: {
              type: Type.STRING,
              description: "The single-word or short-phrase answer to the riddle.",
            },
            options: {
              type: Type.ARRAY,
              description: "An array of 3 strings: the correct answer and two plausible incorrect answers.",
              items: { type: Type.STRING },
            },
          },
          required: ["question", "answer", "options"],
        },
      },
    })
    const parsed = JSON.parse(response.text)
    return { question: parsed.question, options: parsed.options, answer: parsed.answer }
  } catch (error) {
    console.error("Error getting pirate riddle:", error)
    // Fallback riddles with variety
    const fallbackRiddles = [
      {
        question: "I guard yer treasure but have no lock or key. The more ye give me, the richer ye'll be. What am I?",
        answer: "savings",
        options: ["chest", "savings", "debt"],
      },
      {
        question:
          "I grow without sunlight, multiply without breeding. Feed me regularly and I'll secure yer future's needing. What am I?",
        answer: "investment",
        options: ["investment", "parrot", "map"],
      },
      {
        question: "I'm a storm that sinks ships when ignored, but faced early, I'm easily conquered. What am I?",
        answer: "debt",
        options: ["kraken", "debt", "hurricane"],
      },
      {
        question:
          "I'm a plan for yer doubloons, dividing them fair. Without me, yer treasure vanishes into thin air. What am I?",
        answer: "budget",
        options: ["budget", "compass", "crew"],
      },
    ]
    return fallbackRiddles[Math.floor(Math.random() * fallbackRiddles.length)]
  }
}

export const getFinancialQuest = async (usedScenarios: string[] = []): Promise<Quest["data"]> => {
  try {
    const scenarios = [
      "investment risk vs reward",
      "emergency fund importance",
      "compound interest benefits",
      "debt consolidation",
      "insurance decisions",
      "retirement planning",
      "budgeting choices",
      "credit building",
      "inflation protection",
      "diversification strategies",
    ]

    const unusedScenarios = scenarios.filter(
      (scenario) => !usedScenarios.some((used) => used.toLowerCase().includes(scenario.toLowerCase())),
    )

    const selectedScenario =
      unusedScenarios.length > 0
        ? unusedScenarios[Math.floor(Math.random() * unusedScenarios.length)]
        : scenarios[Math.floor(Math.random() * scenarios.length)]

    const prompt = `Create a unique pirate-themed financial decision quest about "${selectedScenario}". Make it different from these previous scenarios: ${usedScenarios.join(", ")}. Provide a short "scenario" (under 40 words) where a pirate captain must make a choice that reflects this financial principle. Then, provide two "choices". Each choice should have a "text" description, an "isCorrect" boolean, and a "feedback" sentence explaining the financial lesson in pirate terms.`

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: {
              type: Type.STRING,
              description: "The short scenario for the financial decision.",
            },
            choices: {
              type: Type.ARRAY,
              description: "An array of two choice objects.",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "The text for the choice." },
                  isCorrect: {
                    type: Type.BOOLEAN,
                    description: "Whether this choice is the correct financial decision.",
                  },
                  feedback: { type: Type.STRING, description: "Feedback explaining the financial lesson." },
                },
                required: ["text", "isCorrect", "feedback"],
              },
            },
          },
          required: ["scenario", "choices"],
        },
      },
    })
    return JSON.parse(response.text)
  } catch (error) {
    console.error("Error getting financial quest:", error)
    // Enhanced fallback scenarios
    const fallbackScenarios = [
      {
        scenario:
          "Ye found a treasure map! It points to the 'Quicksand Quays' (high risk, high reward) or the 'Golden Gull Grotto' (low risk, modest reward). Where do ye seek yer fortune?",
        choices: [
          {
            text: "Quicksand Quays",
            isCorrect: false,
            feedback:
              "Ye lost yer boots in the muck! High-risk ventures can lead to great losses if ye're not prepared.",
          },
          {
            text: "Golden Gull Grotto",
            isCorrect: true,
            feedback: "A tidy sum! A guaranteed smaller gain is often better than a risky gamble.",
          },
        ],
      },
      {
        scenario:
          "A storm damaged yer ship! Ye can either use yer emergency chest of 500 doubloons for repairs, or borrow 500 doubloons at high interest from Blackbeard's Bank.",
        choices: [
          {
            text: "Use emergency chest",
            isCorrect: true,
            feedback: "Wise choice! Emergency funds save ye from costly debt when trouble strikes.",
          },
          {
            text: "Borrow from Blackbeard's Bank",
            isCorrect: false,
            feedback: "The interest will sink ye! Always use emergency funds before taking on debt.",
          },
        ],
      },
    ]
    return fallbackScenarios[Math.floor(Math.random() * fallbackScenarios.length)]
  }
}

export const getGameIntroStory = async (userName: string): Promise<string> => {
  try {
    const prompt = `You are Kai, the Genie of the Doubloon, a mystical guide trapped in a magical compass. Write a short, exciting opening story for a pirate captain named ${userName}. Explain that they've discovered a mysterious island where they can build a settlement. Their success depends on their real-world financial wisdom. Saving money in their life earns them 'Doubloons' to spend on the island. The goal is to build a thriving legacy and uncover the island's ultimate treasure. Keep it under 150 words and make it sound epic and adventurous.`
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
  } catch (error) {
    console.error("Error getting game intro story:", error)
    return `Ahoy, Captain ${userName}! Welcome to a land of untold riches and mystery. This island... it responds to yer real-world fortunes! The wiser ye are with yer coin in yer world, the more Doubloons ye'll have to spend here. Build a legacy, and uncover the ultimate treasure!`
  }
}

export const getWordHint = async (word: string): Promise<string> => {
  try {
    const prompt = `Generate a short, clever, pirate-themed hint for the financial term "${word}". The hint should guide the player without giving away the answer. Keep it under 15 words. Example for "BUDGET": "A captain's map for where the doubloons go."`
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })
    return cleanText(response.text)
  } catch (error) {
    console.error("Error getting word hint:", error)
    return "The winds ain't talkin' right now..."
  }
}

export const startChatSession = (userProfile: UserProfile, context: "general" | "game"): Chat => {
  let systemInstruction = `You are Kai, a professional and insightful financial assistant for ${userProfile.name}. Provide clear, actionable advice.`

  if (context === "game") {
    systemInstruction = `You are Kai, the Genie of the Doubloon, a mystical guide trapped in a magical compass. You are guiding a pirate captain, ${userProfile.name}, on a treasure island. Your tone is cryptic, fun, and pirate-themed (use 'ye', 'yer', 'ahoy', etc.). Give financial advice disguised as pirate wisdom. Help them with their quests but don't give direct answers easily.`
  } else {
    if (userProfile.age < 18) {
      systemInstruction = `You are Kai, a friendly and cool financial buddy for ${userProfile.name}, who is a teenager. Use emojis, keep it simple, and be super encouraging. You're here to help them learn about money in a fun way.`
    } else if (userProfile.age < 30) {
      systemInstruction = `You are Kai, a savvy and relatable financial assistant for ${userProfile.name}, who is a young adult. Your tone is modern, helpful, and clear. Avoid jargon and focus on practical steps.`
    }
  }

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: { systemInstruction },
  })
  return chat
}

export const parseSmsExpense = async (smsContent: string): Promise<{ amount: number; category: string } | null> => {
  try {
    const prompt = `Analyze the following financial transaction SMS and extract the expense details. The user wants to log this expense. Identify the total amount spent and suggest a relevant expense category.
SMS Content: "${smsContent}"`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: {
              type: Type.NUMBER,
              description: "The numerical transaction amount.",
            },
            category: {
              type: Type.STRING,
              description:
                "A suggested category from this list: Food, Transport, Shopping, Groceries, Bills, Entertainment, Health, General.",
            },
          },
          required: ["amount", "category"],
        },
      },
    })
    const json = JSON.parse(response.text)
    if (typeof json.amount === "number" && typeof json.category === "string") {
      return json
    }
    return null
  } catch (error) {
    console.error("Error parsing SMS expense:", error)
    return null
  }
}