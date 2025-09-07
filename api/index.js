require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// --- Middleware ---
// Vercel's environment will handle CORS, but it's good practice for local dev
app.use(cors()); 
app.use(express.json());

// --- Gemini Setup ---
// Safely initialize the Gemini client.
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

// --- API Endpoint ---
app.post('/api/generate-insight', async (req, res) => {
  // Check if the AI client is available on each request.
  if (!ai) {
    return res.status(500).json({ error: 'Server configuration error: The AI client is not initialized. Please check the API_KEY.' });
  }

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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    res.json({ text: response.text });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "An error occurred while generating the insight." });
  }
});

// Export the app for Vercel to use
module.exports = app;
