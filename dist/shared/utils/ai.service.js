"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArticleSynopsis = exports.getEmbedding = void 0;
const generative_ai_1 = require("@google/generative-ai");
const BusinessLogicError_1 = require("../errors/BusinessLogicError");
const appConfig_1 = __importDefault(require("../config/appConfig"));
const genAI = new generative_ai_1.GoogleGenerativeAI(appConfig_1.default.geminiAIApiKey);
const EMBEDDING_MODEL = 'text-embedding-004';
/**
 * Converts HTML content to clean text and generates a vector embedding.
 * @param htmlContent The HTML string from CKEditor.
 * @returns A promise that resolves to the vector embedding.
 */
const getEmbedding = async (text) => {
    // The existing cleanup logic will normalize all whitespace into single spaces.
    const cleanText = text.trim();
    if (cleanText === '') {
        throw new BusinessLogicError_1.BusinessLogicError('Invalid input format');
    }
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(cleanText);
    const embedding = result.embedding;
    return embedding.values;
};
exports.getEmbedding = getEmbedding;
const generateArticleSynopsis = async (articleContent) => {
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
    }
    catch (error) {
        console.error('Error in generateArticleSynopsis:', error);
        throw error;
    }
};
exports.generateArticleSynopsis = generateArticleSynopsis;
//# sourceMappingURL=ai.service.js.map