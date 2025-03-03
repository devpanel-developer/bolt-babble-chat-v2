import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage, ChatRoom, User } from "~/types";
import { translateMessage } from "./translation.server";

let io: Server | null = null;
const chatRooms = new Map<string, ChatRoom>();

export function initSocketServer(httpServer: HttpServer) {
  if (io) return io;

  io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Join a chat room
    socket.on("join-room", ({ roomId, user }: { roomId: string; user: User }) => {
      // Create room if it doesn't exist
      if (!chatRooms.has(roomId)) {
        chatRooms.set(roomId, {
          id: roomId,
          name: `Chat Room ${roomId}`,
          messages: [],
          users: []
        });
      }

      const room = chatRooms.get(roomId)!;
      
      // Add user to room
      room.users.push(user);
      socket.join(roomId);

      // Send room data to the user
      socket.emit("room-data", room);
      
      // Notify others that user joined
      socket.to(roomId).emit("user-joined", user);
    });

    // Leave a chat room
    socket.on("leave-room", ({ roomId, userId }: { roomId: string; userId: string }) => {
      const room = chatRooms.get(roomId);
      if (room) {
        room.users = room.users.filter(user => user.id !== userId);
        socket.to(roomId).emit("user-left", userId);
        socket.leave(roomId);
      }
    });

    // New message
    socket.on("send-message", async ({ roomId, message, user }: { 
      roomId: string; 
      message: string; 
      user: User 
    }) => {
      const room = chatRooms.get(roomId);
      if (!room) return;

      try {
        // Get all unique languages in the room
        const languages = [...new Set(room.users.map(u => u.language))];
        
        // Translate message to all languages
        const translations = await translateMessage(message, user.language, languages);
        
        const chatMessage: ChatMessage = {
          id: uuidv4(),
          userId: user.id,
          userName: user.name,
          originalText: message,
          translations,
          timestamp: Date.now()
        };

        // Add message to room
        room.messages.push(chatMessage);
        
        // Broadcast message to all users in the room
        io?.to(roomId).emit("new-message", chatMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
      // Find and remove user from all rooms they were in
      chatRooms.forEach((room, roomId) => {
        const userIndex = room.users.findIndex(user => user.id === socket.id);
        if (userIndex !== -1) {
          const userId = room.users[userIndex].id;
          room.users.splice(userIndex, 1);
          socket.to(roomId).emit("user-left", userId);
        }
      });
    });
  });

  return io;
}

export function getSocketIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized. Please call initSocketServer first.");
  }
  return io;
}

export function createChatRoom(name: string = ""): string {
  const roomId = uuidv4();
  chatRooms.set(roomId, {
    id: roomId,
    name: name || `Chat Room ${roomId}`,
    messages: [],
    users: []
  });
  return roomId;
}

export function getChatRoom(roomId: string): ChatRoom | undefined {
  return chatRooms.get(roomId);
}
