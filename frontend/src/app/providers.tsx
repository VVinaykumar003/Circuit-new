import React, { type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/auth/authProvider";
import { ThemeProvider } from "@/context/theme-provider";
import { NotificationProvider } from "@/context/NotificationContext";
import ScrollToTop from "@/components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <HelmetProvider>
          <ThemeProvider>
            <NotificationProvider>
              <QueryClientProvider client={queryClient}>
                {children}
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
              </QueryClientProvider>
            </NotificationProvider>
          </ThemeProvider>
        </HelmetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
