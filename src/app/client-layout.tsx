"use client"

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { fontSans } from "@/config/fonts";
import { ThemeProvider } from "@/components/theme-provider"
import { PageProvider } from "@/contexts/page-context";
import { CartProvider } from "@/contexts/cart-context";

import "@/styles/globals.css";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          
          console.log('Service Worker registrado com sucesso:', registration);
          
        } catch (error) {
          console.error('Falha ao registrar Service Worker:', error);
        }
      }
    };

    registerServiceWorker();
  }, []);
  
  return (
    <html lang="pt-BR" className={`${fontSans.className}`}>
      <body>
        <TRPCReactProvider>
          <SessionProvider>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="light" 
              enableSystem 
              disableTransitionOnChange
            >
              <PageProvider>
                <CartProvider>
                  {children}
                </CartProvider>
              </PageProvider>
            </ThemeProvider>
          </SessionProvider>
        </TRPCReactProvider>
        <Sonner />
        <Toaster />
      </body>
    </html>
  );
}