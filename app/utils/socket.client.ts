import { io, Socket } from "socket.io-client";
import type { ChatMessage, ChatRoom, User } from "~/types";

let socket: Socket | null = null;

export function initSocketClient(): Socket {
  if (!socket) {
    // Connect to the server
    socket = io();
  }
  return socket;
}

export function getSocket(): Socket {
  if (!socket) {
    return initSocketClient();
  }
  return socket;
}

export function joinRoom(roomId: string, user: User): void {
  const socket = getSocket();
  socket.emit("join-room", { roomId, user });
}

export function leaveRoom(roomId: string, userId: string): void {
  const socket = getSocket();
  socket.emit("leave-room", { roomId, userId });
}

export function sendMessage(roomId: string, message: string, user: User): void {
  const socket = getSocket();
  socket.emit("send-message", { roomId, message, user });
}

export function onRoomData(callback: (room: ChatRoom) => void): () => void {
  const socket = getSocket();
  socket.on("room-data", callback);
  return () => {
    socket.off("room-data", callback);
  };
}

export function onUserJoined(callback: (user: User) => void): () => void {
  const socket = getSocket();
  socket.on("user-joined", callback);
  return () => {
    socket.off("user-joined", callback);
  };
}

export function onUserLeft(callback: (userId: string) => void): () => void {
  const socket = getSocket();
  socket.on("user-left", callback);
  return () => {
    socket.off("user-left", callback);
  };
}

export function onNewMessage(callback: (message: ChatMessage) => void): () => void {
  const socket = getSocket();
  socket.on("new-message", callback);
  return () => {
    socket.off("new-message", callback);
  };
}

export function onError(callback: (error: { message: string }) => void): () => void {
  const socket = getSocket();
  socket.on("error", callback);
  return () => {
    socket.off("error", callback);
  };
}
