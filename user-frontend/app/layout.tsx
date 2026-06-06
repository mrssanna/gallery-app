import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeRegistry } from "./ThemeRegistry";
import { QueryProvider } from "./QueryProvider";

export const metadata: Metadata = {
  title: "My Gallery",
  description: "User gallery application",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <QueryProvider>
          <ThemeRegistry>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
