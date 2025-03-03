import OpenAI from "openai";
import type { SupportedLanguageCode } from "~/types";

// Initialize OpenAI client
// In production, you would use environment variables for the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development",
});

export async function translateMessage(
  text: string,
  sourceLanguage: string,
  targetLanguages: string[]
): Promise<Record<string, string>> {
  // For development/demo purposes, we'll simulate translations
  // In production, you would use the OpenAI API
  
  if (process.env.NODE_ENV === "production" && process.env.OPENAI_API_KEY) {
    return translateWithOpenAI(text, sourceLanguage, targetLanguages);
  } else {
    return simulateTranslations(text, sourceLanguage, targetLanguages);
  }
}

async function translateWithOpenAI(
  text: string,
  sourceLanguage: string,
  targetLanguages: string[]
): Promise<Record<string, string>> {
  const translations: Record<string, string> = {
    [sourceLanguage]: text, // Original text in source language
  };

  // Translate to each target language
  for (const targetLang of targetLanguages) {
    // Skip if it's the source language
    if (targetLang === sourceLanguage) continue;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a translator. Translate the following text from ${sourceLanguage} to ${targetLang}. Provide only the translated text without explanations.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
      });

      const translatedText = response.choices[0]?.message?.content?.trim() || text;
      translations[targetLang] = translatedText;
    } catch (error) {
      console.error(`Translation error for ${targetLang}:`, error);
      translations[targetLang] = `[Translation error] ${text}`;
    }
  }

  return translations;
}

function simulateTranslations(
  text: string,
  sourceLanguage: string,
  targetLanguages: string[]
): Record<string, string> {
  const translations: Record<string, string> = {
    [sourceLanguage]: text, // Original text in source language
  };

  // Simple simulation of translations for development
  for (const targetLang of targetLanguages) {
    if (targetLang === sourceLanguage) continue;
    
    // Add a prefix to simulate translation
    translations[targetLang] = `[${targetLang}] ${text}`;
  }

  return translations;
}
