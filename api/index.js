require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// --- Middleware ---
app.use(cors()); 
app.use(express.json({ limit: '10mb' })); // Increase limit for chat history

// --- Gemini Setup ---
let ai = null;
if (process.env.API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
  }
} else {
  console.error("API_KEY environment variable is not set. API calls will fail.");
}

const checkAi = (res) => {
    if (!ai) {
        res.status(500).json({ error: 'Server configuration error: The AI client is not initialized. Please check the API_KEY.' });
        return false;
    }
    return true;
}

// --- API Endpoints ---
app.post('/api/generate-insight', async (req, res) => {
  if (!checkAi(res)) return;
  try {
    const { expenses, moods, userProfile } = req.body;
    if (!expenses || !moods || !userProfile) {
      return res.status(400).json({ error: 'Missing required data: expenses, moods, and userProfile must be provided.' });
    }
    const prompt = `Analyze the user's weekly data.
    User: ${userProfile.name}, ${userProfile.age} years old.
    Expenses: ${JSON.stringify(expenses.map(e => ({ amount: e.amount, category: e.category, emotion: e.emotion })))}
    Moods: ${JSON.stringify(moods.map(m => m.mood))}
    
    Provide a single, concise insight (max 20 words) that connects their spending to their mood. Be empathetic and constructive.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Error calling Gemini API for insight:", error);
    res.status(500).json({ error: "An error occurred while generating the insight." });
  }
});

app.post('/api/generate-text', async (req, res) => {
  if (!checkAi(res)) return;
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Error in /api/generate-text:", error);
    res.status(500).json({ error: "An error occurred during text generation." });
  }
});

app.post('/api/generate-json', async (req, res) => {
  if (!checkAi(res)) return;
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Error in /api/generate-json:", error);
    res.status(500).json({ error: "An error occurred during JSON generation." });
  }
});

app.post('/api/chat', async (req, res) => {
    if (!checkAi(res)) return;
    try {
        const { systemInstruction, history, newMessage } = req.body;
        if (!history || typeof newMessage === 'undefined') {
            return res.status(400).json({ error: 'Missing required data: history and newMessage are required.' });
        }

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: systemInstruction },
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }))
        });

        const response = await chat.sendMessage({ message: newMessage });
        res.json({ text: response.text });
    } catch (error) {
        console.error("Error in /api/chat:", error);
        res.status(500).json({ error: "An error occurred during chat processing." });
    }
});

// Export the app for Vercel
module.exports = app;
