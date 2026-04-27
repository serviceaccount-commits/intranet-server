import { logger } from './logger';
import { GoogleGenerativeAI } from '@google/generative-ai';
import appConfig from '../config/appConfig';

const genAI = new GoogleGenerativeAI(appConfig.geminiAIApiKey);

export const generateArticleSynopsis = async (
  articleContent: string,
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a Senior Knowledge Base Manager for a Customer Support BPO. 
      Your task is to write a concise internal synopsis for the following article to be displayed to Customer Service Representatives (CSRs).

      The goal is to help the CSR instantly recognize if this article contains the solution to the customer on the line.

      **Guidelines:**
      1. **Structure:** The synopsis must consist of exactly two sentences, have between 40 to 70 words and no more than 500 characters.
         - **Sentence 1 (The Scenario):** Describe the specific customer complaint or question that triggers the need for this article. Start with "Use this guide when..." or "Relevant for customers asking about..."
         - **Sentence 2 (The Solution):** Summarize the specific procedure, script, or answer contained in the article.
      2. **Tone:** Professional, direct, and utility-focused. No marketing fluff. No rhetorical questions.
      3. **Constraint:** Do not speak to the customer ("You will find..."). Speak to the Agent ("This guide explains...").

      **Article Content:**
      \n\n${articleContent}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    logger.error('Error in generateArticleSynopsis:', error);
    throw error;
  }
};
