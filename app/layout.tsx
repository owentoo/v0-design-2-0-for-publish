import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "900"],
})

export const metadata: Metadata = {
  title: "Rush Order Tees - Custom T-Shirt Design",
  description: "Create custom t-shirts with our design studio. Upload artwork, create with AI, or browse our catalog.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans bg-gradient-to-br from-blue-800 via-purple-900 to-pink-800">{children}</body>
    </html>
  )
}
