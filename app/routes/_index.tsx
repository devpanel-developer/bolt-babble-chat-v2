import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";

export const meta: MetaFunction = () => {
  return [
    { title: "Multilingual Chat" },
    { name: "description", content: "Real-time multilingual chat application" },
  ];
};

export default function Index() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const createNewChatRoom = () => {
    setIsCreating(true);
    // Generate a unique room ID
    const roomId = uuidv4();
    // Navigate to the new room
    setTimeout(() => {
      navigate(`/chat/${roomId}`);
    }, 500);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Multilingual Chat
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Chat with anyone in any language - messages are translated in real-time
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={createNewChatRoom}
            disabled={isCreating}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isCreating ? (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              "Create New Chat Room"
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">or</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="roomId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Join an existing room
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="roomId"
                placeholder="Enter room ID"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={() => {
                  const input = document.getElementById('roomId') as HTMLInputElement;
                  if (input.value) {
                    navigate(`/chat/${input.value}`);
                  }
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Messages are automatically translated to your preferred language.
          </p>
        </div>
      </div>
    </div>
  );
}
