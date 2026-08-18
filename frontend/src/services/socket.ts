import { io } from "socket.io-client";

const URL = import.meta.env.VITE_BACKEND_PROD_URL || import.meta.env.VITE_BACKEND_LOCAL_URL;


export const socket = io(URL, {
  autoConnect: false, // important for control
});