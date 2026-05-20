// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect } from "react";
import socketService from "../services/socketService";
import { useTenant } from "./TenantContext";

// The context will provide the single instance of our socket service.
const SocketContext = createContext<typeof socketService | null>(null);

/**
 * Custom hook to access the socket service.
 * Throws an error if used outside of a SocketProvider.
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

/**
 * The SocketProvider is responsible for managing the socket connection lifecycle.
 * It connects when the component mounts with a valid user (rid and token)
 * and disconnects when it unmounts.
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { rid } = useTenant();
  // The token is specific to the user type (admin or staff).
  // This provider will be used in a layout that serves both.
  const token = rid
    ? localStorage.getItem(`adminToken_${rid}`) || localStorage.getItem(`staffToken_${rid}`)
    : null;

  useEffect(() => {
    // Only attempt to connect if we have the necessary credentials.
    if (rid && token) {
      console.log(`[SocketProvider] RID (${rid}) and Token found. Connecting socket.`);
      socketService.connect(rid, token);
    } else {
      console.log("[SocketProvider] RID or Token missing. Socket not connected.");
    }

    // The cleanup function from useEffect will run when the provider unmounts.
    // This is the perfect place to disconnect the socket.
    return () => {
      console.log("[SocketProvider] Unmounting. Disconnecting socket.");
      socketService.disconnect();
    };
  }, [rid, token]); // Re-run the effect if rid or token changes.

  // The provider passes down the single instance of the socketService.
  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
};
