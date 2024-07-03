"use client";
import { SessionProvider } from "next-auth/react";
import {NextUIProvider} from "@nextui-org/react";
import { Toaster } from 'sonner'
export const AuthProvider = ({ children }) => {
  return ( 
  <NextUIProvider>
    <SessionProvider>{children}
    <Toaster richColors /></SessionProvider></NextUIProvider>)
};
