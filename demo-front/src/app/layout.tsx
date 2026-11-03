import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntdApp } from "antd";
import { AppThemeProvider } from "@/components/app-theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biblioteca Demo",
  description: "Demo de biblioteca: catálogo público y backoffice",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AntdRegistry>
            <AppThemeProvider>
              <AntdApp>{children}</AntdApp>
            </AppThemeProvider>
          </AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
