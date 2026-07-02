import { io } from "socket.io-client";

// Use the backend URL from environment variables, with a fallback for local development.
const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export function connect() {
  const socket = io(URL, {
    transports: ["websocket"],
  });
  return socket;
}

export const socket = connect();