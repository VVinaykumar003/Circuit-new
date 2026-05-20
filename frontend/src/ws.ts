import { io } from "socket.io-client";

export function connect() {
  const socket = io("http://localhost:5000", {
    transports: ["websocket"],
  });
  return socket;
}

export const socket = connect();