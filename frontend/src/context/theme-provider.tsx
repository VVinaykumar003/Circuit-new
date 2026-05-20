import { useEffect, useState,  } 
from "react";
import type { ReactNode } from "react";
import { ThemeContext,type  Theme } from "./theme-context";

interface Props {
  children: ReactNode;
}



export function ThemeProvider({ children }: Props) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "corporate";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}