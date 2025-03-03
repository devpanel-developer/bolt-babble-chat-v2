import { useEffect, useState, useRef } from "react";
import { useParams } from "@remix-run/react";
import { v4 as uuidv4 } from "uuid";
import { 
  getSocket, 
  joinRoom, 
  leaveRoom, 
  sendMessage, 
  onRoomData, 
  onUserJoined, 
  onUserLeft, 
  onNewMessage, 
  onError 
} from "~/utils/socket.client";
import type { ChatMessage, ChatRoom, User } from "~/types";
import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from "~/types";

export default function ChatRoom() {
  const params = useParams();
  const roomId = params.roomId || "";
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(true);
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState<SupportedLanguageCode>("en");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    getSocket();
    
    return () => {
      // Clean up when component unmounts
      if (user && roomId) {
        leaveRoom(roomId, user.id);
      }
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!user) return;

    const roomDataUnsubscribe = onRoomData((roomData) => {
      setRoom(roomData);
    });

    const userJoinedUnsubscribe = onUserJoined((newUser) => {
      setRoom((prevRoom) => {
        if (!prevRoom) return null;
        return {
          ...prevRoom,
          users: [...prevRoom.users, newUser]
        };
      });
    });

    const userLeftUnsubscribe = onUserLeft((userId) => {
      setRoom((prevRoom) => {
        if (!prevRoom) return null;
        return {
          ...prevRoom,
          users: prevRoom.users.filter(u => u.id !== userId)
        };
      });
    });

    const newMessageUnsubscribe = onNewMessage((newMessage) => {
      setRoom((prevRoom) => {
        if (!prevRoom) return null;
        return {
          ...prevRoom,
          messages: [...prevRoom.messages, newMessage]
        };
      });
    });

    const errorUnsubscribe = onError((err) => {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      roomDataUnsubscribe();
      userJoinedUnsubscribe();
      userLeftUnsubscribe();
      newMessageUnsubscribe();
      errorUnsubscribe();
    };
  }, [user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [room?.messages]);

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    const newUser: User = {
      id: uuidv4(),
      name: userName.trim(),
      language
    };

    setUser(newUser);
    joinRoom(roomId, newUser);
    setShowJoinModal(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !roomId) return;

    sendMessage(roomId, message.trim(), user);
    setMessage("");
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900">
      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">Join Chat Room</h2>
            
            {error && (
              <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your name"
              />
            </div>
            
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguageCode)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleJoinRoom}
              className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Join Chat
            </button>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <header className="border-b border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Chat Room: {roomId}
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user ? `${user.name} (${SUPPORTED_LANGUAGES[user.language as SupportedLanguageCode]})` : ""}
            </span>
            <button
              onClick={() => {
                if (user) {
                  leaveRoom(roomId, user.id);
                  setShowJoinModal(true);
                }
              }}
              className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Change User
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Users Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 md:block">
            <div className="p-4">
              <h2 className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">Users</h2>
              <ul className="space-y-2">
                {room?.users.map((u) => (
                  <li key={u.id} className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-800 dark:text-gray-200">{u.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({SUPPORTED_LANGUAGES[u.language as SupportedLanguageCode]})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 overflow-y-auto p-4">
              {room?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${msg.userId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 shadow ${
                      msg.userId === user?.id
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
                    }`}
                  >
                    <div className="mb-1 text-xs">
                      <span className="font-medium">{msg.userName}</span>
                      <span className="ml-2 opacity-75">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <p>{user ? msg.translations[user.language] || msg.originalText : msg.originalText}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Type in ${user ? SUPPORTED_LANGUAGES[user.language as SupportedLanguageCode] : "your language"}...`}
                  className="flex-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || !user}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 rounded-md bg-red-500 px-4 py-2 text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
