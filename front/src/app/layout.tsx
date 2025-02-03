"use client"
import '@/styles/globals.css';
import { MainProvider } from '@/components/providers/MainProvider';
import { MainLayout } from '@/components/templates/MainLayout';
import { ReactNode } from 'react';
import {QueryClient,QueryClientProvider} from "react-query";
import Toaster from "react-hot-toast";

interface RootLayoutProps {
  children: ReactNode;
}
const queryClient = new QueryClient();

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
          <QueryClientProvider client={queryClient}>
            <html lang="en">
            <body suppressHydrationWarning>
            <MainProvider>
              <MainLayout>
                  <main>{children}</main>
              </MainLayout>
            </MainProvider>
            </body>
            </html>
          </QueryClientProvider>
  );
};

export default RootLayout;
