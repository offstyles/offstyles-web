import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Offstyles Database",
  description: "Web interface for the Offstyles times database",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
            <footer className="border-t py-4">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Offstyles Database
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'