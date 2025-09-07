import { GoogleGenAI } from "@google/genai";

// As per instructions, the API key must be obtained exclusively from the environment variable.
// This variable is assumed to be pre-configured and accessible.
if (!process.env.API_KEY) {
  // In a real production app, you might want to throw an error or handle this more gracefully.
  // For this context, a console error is sufficient to indicate a configuration problem.
  console.error("API_KEY environment variable not set. Please ensure it's available in your environment.");
}

// Initialize the Google AI client using the apiKey from environment variables
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
