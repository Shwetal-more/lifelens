// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes (adjust in production)
app.use(express.json()); // Parse JSON bodies

// --- Gemini Setup ---
if (!process.env.API_KEY) {
  console.error("FATAL ERROR: API_KEY environment variable is not set.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Test Endpoint ---
app.get('/api/hello', (req, res) => {
  res.json({ ok: true, msg: 'Hello from LifeLens backend' });
});

// --- Generate Insight Endpoint ---
app.post('/api/generate-insight', async (req, res) => {
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

// --- Vercel Serverless Export ---
module.exports = (req, res) => {
  app(req, res);
};

// --- Start server locally if not on Vercel ---
if (require.main === module) {
  app.listen(port, () => {
    console.log(`✅ LifeLens backend running on http://localhost:${port}`);
  });
}
