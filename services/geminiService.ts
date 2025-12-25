import { GoogleGenAI } from "@google/genai";
import { LifeState } from '../types';

export const analyzeLifeIndex = async (state: LifeState): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure your environment.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare a condensed summary for the prompt
  const summary = {
    totalIndex: state.history.length > 0 ? state.history[state.history.length - 1].totalScore : 0,
    categories: Object.values(state.categories).map(c => ({
      name: c.label,
      points: c.score,
      components: c.metrics.map(m => `${m.name}: ${m.value} ${m.unit} (Ref: ${m.target})`).join(', ')
    }))
  };

  const prompt = `
    You are the Chief Life Officer and a Financial Analyst for a "Life Index" (an uncapped, weighted index similar to the S&P 500, but for personal life).
    
    Current Market Data:
    ${JSON.stringify(summary, null, 2)}
    
    Context:
    - This index is UNBOUNDED (no max score). It grows as the user accumulates value in Assets, Health, Cognition, and Contribution.
    - Each component is weighted: "Ref" is the value required to generate 100 index points.
    
    Task:
    1. Provide a "Market Report". Is the index Bullish (growing) or Bearish?
    2. Analyze the portfolio diversity (Balance between the 4 sectors).
    3. Identify "Undervalued Assets" (areas with low points relative to others).
    4. Give 3 "Buy" recommendations (high-ROI actions) to boost the index.
    
    Style: Financial news anchor meets Stoic philosopher. High energy, metaphors about liquidity/dividends/compound interest. Keep it under 250 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Analysis currently unavailable due to market volatility (API Error).";
  }
};