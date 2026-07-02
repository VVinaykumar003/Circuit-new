import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the window location if no API URL is provided
const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const socket = io(URL, {
  autoConnect: false, // We will manually connect it in App.tsx when the user is authenticated
});