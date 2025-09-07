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
if (!process.env.API_KEY) {
  // This will cause the function to fail safely if the API key isn't set in Vercel
  console.error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- API Endpoint ---
app.post('/api/generate-insight', async (req, res) => {
  try {
    // Re-check for API key on each request in a serverless context
    if (!process.env.API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
    }
      
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
