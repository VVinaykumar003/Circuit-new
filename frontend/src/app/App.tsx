import React, { useEffect } from "react";
import AppRoutes from "./routes";
import { socket } from "@/socket";
import { useAuth } from "@/auth/useAuth";

export default function App() {
  const { auth } = useAuth();

  useEffect(() => {
    if (auth.slug && auth.user?.userId) {
      socket.emit("join_organization", {
        slug: auth.slug,
        userId: auth.user.userId,
      });
    }

    return () => {
      socket.off("join_organization");
    };
  }, [auth.slug, auth.user?.userId]);

  return <AppRoutes />;
}
