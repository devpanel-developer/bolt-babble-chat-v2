import React from 'react';
import type { ChatMessage, SupportedLanguageCode } from '~/types';
import { SUPPORTED_LANGUAGES } from '~/types';

interface ChatMessageProps {
  message: ChatMessage;
  userLanguage: string;
  isCurrentUser: boolean;
}

export default function ChatMessageComponent({ message, userLanguage, isCurrentUser }: ChatMessageProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get the translated message in the user's language, or fall back to original
  const displayText = message.translations[userLanguage] || message.originalText;

  return (
    <div className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-lg px-4 py-2 shadow ${
          isCurrentUser
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
        }`}
      >
        <div className="mb-1 text-xs">
          <span className="font-medium">{message.userName}</span>
          <span className="ml-2 opacity-75">{formatTimestamp(message.timestamp)}</span>
        </div>
        <p>{displayText}</p>
      </div>
    </div>
  );
}
