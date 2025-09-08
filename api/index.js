const { GoogleGenAI } = require('@google/genai');

// --- Gemini Setup ---
// This will fail safely if the API key isn't set in Vercel.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey });

// --- Unified API Handler for Vercel Serverless ---
module.exports = async (req, res) => {
  // Set CORS headers to allow requests from any origin
  // In a production app, you might restrict this to your frontend's domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }

  try {
    const { action, payload } = req.body;

    if (!action || !payload) {
      return res.status(400).json({ error: 'Missing action or payload' });
    }

    let result;

    // --- Action Router ---
    switch (action) {
      case 'getEmotionalSpendingInsight':
        const { expense } = payload;
        const insightPrompt = `A user just logged an expense.
            - Amount: ${expense.amount}
            - Category: ${expense.category}
            - Occasion: ${expense.occasion}
            - Feeling: ${expense.emotion}
            - Type: ${expense.isUseful ? 'Essential' : 'Indulgence'}
            Based on this, provide a short, single-sentence, empathetic, and insightful reflection (max 20 words). If it's an indulgence, be gentle and non-judgmental. If it's an essential, be affirming. Frame it as a wise, friendly observation. Example: "A small treat to brighten a stressful day is a form of self-care." or "Taking care of necessities is a victory in itself."`;
        const insightResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: insightPrompt });
        result = insightResponse.text;
        break;

      case 'getMindfulSpendingPrompt':
        const { goals } = payload;
        const goalInfo = goals.length > 0 ? `They are saving for: "${goals[0].name}" with a target of ${goals[0].targetAmount}.` : "They have not set a specific savings goal yet.";
        const mindfulPrompt = `A user is contemplating an indulgent (non-essential) purchase:
            - Amount: ${payload.expense.amount}
            - Category: ${payload.expense.category}
            - Occasion: ${payload.expense.occasion}
            - Feeling: ${payload.expense.emotion}
            ${goalInfo}
            Provide a short, non-judgmental, mindful question (max 25 words) to make them pause and reflect. It should connect the purchase to their feelings or goals. Frame it as a gentle, wise question from a friend. Examples: "Will this purchase bring you lasting joy, or just a fleeting moment?", "How does this align with your dream of a great vacation?", "Is there another way to soothe this feeling right now?"`;
        const mindfulResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: mindfulPrompt });
        result = mindfulResponse.text;
        break;
      
      case 'getPostPurchaseReassurance':
        const { goal } = payload;
        const reassuranceGoalInfo = goal ? `Remember your goal of "${goal.name}"! Every small saving adds up.` : "Setting a financial goal can make your journey even more rewarding.";
        const reassurancePrompt = `A user just made an indulgent purchase of ${payload.expense.amount} on ${payload.expense.category} while feeling ${payload.expense.emotion}. Provide a very short, kind, and reassuring message (max 15 words) that validates their choice but gently reminds them of mindfulness. ${reassuranceGoalInfo} Example: "Enjoy your treat! Let's get back on track with the next choice."`;
        const reassuranceResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: reassurancePrompt });
        result = reassuranceResponse.text;
        break;

      case 'getMoodTip':
        const moodPrompt = `A user is feeling ${payload.mood}. Provide a short, actionable, and encouraging tip (max 20 words) to help them manage this feeling. Frame it as a wise, friendly power-up. Example for Sad: "Listening to a favorite song can be a gentle lift for your spirits."`;
        const moodResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: moodPrompt });
        result = moodResponse.text;
        break;
      
      case 'getFinancialInsight':
        const expenseSummary = payload.expenses.map(e => `- ${e.amount} on ${e.category} (Feeling ${e.emotion}, ${e.isUseful ? 'Essential' : 'Indulgence'})`).join('\n');
        const financialInsightPrompt = `Based on this list of recent expenses, identify the single most interesting or impactful emotional spending pattern. Provide a concise, one-sentence insight (max 25 words).
            Expenses:
            ${expenseSummary}
            Example Insight: "It seems that shopping has been a go-to comfort during moments of stress."`;
        const financialInsightResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: financialInsightPrompt });
        result = financialInsightResponse.text;
        break;

      case 'parseSmsExpense':
        const smsPrompt = `
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
            "${payload.sms}"`;
        const smsResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: smsPrompt,
            config: { responseMimeType: 'application/json' },
        });
        const text = smsResponse.text.trim();
        result = text === 'null' ? null : JSON.parse(text);
        break;

      case 'getGoalRiddle':
        const riddlePrompt = `Create a short, clever, one-sentence riddle related to achieving a financial goal called "${payload.goalName}". The riddle should be inspiring and mysterious. Max 20 words.`;
        const riddleResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: riddlePrompt });
        result = riddleResponse.text;
        break;

      case 'getDailyVaultWhisper':
        const whisperPrompt = `A user is working towards a financial goal called "${payload.goalName}". They wrote this message to their future self: "${payload.userMessage}". 
            Based on their goal and message, provide a very short (10-15 words), encouraging, and slightly mysterious "whisper" to motivate them for the day. 
            Example: "The shores of [Goal Name] are closer than they appear. Keep rowing."`;
        const whisperResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: whisperPrompt });
        result = whisperResponse.text;
        break;

      case 'getAffirmation':
        const affirmationPrompt = `Generate a short, powerful, and positive financial affirmation. Max 15 words. Example: "I am a magnet for wealth and abundance."`;
        const affirmationResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: affirmationPrompt });
        result = affirmationResponse.text;
        break;
      
      case 'getWeeklySmsInsight':
        const weeklyPrompt = `Analyze the user's weekly data.
            User: ${payload.userProfile.name}, ${payload.userProfile.age} years old.
            Expenses: ${JSON.stringify(payload.expenses.map(e => ({ amount: e.amount, category: e.category, emotion: e.emotion })))}
            Moods: ${JSON.stringify(payload.moods.map(m => m.mood))}
            Provide a single, concise insight (max 20 words) that connects their spending to their mood. Be empathetic and constructive.`;
        const weeklyResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: weeklyPrompt });
        result = weeklyResponse.text;
        break;

      case 'getSpendingNudge':
        const nudgeGoalInfo = payload.goals.length > 0 ? `Their current top goal is "${payload.goals[0].name}" for ${payload.goals[0].targetAmount}.` : "They don't have a specific goal set yet.";
        const nudgePrompt = `A user, ${payload.userProfile.name}, is about to spend ${payload.amount} on ${payload.category}. ${nudgeGoalInfo}
            Provide a short, gentle, and thought-provoking question (max 20 words) to encourage mindful spending without being judgmental.`;
        const nudgeResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: nudgePrompt });
        result = nudgeResponse.text;
        break;
      
      case 'getPirateRiddle':
        const pirateRiddlePrompt = `You are a pirate riddle master. Create a new, unique financial riddle with a pirate theme. The riddle should NOT be one of these: [${payload.usedRiddles.join(', ')}].
            Provide the response in a valid JSON object with keys: "title", "question", "options" (an array of 3 strings, one is the correct answer), and "answer".`;
        const pirateRiddleResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: pirateRiddlePrompt,
            config: { responseMimeType: "application/json" },
        });
        result = JSON.parse(pirateRiddleResponse.text.trim());
        break;
      
      case 'getFinancialQuest':
        const questPrompt = `You are a wise old sea captain. Create a short, unique financial scenario quest with a pirate theme. The scenario should NOT be one of these: [${payload.usedScenarios.join(', ')}].
            Provide the response in a valid JSON object with keys: "title", "scenario", and "choices" (an array of 2 objects, each with "text", "isCorrect", and "feedback" keys).`;
        const questResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: questPrompt,
            config: { responseMimeType: "application/json" },
        });
        result = JSON.parse(questResponse.text.trim());
        break;

      case 'getWordHint':
        const hintPrompt = `Provide a short, one-sentence, clever hint for the financial term "${payload.word}". The hint should be themed for a pirate game.`;
        const hintResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: hintPrompt });
        result = hintResponse.text;
        break;

      case 'continueChat':
        const { userProfile, context, history, newMessage } = payload;
        const systemInstruction = context === 'game'
            ? `You are Kai, a wise and ancient pirate genie who offers cryptic but helpful advice about the island building game, "Pirate's Legacy". You have a mysterious and slightly mischievous personality. Keep responses concise and pirate-themed.`
            : `You are Kai, a friendly and empathetic AI financial assistant. Your goal is to help ${userProfile.name} (${userProfile.age}) understand their finances and emotions. Be supportive, non-judgmental, and provide clear, actionable advice. Use their name occasionally.`;
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
            history: history.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }))
        });
        const chatResponse = await chat.sendMessage({ message: newMessage });
        result = chatResponse.text;
        break;
        
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    res.status(200).json({ result });

  } catch (error) {
    console.error(`Error processing action "${req.body.action}":`, error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
};