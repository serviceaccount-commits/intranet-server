import { logger } from './logger';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import appConfig from '../config/appConfig';

const genAI = new GoogleGenerativeAI(appConfig.geminiAIApiKey);

export const EMBEDDING_MODEL = 'text-embedding-004';
export const EMBEDDING_DIMENSIONS = 768;

export type EmbeddingTask = 'document' | 'query';

const taskTypeMap: Record<EmbeddingTask, TaskType> = {
  document: TaskType.RETRIEVAL_DOCUMENT,
  query: TaskType.RETRIEVAL_QUERY,
};

/** Returns a single embedding vector for the given text using Gemini's
 *  text-embedding-004 model. Use task='document' at index time and
 *  task='query' when embedding a search query. */
export const getEmbedding = async (
  text: string,
  task: EmbeddingTask,
): Promise<number[]> => {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('getEmbedding called with empty text');
  }
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent({
      content: { role: 'user', parts: [{ text: trimmed }] },
      taskType: taskTypeMap[task],
    });
    return result.embedding.values;
  } catch (error) {
    logger.error('Error in getEmbedding:', error);
    throw error;
  }
};

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
