import { io } from "socket.io-client";

let socket;

export const initializeSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket:", socket.id);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error(
      "Socket not initialized. Call `initializeSocket()` before using `getSocket()`."
    );
  }
  return socket;
};
