require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
// Enable CORS for all routes. In a production environment, you would restrict this 
// to your frontend's domain for better security.
app.use(cors()); 
app.use(express.json()); // Allow the server to understand JSON request bodies.

// --- Gemini Setup ---
if (!process.env.API_KEY) {
  console.error("FATAL ERROR: API_KEY environment variable is not set.");
  process.exit(1); // Exit if the API key is not configured.
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- API Endpoint ---
app.post('/api/generate-insight', async (req, res) => {
  try {
    const { expenses, moods, userProfile } = req.body;

    // Basic validation to ensure the required data is present.
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
    
    // Send the generated text back to the frontend.
    res.json({ text: response.text });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "An error occurred while generating the insight." });
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`✅ LifeLens backend proxy is running on http://localhost:${port}`);
});
