import { createContext } from "react";
import type { AuthContextType } from "@/type/UserAuth";

export const AuthContext = createContext<AuthContextType | null>(null);