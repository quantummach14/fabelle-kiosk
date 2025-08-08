// socket.ts
import { io, Socket } from "socket.io-client";

export let socket: Socket | null = null;

interface ConnectSocketProps {
  Run_Socket: () => void;
}

export const connectSocket = ({ Run_Socket }: ConnectSocketProps): void => {
  socket = io('https://fabelle-stage.pep1.in/fabelle-backend', {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 3,
    transports: ["websocket"],
    upgrade: false,
    query: {
      version: "v1",
      "socket-key": `asdfghjkl`, // you may want to replace this with a dynamic key
    },
  });

  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
  });

  socket.on("connect_error", (error: Error) => {
    Run_Socket();
    console.error("Socket Connection error:", error.message);
  });

  socket.on("on_payment_response", (data: unknown) => {
    console.log("Payment response:", data);
  });
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
