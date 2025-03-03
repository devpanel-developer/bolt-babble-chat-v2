export interface User {
  id: string;
  name: string;
  language: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  originalText: string;
  translations: Record<string, string>;
  timestamp: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  messages: ChatMessage[];
  users: User[];
}

export const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi"
};

export type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES;
